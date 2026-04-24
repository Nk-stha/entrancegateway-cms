#!/usr/bin/env bash
# ============================================================================
#  EntranceGateway CMS — Production Deployment Script
# ============================================================================
#  Usage:
#    ./deploy.sh                    # Full deploy (pull → install → build → restart)
#    ./deploy.sh --build-only       # Build without restarting
#    ./deploy.sh --restart-only     # Restart PM2 without rebuilding
#    ./deploy.sh --setup            # First-time server setup
#    ./deploy.sh --rollback         # Rollback to previous build
#    ./deploy.sh --status           # Check application status
#    ./deploy.sh --logs             # Tail PM2 logs
#    ./deploy.sh --help             # Show this help
#
#  Environment:
#    Expects a .env.production file in the project root (or .env).
#    Required variables: API_BASE_URL, NEXT_PUBLIC_API_URL
#
#  Prerequisites:
#    - Node.js >= 18.x
#    - npm or pnpm
#    - PM2 (installed globally)
#    - Git
# ============================================================================

set -euo pipefail

# ─── Configuration ──────────────────────────────────────────────────────────

APP_NAME="entrancegateway-cms"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-3000}"
NODE_ENV="production"
PM2_INSTANCES="${PM2_INSTANCES:-2}"             # Number of PM2 cluster instances
BACKUP_DIR="${APP_DIR}/.deploy-backups"
MAX_BACKUPS=5                                    # Keep last N backups
LOG_FILE="${APP_DIR}/deploy.log"
HEALTH_CHECK_URL="http://localhost:${PORT}"
HEALTH_CHECK_TIMEOUT=30                          # Seconds to wait for health check
PACKAGE_MANAGER=""                               # Auto-detected below

# CI mode: auto-detected from CI env var or --ci flag
IS_CI="${CI:-false}"

# ─── Colors & Formatting ───────────────────────────────────────────────────
# Disable colors in CI (cleaner logs)
if [ "$IS_CI" = "true" ]; then
    RED='' GREEN='' YELLOW='' BLUE='' CYAN='' BOLD='' NC=''
else
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    BOLD='\033[1m'
    NC='\033[0m'
fi

# ─── Utility Functions ─────────────────────────────────────────────────────

timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

log() {
    local level="$1"
    shift
    local msg="$*"
    local color=""

    case "$level" in
        INFO)    color="${GREEN}" ;;
        WARN)    color="${YELLOW}" ;;
        ERROR)   color="${RED}" ;;
        STEP)    color="${CYAN}" ;;
        *)       color="${NC}" ;;
    esac

    echo -e "${color}[$(timestamp)] [${level}]${NC} ${msg}"
    echo "[$(timestamp)] [${level}] ${msg}" >> "${LOG_FILE}" 2>/dev/null || true

    # GitHub Actions annotations
    if [ "$IS_CI" = "true" ]; then
        case "$level" in
            ERROR) echo "::error::${msg}" ;;
            WARN)  echo "::warning::${msg}" ;;
        esac
    fi
}

step() {
    echo ""
    if [ "$IS_CI" = "true" ]; then
        echo "::group::$1"
    fi
    log STEP "━━━ $1 ━━━"
}

end_step() {
    if [ "$IS_CI" = "true" ]; then
        echo "::endgroup::"
    fi
}

die() {
    log ERROR "$1"
    # Dump last 30 lines of deploy.log on failure in CI
    if [ "$IS_CI" = "true" ] && [ -f "${LOG_FILE}" ]; then
        echo ""
        echo "::group::📋 Deploy log (last 30 lines)"
        tail -30 "${LOG_FILE}" 2>/dev/null || true
        echo "::endgroup::"
    fi
    exit 1
}

confirm() {
    local prompt="$1"
    # Auto-confirm in CI mode
    if [ "$IS_CI" = "true" ]; then
        log INFO "[CI] Auto-confirming: ${prompt}"
        return 0
    fi
    read -r -p "$(echo -e "${YELLOW}${prompt} [y/N]: ${NC}")" response
    [[ "$response" =~ ^[Yy]$ ]]
}

# ─── Pre-flight Checks ─────────────────────────────────────────────────────

detect_package_manager() {
    if [ -f "${APP_DIR}/pnpm-lock.yaml" ] && command -v pnpm &>/dev/null; then
        PACKAGE_MANAGER="pnpm"
    elif [ -f "${APP_DIR}/package-lock.json" ]; then
        PACKAGE_MANAGER="npm"
    elif command -v pnpm &>/dev/null; then
        PACKAGE_MANAGER="pnpm"
    else
        PACKAGE_MANAGER="npm"
    fi
    log INFO "Package manager: ${BOLD}${PACKAGE_MANAGER}${NC}"
}

check_prerequisites() {
    step "Checking prerequisites"

    # Node.js
    if ! command -v node &>/dev/null; then
        die "Node.js is not installed. Install Node.js >= 18.x"
    fi
    local node_version
    node_version=$(node -v | sed 's/v//')
    local node_major
    node_major=$(echo "$node_version" | cut -d. -f1)
    if [ "$node_major" -lt 18 ]; then
        die "Node.js >= 18.x required (found v${node_version})"
    fi
    log INFO "Node.js: v${node_version} ✓"

    # Package manager
    detect_package_manager

    # PM2
    if ! command -v pm2 &>/dev/null; then
        log WARN "PM2 not found. Installing globally..."
        npm install -g pm2 || die "Failed to install PM2"
    fi
    log INFO "PM2: $(pm2 -v) ✓"

    # Git
    if ! command -v git &>/dev/null; then
        die "Git is not installed"
    fi
    log INFO "Git: $(git --version | awk '{print $3}') ✓"

    # Environment file
    if [ -f "${APP_DIR}/.env.production" ]; then
        log INFO "Environment: .env.production ✓"
    elif [ -f "${APP_DIR}/.env" ]; then
        log WARN "Using .env (consider creating .env.production for production)"
    else
        log WARN "No .env file found — build may fail if env vars are not set"
    fi
}

check_env_vars() {
    step "Validating environment variables"

    local env_file=""
    if [ -f "${APP_DIR}/.env.production" ]; then
        env_file="${APP_DIR}/.env.production"
    elif [ -f "${APP_DIR}/.env" ]; then
        env_file="${APP_DIR}/.env"
    fi

    if [ -n "$env_file" ]; then
        # Check required variables
        local required_vars=("API_BASE_URL" "NEXT_PUBLIC_API_URL")
        local missing=()

        for var in "${required_vars[@]}"; do
            if ! grep -q "^${var}=" "$env_file" 2>/dev/null && [ -z "${!var:-}" ]; then
                missing+=("$var")
            fi
        done

        if [ ${#missing[@]} -gt 0 ]; then
            log WARN "Missing environment variables: ${missing[*]}"
            log WARN "These should be set in ${env_file} or exported in the shell"
        else
            log INFO "All required environment variables present ✓"
        fi
    fi
}

# ─── Git Operations ────────────────────────────────────────────────────────

pull_latest() {
    step "Pulling latest changes from Git"

    cd "${APP_DIR}"

    # Check for uncommitted changes
    if ! git diff --quiet HEAD 2>/dev/null; then
        log WARN "Uncommitted changes detected"
        if ! confirm "Stash changes and continue?"; then
            die "Aborted: uncommitted changes"
        fi
        git stash push -m "deploy-$(timestamp | tr ' :' '-')"
        log INFO "Changes stashed"
    fi

    local current_branch
    current_branch=$(git branch --show-current)
    log INFO "Current branch: ${BOLD}${current_branch}${NC}"

    git fetch --all --prune 2>&1 | while read -r line; do log INFO "  $line"; done
    git pull origin "${current_branch}" 2>&1 | while read -r line; do log INFO "  $line"; done

    local commit_hash
    commit_hash=$(git rev-parse --short HEAD)
    local commit_msg
    commit_msg=$(git log -1 --pretty=format:"%s")
    log INFO "HEAD: ${BOLD}${commit_hash}${NC} — ${commit_msg}"

    end_step
}

# ─── Backup ─────────────────────────────────────────────────────────────────

create_backup() {
    step "Creating backup of current build"

    if [ ! -d "${APP_DIR}/.next" ]; then
        log WARN "No existing .next build to backup — skipping"
        return 0
    fi

    mkdir -p "${BACKUP_DIR}"

    local backup_name
    backup_name="backup-$(date '+%Y%m%d-%H%M%S')-$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
    local backup_path="${BACKUP_DIR}/${backup_name}"

    cp -r "${APP_DIR}/.next" "${backup_path}"
    log INFO "Backup created: ${backup_name}"

    # Prune old backups
    local backup_count
    backup_count=$(ls -1d "${BACKUP_DIR}"/backup-* 2>/dev/null | wc -l)
    if [ "$backup_count" -gt "$MAX_BACKUPS" ]; then
        local to_delete=$((backup_count - MAX_BACKUPS))
        ls -1d "${BACKUP_DIR}"/backup-* | head -n "$to_delete" | while read -r old; do
            rm -rf "$old"
            log INFO "  Pruned old backup: $(basename "$old")"
        done
    fi
}

# ─── Install Dependencies ──────────────────────────────────────────────────

install_deps() {
    step "Installing dependencies"

    cd "${APP_DIR}"

    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm install --frozen-lockfile --prod=false 2>&1 | tail -5
    else
        npm ci 2>&1 | tail -5
    fi

    log INFO "Dependencies installed ✓"
    end_step
}

# ─── Build ──────────────────────────────────────────────────────────────────

build_app() {
    step "Building Next.js application"

    cd "${APP_DIR}"

    export NODE_ENV=production

    local build_start
    build_start=$(date +%s)

    # Use set +e to capture exit code from build (pipe with tee masks it)
    set +e
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm run build 2>&1 | tee -a "${LOG_FILE}"
    else
        npm run build 2>&1 | tee -a "${LOG_FILE}"
    fi
    local build_status=${PIPESTATUS[0]}
    set -e

    local build_end
    build_end=$(date +%s)
    local build_duration=$((build_end - build_start))

    if [ $build_status -ne 0 ]; then
        end_step
        die "Build failed after ${build_duration}s (exit code: ${build_status})"
    fi

    log INFO "Build completed in ${BOLD}${build_duration}s${NC} ✓"
    end_step
}

# ─── PM2 Process Management ────────────────────────────────────────────────

generate_ecosystem_config() {
    cat > "${APP_DIR}/ecosystem.config.js" << 'ECOSYSTEM'
module.exports = {
  apps: [
    {
      name: process.env.APP_NAME || 'entrancegateway-cms',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: __dirname,
      instances: parseInt(process.env.PM2_INSTANCES || '2', 10),
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },

      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Restart policy
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '512M',
      restart_delay: 5000,

      // Graceful shutdown
      kill_timeout: 10000,
      listen_timeout: 10000,
      shutdown_with_message: true,

      // Watch (disabled in production)
      watch: false,
    },
  ],
};
ECOSYSTEM
    log INFO "PM2 ecosystem config generated ✓"
}

start_or_restart_app() {
    step "Starting/Restarting application with PM2"

    cd "${APP_DIR}"
    mkdir -p "${APP_DIR}/logs"

    # Export env vars for ecosystem config
    export APP_NAME="${APP_NAME}"
    export PM2_INSTANCES="${PM2_INSTANCES}"
    export PORT="${PORT}"

    generate_ecosystem_config

    if pm2 describe "${APP_NAME}" &>/dev/null; then
        log INFO "Reloading existing PM2 process (zero-downtime)..."
        pm2 reload ecosystem.config.js --update-env
    else
        log INFO "Starting new PM2 process..."
        pm2 start ecosystem.config.js
    fi

    # Save PM2 process list so it survives reboots
    pm2 save --force 2>/dev/null || true

    log INFO "Application started on port ${BOLD}${PORT}${NC} ✓"
    end_step
}

stop_app() {
    step "Stopping application"

    if pm2 describe "${APP_NAME}" &>/dev/null; then
        pm2 stop "${APP_NAME}"
        log INFO "Application stopped ✓"
    else
        log WARN "Application is not running"
    fi
}

# ─── Health Check ───────────────────────────────────────────────────────────

health_check() {
    step "Running health check"

    local elapsed=0
    local interval=2

    while [ $elapsed -lt $HEALTH_CHECK_TIMEOUT ]; do
        local http_code
        http_code=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_CHECK_URL}" 2>/dev/null || echo "000")

        if [ "$http_code" = "200" ] || [ "$http_code" = "302" ] || [ "$http_code" = "307" ]; then
            log INFO "Health check passed (HTTP ${http_code}) after ${elapsed}s ✓"
            end_step
            return 0
        fi

        sleep $interval
        elapsed=$((elapsed + interval))
        if [ "$IS_CI" != "true" ]; then
            echo -ne "\r  Waiting for response... (${elapsed}s / ${HEALTH_CHECK_TIMEOUT}s)"
        else
            log INFO "  Waiting... (${elapsed}s / ${HEALTH_CHECK_TIMEOUT}s) — HTTP ${http_code}"
        fi
    done

    echo ""
    end_step
    log ERROR "Health check failed after ${HEALTH_CHECK_TIMEOUT}s"
    log ERROR "The app may still be starting — check: pm2 logs ${APP_NAME}"
    return 1
}

# ─── Rollback ───────────────────────────────────────────────────────────────

rollback() {
    step "Rolling back to previous build"

    if [ ! -d "${BACKUP_DIR}" ]; then
        die "No backups found in ${BACKUP_DIR}"
    fi

    local latest_backup
    latest_backup=$(ls -1d "${BACKUP_DIR}"/backup-* 2>/dev/null | tail -1)

    if [ -z "$latest_backup" ]; then
        die "No backup builds available"
    fi

    log INFO "Rolling back to: ${BOLD}$(basename "$latest_backup")${NC}"

    if ! confirm "This will replace the current .next build. Continue?"; then
        die "Rollback cancelled"
    fi

    # Replace current build
    rm -rf "${APP_DIR}/.next"
    cp -r "$latest_backup" "${APP_DIR}/.next"

    # Restart
    start_or_restart_app
    health_check

    log INFO "Rollback complete ✓"
}

# ─── Status ─────────────────────────────────────────────────────────────────

show_status() {
    step "Application Status"

    echo ""
    echo -e "${BOLD}PM2 Process:${NC}"
    pm2 describe "${APP_NAME}" 2>/dev/null || echo "  Not running"

    echo ""
    echo -e "${BOLD}Git Info:${NC}"
    cd "${APP_DIR}"
    echo "  Branch : $(git branch --show-current 2>/dev/null || echo 'N/A')"
    echo "  Commit : $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
    echo "  Message: $(git log -1 --pretty=format:'%s' 2>/dev/null || echo 'N/A')"

    echo ""
    echo -e "${BOLD}Build:${NC}"
    if [ -d "${APP_DIR}/.next" ]; then
        echo "  Status : Built ✓"
        echo "  Size   : $(du -sh "${APP_DIR}/.next" | awk '{print $1}')"
        echo "  Date   : $(stat -c '%y' "${APP_DIR}/.next" 2>/dev/null | cut -d. -f1 || stat -f '%Sm' "${APP_DIR}/.next" 2>/dev/null || echo 'N/A')"
    else
        echo "  Status : Not built"
    fi

    echo ""
    echo -e "${BOLD}Backups:${NC}"
    if [ -d "${BACKUP_DIR}" ]; then
        ls -1d "${BACKUP_DIR}"/backup-* 2>/dev/null | while read -r b; do
            echo "  $(basename "$b")  ($(du -sh "$b" | awk '{print $1}'))"
        done || echo "  None"
    else
        echo "  None"
    fi

    echo ""
    echo -e "${BOLD}Health:${NC}"
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_CHECK_URL}" 2>/dev/null || echo "000")
    if [ "$http_code" = "200" ] || [ "$http_code" = "302" ] || [ "$http_code" = "307" ]; then
        echo -e "  ${GREEN}● Online${NC} (HTTP ${http_code}) at ${HEALTH_CHECK_URL}"
    else
        echo -e "  ${RED}● Offline${NC} (HTTP ${http_code}) at ${HEALTH_CHECK_URL}"
    fi
    echo ""
}

# ─── First-Time Setup ──────────────────────────────────────────────────────

first_time_setup() {
    step "First-time server setup"

    # Create .env.production from example if it doesn't exist
    if [ ! -f "${APP_DIR}/.env.production" ] && [ -f "${APP_DIR}/.env.example" ]; then
        cp "${APP_DIR}/.env.example" "${APP_DIR}/.env.production"
        log INFO "Created .env.production from .env.example"
        log WARN "Edit .env.production with your production values before deploying!"
    fi

    # Install dependencies
    install_deps

    # Setup PM2 startup script
    log INFO "Setting up PM2 startup on boot..."
    pm2 startup 2>&1 | grep "sudo" | while read -r line; do
        log INFO "  Run this command: ${BOLD}${line}${NC}"
    done

    # Create logs directory
    mkdir -p "${APP_DIR}/logs"

    # Create backup directory
    mkdir -p "${BACKUP_DIR}"

    log INFO "Setup complete! Next steps:"
    echo ""
    echo -e "  1. Edit ${BOLD}.env.production${NC} with your production values"
    echo -e "  2. Run ${BOLD}./deploy.sh${NC} to build and start the application"
    echo -e "  3. Run the PM2 startup command printed above (if any)"
    echo ""
}

# ─── Full Deploy ────────────────────────────────────────────────────────────

full_deploy() {
    local deploy_start
    deploy_start=$(date +%s)

    echo ""
    echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}${BOLD}║    EntranceGateway CMS — Production Deployment  ║${NC}"
    echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
    echo ""

    check_prerequisites
    check_env_vars
    pull_latest
    create_backup
    install_deps
    build_app
    start_or_restart_app
    health_check

    local deploy_end
    deploy_end=$(date +%s)
    local total_duration=$((deploy_end - deploy_start))

    echo ""
    echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}${BOLD}║          ✓ Deployment Successful!                ║${NC}"
    echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  App     : ${BOLD}${APP_NAME}${NC}"
    echo -e "  URL     : ${BOLD}${HEALTH_CHECK_URL}${NC}"
    echo -e "  Port    : ${BOLD}${PORT}${NC}"
    echo -e "  Mode    : ${BOLD}cluster × ${PM2_INSTANCES} instances${NC}"
    echo -e "  Commit  : ${BOLD}$(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')${NC}"
    echo -e "  Duration: ${BOLD}${total_duration}s${NC}"
    echo -e "  Logs    : ${BOLD}pm2 logs ${APP_NAME}${NC}"
    echo ""
}

# ─── CI Deploy (non-interactive, used by GitHub Actions) ────────────────────

ci_deploy() {
    IS_CI="true"
    log INFO "CI/CD deployment started"
    log INFO "  Commit: ${GITHUB_SHA:-unknown}"
    log INFO "  Branch: ${GITHUB_REF:-unknown}"
    log INFO "  Run:    ${GITHUB_RUN:-unknown}"
    log INFO "  Actor:  ${GITHUB_ACTOR:-unknown}"

    # Record deployment start in log
    echo "" >> "${LOG_FILE}"
    echo "===== CI DEPLOY $(timestamp) ====" >> "${LOG_FILE}"
    echo "Commit: ${GITHUB_SHA:-unknown}" >> "${LOG_FILE}"
    echo "Branch: ${GITHUB_REF:-unknown}" >> "${LOG_FILE}"
    echo "Actor:  ${GITHUB_ACTOR:-unknown}" >> "${LOG_FILE}"
    echo "" >> "${LOG_FILE}"

    full_deploy
}

ci_rollback() {
    IS_CI="true"
    log INFO "CI/CD rollback started by ${GITHUB_ACTOR:-unknown}"

    check_prerequisites

    # Non-interactive rollback
    if [ ! -d "${BACKUP_DIR}" ]; then
        die "No backups found in ${BACKUP_DIR}"
    fi

    local latest_backup
    latest_backup=$(ls -1d "${BACKUP_DIR}"/backup-* 2>/dev/null | tail -1)
    if [ -z "$latest_backup" ]; then
        die "No backup builds available"
    fi

    log INFO "Rolling back to: $(basename "$latest_backup")"

    rm -rf "${APP_DIR}/.next"
    cp -r "$latest_backup" "${APP_DIR}/.next"

    start_or_restart_app
    health_check

    log INFO "Rollback complete ✓"
}

# ─── Help ───────────────────────────────────────────────────────────────────

show_help() {
    echo ""
    echo -e "${BOLD}EntranceGateway CMS — Deployment Script${NC}"
    echo ""
    echo "Usage: ./deploy.sh [OPTION]"
    echo ""
    echo "Options:"
    echo "  (none)            Full deploy: pull → install → build → restart"
    echo "  --setup           First-time server setup"
    echo "  --build-only      Build without restarting PM2"
    echo "  --restart-only    Restart PM2 without rebuilding"
    echo "  --rollback        Rollback to the previous build"
    echo "  --status          Show application status"
    echo "  --stop            Stop the application"
    echo "  --logs            Tail PM2 logs"
    echo "  --help            Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  PORT              Application port (default: 3000)"
    echo "  PM2_INSTANCES     Number of cluster instances (default: 2)"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh                          # Standard deploy"
    echo "  PORT=3001 PM2_INSTANCES=4 ./deploy.sh  # Custom port & instances"
    echo "  ./deploy.sh --rollback               # Rollback to previous build"
    echo ""
}

# ─── Main ───────────────────────────────────────────────────────────────────

main() {
    # Global error trap — captures failures with context
    trap 'log ERROR "Command failed at line ${LINENO} (exit code: $?)"' ERR

    case "${1:-}" in
        --setup)
            check_prerequisites
            first_time_setup
            ;;
        --build-only)
            check_prerequisites
            install_deps
            build_app
            log INFO "Build complete. Run ${BOLD}./deploy.sh --restart-only${NC} to apply."
            ;;
        --restart-only)
            check_prerequisites
            start_or_restart_app
            health_check
            ;;
        --rollback)
            check_prerequisites
            rollback
            ;;
        --ci)
            ci_deploy
            ;;
        --ci-rollback)
            ci_rollback
            ;;
        --status)
            show_status
            ;;
        --stop)
            stop_app
            ;;
        --logs)
            pm2 logs "${APP_NAME}" --lines 100
            ;;
        --help|-h)
            show_help
            ;;
        "")
            full_deploy
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"

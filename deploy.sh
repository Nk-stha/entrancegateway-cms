#!/usr/bin/env bash
# ============================================================================
#  EntranceGateway CMS — Docker Deployment Script
# ============================================================================
#  Usage:
#    ./deploy.sh                    # Full deploy (pull → build → up)
#    ./deploy.sh --ci               # CI mode (non-interactive, used by GitHub Actions)
#    ./deploy.sh --ci-rollback      # CI rollback to previous image
#    ./deploy.sh --rollback         # Rollback to previous image
#    ./deploy.sh --restart          # Restart containers
#    ./deploy.sh --status           # Show status
#    ./deploy.sh --logs             # Tail logs
#    ./deploy.sh --stop             # Stop containers
#    ./deploy.sh --setup            # First-time setup
#    ./deploy.sh --help             # Show help
# ============================================================================

set -euo pipefail

# ─── Configuration ──────────────────────────────────────────────────────────

APP_NAME="entrancegateway-cms"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_PORT="${APP_PORT:-6030}"
LOG_FILE="${APP_DIR}/deploy.log"
HEALTH_CHECK_URL="http://localhost:${APP_PORT}"
HEALTH_CHECK_TIMEOUT=60
IS_CI="${CI:-false}"

# ─── Colors ─────────────────────────────────────────────────────────────────

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

timestamp() { date '+%Y-%m-%d %H:%M:%S'; }

log() {
    local level="$1"; shift; local msg="$*"
    local color=""
    case "$level" in
        INFO)  color="${GREEN}" ;;
        WARN)  color="${YELLOW}" ;;
        ERROR) color="${RED}" ;;
        STEP)  color="${CYAN}" ;;
        *)     color="${NC}" ;;
    esac
    echo -e "${color}[$(timestamp)] [${level}]${NC} ${msg}"
    echo "[$(timestamp)] [${level}] ${msg}" >> "${LOG_FILE}" 2>/dev/null || true

    if [ "$IS_CI" = "true" ]; then
        case "$level" in
            ERROR) echo "::error::${msg}" ;;
            WARN)  echo "::warning::${msg}" ;;
        esac
    fi
}

step() {
    echo ""
    [ "$IS_CI" = "true" ] && echo "::group::$1"
    log STEP "━━━ $1 ━━━"
}

end_step() {
    [ "$IS_CI" = "true" ] && echo "::endgroup::"
}

die() {
    log ERROR "$1"
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
    if [ "$IS_CI" = "true" ]; then
        log INFO "[CI] Auto-confirming: ${prompt}"
        return 0
    fi
    read -r -p "$(echo -e "${YELLOW}${prompt} [y/N]: ${NC}")" response
    [[ "$response" =~ ^[Yy]$ ]]
}

# ─── Pre-flight Checks ─────────────────────────────────────────────────────

check_prerequisites() {
    step "Checking prerequisites"

    if ! command -v docker &>/dev/null; then
        die "Docker is not installed. Install: https://docs.docker.com/engine/install/"
    fi
    log INFO "Docker: $(docker --version | awk '{print $3}' | tr -d ',') ✓"

    if ! docker compose version &>/dev/null; then
        die "Docker Compose is not available. Install Docker Compose plugin."
    fi
    log INFO "Docker Compose: $(docker compose version --short) ✓"

    if ! docker info &>/dev/null 2>&1; then
        die "Docker daemon is not running or current user lacks permission."
    fi
    log INFO "Docker daemon: running ✓"

    if [ ! -f "${APP_DIR}/docker-compose.yml" ]; then
        die "docker-compose.yml not found in ${APP_DIR}"
    fi

    # Check env file
    if [ -f "${APP_DIR}/.env.production" ]; then
        log INFO "Environment: .env.production ✓"
    elif [ -f "${APP_DIR}/.env" ]; then
        log WARN "Using .env (consider creating .env.production for production)"
    else
        log WARN "No .env file found — build may fail"
    fi

    end_step
}

# ─── Git Operations ────────────────────────────────────────────────────────

pull_latest() {
    step "Pulling latest changes from Git"
    cd "${APP_DIR}"

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
    log INFO "Branch: ${BOLD}${current_branch}${NC}"

    git fetch --all --prune 2>&1 | while read -r line; do log INFO "  $line"; done
    git pull origin "${current_branch}" 2>&1 | while read -r line; do log INFO "  $line"; done

    local commit_hash
    commit_hash=$(git rev-parse --short HEAD)
    log INFO "HEAD: ${BOLD}${commit_hash}${NC} — $(git log -1 --pretty=format:'%s')"

    end_step
}

# ─── Docker Build & Deploy ─────────────────────────────────────────────────

backup_image() {
    step "Backing up current image"

    local current_image
    current_image=$(docker images --format '{{.ID}}' "${APP_NAME}" 2>/dev/null | head -1)

    if [ -n "$current_image" ]; then
        docker tag "${APP_NAME}:latest" "${APP_NAME}:rollback" 2>/dev/null || true
        log INFO "Current image tagged as ${BOLD}${APP_NAME}:rollback${NC} ✓"
    else
        log WARN "No existing image to backup — skipping"
    fi

    end_step
}

build_image() {
    step "Building Docker image"
    cd "${APP_DIR}"

    local build_start
    build_start=$(date +%s)

    # Source env vars for build args
    if [ -f "${APP_DIR}/.env.production" ]; then
        set -a
        source "${APP_DIR}/.env.production"
        set +a
    fi

    export APP_PORT="${APP_PORT}"

    set +e
    docker compose build --no-cache 2>&1 | tee -a "${LOG_FILE}"
    local build_status=${PIPESTATUS[0]}
    set -e

    local build_end
    build_end=$(date +%s)
    local build_duration=$((build_end - build_start))

    if [ $build_status -ne 0 ]; then
        end_step
        die "Docker build failed after ${build_duration}s (exit code: ${build_status})"
    fi

    log INFO "Image built in ${BOLD}${build_duration}s${NC} ✓"
    end_step
}

start_containers() {
    step "Starting containers"
    cd "${APP_DIR}"

    # Source env vars
    if [ -f "${APP_DIR}/.env.production" ]; then
        set -a
        source "${APP_DIR}/.env.production"
        set +a
    fi

    export APP_PORT="${APP_PORT}"

    docker compose up -d 2>&1 | while read -r line; do log INFO "  $line"; done

    log INFO "Container started on port ${BOLD}${APP_PORT}${NC} ✓"
    end_step
}

# ─── Health Check ───────────────────────────────────────────────────────────

health_check() {
    step "Running health check"

    local elapsed=0
    local interval=3

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
            echo -ne "\r  Waiting... (${elapsed}s / ${HEALTH_CHECK_TIMEOUT}s) — HTTP ${http_code}"
        else
            log INFO "  Waiting... (${elapsed}s / ${HEALTH_CHECK_TIMEOUT}s) — HTTP ${http_code}"
        fi
    done

    echo ""
    end_step

    # Dump container logs on failure
    log ERROR "Health check failed after ${HEALTH_CHECK_TIMEOUT}s"
    log ERROR "Container logs:"
    docker compose logs --tail=30 2>/dev/null || true
    return 1
}

# ─── Rollback ───────────────────────────────────────────────────────────────

rollback() {
    step "Rolling back to previous image"

    local rollback_image
    rollback_image=$(docker images --format '{{.ID}}' "${APP_NAME}:rollback" 2>/dev/null | head -1)

    if [ -z "$rollback_image" ]; then
        die "No rollback image found. Cannot rollback."
    fi

    if [ "$IS_CI" != "true" ]; then
        if ! confirm "Rollback to previous image?"; then
            die "Rollback cancelled"
        fi
    fi

    log INFO "Stopping current container..."
    docker compose down 2>/dev/null || true

    log INFO "Restoring rollback image..."
    docker tag "${APP_NAME}:rollback" "${APP_NAME}:latest"

    start_containers
    health_check

    log INFO "Rollback complete ✓"
    end_step
}

# ─── Status ─────────────────────────────────────────────────────────────────

show_status() {
    step "Application Status"
    cd "${APP_DIR}"

    echo ""
    echo -e "${BOLD}Container:${NC}"
    docker compose ps 2>/dev/null || echo "  Not running"

    echo ""
    echo -e "${BOLD}Images:${NC}"
    docker images "${APP_NAME}" --format "  {{.Tag}}\t{{.Size}}\t{{.CreatedSince}}" 2>/dev/null || echo "  None"

    echo ""
    echo -e "${BOLD}Git:${NC}"
    echo "  Branch : $(git branch --show-current 2>/dev/null || echo 'N/A')"
    echo "  Commit : $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"

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

    if [ ! -f "${APP_DIR}/.env.production" ] && [ -f "${APP_DIR}/.env.example" ]; then
        cp "${APP_DIR}/.env.example" "${APP_DIR}/.env.production"
        log INFO "Created .env.production from .env.example"
        log WARN "Edit .env.production with your production values!"
    fi

    mkdir -p "${APP_DIR}/logs"

    log INFO "Setup complete! Next steps:"
    echo ""
    echo -e "  1. Edit ${BOLD}.env.production${NC} with your production values"
    echo -e "  2. Run ${BOLD}./deploy.sh${NC} to build and start"
    echo ""
    end_step
}

# ─── Full Deploy ────────────────────────────────────────────────────────────

full_deploy() {
    local deploy_start
    deploy_start=$(date +%s)

    echo ""
    echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}${BOLD}║   EntranceGateway CMS — Docker Deployment       ║${NC}"
    echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
    echo ""

    check_prerequisites
    pull_latest
    backup_image
    build_image
    start_containers
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
    echo -e "  Port    : ${BOLD}${APP_PORT}${NC}"
    echo -e "  Commit  : ${BOLD}$(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')${NC}"
    echo -e "  Duration: ${BOLD}${total_duration}s${NC}"
    echo -e "  Logs    : ${BOLD}docker compose logs -f${NC}"
    echo ""
}

# ─── CI Modes ───────────────────────────────────────────────────────────────

ci_deploy() {
    IS_CI="true"
    log INFO "CI/CD deployment started"
    log INFO "  Commit: ${GITHUB_SHA:-unknown}"
    log INFO "  Branch: ${GITHUB_REF:-unknown}"
    log INFO "  Actor:  ${GITHUB_ACTOR:-unknown}"

    echo "" >> "${LOG_FILE}"
    echo "===== CI DEPLOY $(timestamp) ====" >> "${LOG_FILE}"

    full_deploy
}

ci_rollback() {
    IS_CI="true"
    log INFO "CI/CD rollback started by ${GITHUB_ACTOR:-unknown}"
    check_prerequisites
    rollback
}

# ─── Help ───────────────────────────────────────────────────────────────────

show_help() {
    echo ""
    echo -e "${BOLD}EntranceGateway CMS — Docker Deployment Script${NC}"
    echo ""
    echo "Usage: ./deploy.sh [OPTION]"
    echo ""
    echo "Options:"
    echo "  (none)            Full deploy: pull → build image → start container"
    echo "  --setup           First-time server setup"
    echo "  --restart         Restart containers"
    echo "  --rollback        Rollback to previous image"
    echo "  --status          Show application status"
    echo "  --stop            Stop containers"
    echo "  --logs            Tail container logs"
    echo "  --ci              CI deploy (non-interactive)"
    echo "  --ci-rollback     CI rollback (non-interactive)"
    echo "  --help            Show this help"
    echo ""
    echo "Environment variables:"
    echo "  APP_PORT          Host port (default: 6030)"
    echo ""
}

# ─── Main ───────────────────────────────────────────────────────────────────

main() {
    trap 'log ERROR "Command failed at line ${LINENO} (exit code: $?)"' ERR

    case "${1:-}" in
        --setup)        check_prerequisites; first_time_setup ;;
        --restart)      cd "${APP_DIR}"; docker compose restart; health_check ;;
        --rollback)     check_prerequisites; rollback ;;
        --ci)           ci_deploy ;;
        --ci-rollback)  ci_rollback ;;
        --status)       show_status ;;
        --stop)         cd "${APP_DIR}"; docker compose down; log INFO "Stopped ✓" ;;
        --logs)         cd "${APP_DIR}"; docker compose logs -f --tail=100 ;;
        --help|-h)      show_help ;;
        "")             full_deploy ;;
        *)              echo -e "${RED}Unknown option: $1${NC}"; show_help; exit 1 ;;
    esac
}

main "$@"

# Frontend Architecture & Design Principles

## Project: EntranceGateway CMS
**Tech Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS  
**Philosophy:** Custom implementations only - NO third-party state management, API clients, or utility libraries

---

## 📁 Folder Structure

```
entrancegateway-cms/
├── app/                          # Next.js App Router (routes & layouts)
│   ├── (auth)/                   # Route group for authentication pages
│   ├── (dashboard)/              # Route group for authenticated pages
│   ├── api/                      # API routes
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── error.tsx                 # Global error boundary
│   └── globals.css
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Base UI components (Button, Input, Card, Modal)
│   │   ├── forms/                # Form components with validation
│   │   ├── layouts/              # Layout components (Header, Sidebar, Footer)
│   │   ├── features/             # Feature-specific components
│   │   └── shared/               # Shared complex components
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useForm.ts
│   │   └── index.ts
│   │
│   ├── lib/                      # Core utilities & configurations
│   │   ├── api/                  # Custom API client (fetch-based)
│   │   │   ├── client.ts         # Custom fetch wrapper with interceptors
│   │   │   ├── endpoints.ts      # API endpoint constants
│   │   │   └── interceptors.ts   # Request/Response interceptors
│   │   ├── utils/                # Utility functions
│   │   │   ├── format.ts         # Formatters (date, currency, fileSize, etc.)
│   │   │   ├── validation.ts     # Validators (email, password, url, phone)
│   │   │   ├── helpers.ts        # Helpers (debounce, throttle, groupBy, retry)
│   │   │   ├── storage.ts        # localStorage/sessionStorage wrappers
│   │   │   └── formValidation.ts # Form validation system
│   │   ├── constants/            # App-wide constants
│   │   │   ├── routes.ts
│   │   │   ├── config.ts
│   │   │   └── messages.ts
│   │   └── errors/               # Error handling
│   │       ├── errorHandler.ts
│   │       ├── errorTypes.ts
│   │       └── errorBoundary.tsx
│   │
│   ├── services/                 # Business logic & API integrations
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── cms.service.ts
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── api.types.ts
│   │   ├── models.types.ts
│   │   ├── common.types.ts
│   │   └── index.ts
│   │
│   ├── store/                    # State management (React Context only)
│   │   ├── providers/
│   │   │   └── AppProvider.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   └── createStore.ts        # Custom store hook factory
│   │
│   ├── styles/                   # Global styles & theme
│   │   ├── theme.ts
│   │   └── variables.css
│   │
│   └── config/                   # App configuration
│       ├── env.ts                # Environment variables validation
│       └── app.config.ts
│
├── public/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
└── tests/                        # Test files
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 🎯 Core Design Principles

### 1. Separation of Concerns
- **Components**: Pure UI presentation, minimal logic
- **Hooks**: Reusable stateful logic and side effects
- **Services**: API calls and business logic
- **Utils**: Pure functions with no side effects
- **Store**: Global state management via React Context

### 2. Custom Implementation First
- Build custom API client using native fetch API
- Implement custom state management with React Context and useSyncExternalStore
- Create utility functions instead of importing libraries
- Custom hooks for all reusable logic
- No axios, no zustand, no redux, no lodash, no date-fns

### 3. Reusability
- Atomic design pattern: atoms → molecules → organisms
- Custom hooks for shared stateful logic
- Service layer abstracts API implementation
- Utility functions are pure and composable

### 4. Scalability
- Feature-based organization for large modules
- Route-based code splitting (automatic with App Router)
- Lazy loading for heavy components
- Modular architecture for easy extension

### 5. Type Safety
- Comprehensive TypeScript types for all data structures
- Strict type checking enabled
- Type definitions separate from implementation
- Generic types for reusable patterns

---

## 📦 Component Organization Strategy

### UI Components (`src/components/ui/`)
- Base, reusable components with zero business logic
- Each component in its own folder with: Component.tsx, Component.types.ts, index.ts
- Barrel exports for clean imports
- Examples: Button, Input, Card, Modal, Dropdown, Tooltip

### Feature Components (`src/components/features/`)
- Domain-specific, business logic components
- Organized by feature/domain (UserProfile, ContentEditor, Dashboard)
- Can use multiple UI components and hooks
- Connected to services and state

### Form Components (`src/components/forms/`)
- Reusable form fields and form wrappers
- Integrated with custom validation system
- Examples: LoginForm, RegistrationForm, FormField wrapper

### Layout Components (`src/components/layouts/`)
- Page structure components
- Examples: Header, Sidebar, Footer, PageLayout, AuthLayout

---

## 🪝 Custom Hooks Philosophy

### Standard Hooks to Implement
- **useApi**: Generic data fetching with loading/error states
- **useAuth**: Authentication state from AuthContext
- **useDebounce**: Debounced values for search/input
- **useLocalStorage**: Persistent state in localStorage
- **useMediaQuery**: Responsive breakpoint detection
- **useForm**: Form state with validation integration
- **useClickOutside**: Detect clicks outside element
- **useIntersectionObserver**: Lazy loading and infinite scroll
- **useToggle**: Boolean state toggle
- **usePrevious**: Track previous value

### Hook Design Rules
- Single responsibility per hook
- Return object with clear property names
- Include loading and error states for async operations
- Memoize callbacks with useCallback
- Clean up side effects in useEffect return

---

## 🔌 API Integration Architecture

### Custom API Client (Fetch-Based)
- Class-based API client wrapping native fetch
- Support for request/response interceptors
- Automatic timeout handling with AbortController
- Query parameter serialization
- Generic type support for responses
- HTTP methods: GET, POST, PUT, PATCH, DELETE

### Interceptor System
- Request interceptors: Add auth tokens, modify headers
- Response interceptors: Handle 401, token refresh, error transformation
- Chain multiple interceptors
- Async interceptor support

### Service Layer Pattern
- One service file per domain (auth, user, cms)
- Services use API client, not direct fetch
- Export object with methods (not class instances)
- Services handle business logic and data transformation
- Type-safe request/response interfaces

### Endpoint Management
- Centralized endpoint constants
- Template string functions for dynamic routes
- Environment-based base URL configuration

---

## 🚨 Error Handling Strategy

### Error Type Hierarchy
- **ApiError**: HTTP errors with status codes and error codes
- **ValidationError**: Form/input validation errors with field mapping
- **NetworkError**: Connection/timeout errors
- **AuthError**: Authentication/authorization errors
- **SilentError**: Non-critical errors that should be logged but not shown to users

### Error Severity Levels
- **Critical**: System failures, show error boundary, block user action
- **High**: Feature failures, show error message, allow retry
- **Medium**: Partial failures, show warning, continue operation
- **Low**: Non-critical issues, log silently, no user notification
- **Silent**: Background operations, analytics failures, non-essential features

### Error Handling Layers

#### 1. API Client Level
- Catch all fetch errors and network issues
- Transform to custom error types with severity
- Apply retry logic for transient failures
- Log all errors with request context

#### 2. Service Level
- Handle business logic errors
- Add domain-specific context
- Determine error severity
- Decide if error should be silent or visible

#### 3. Component Level
- Display user-friendly error messages for visible errors
- Handle loading and error states
- Provide retry mechanisms
- Graceful degradation for silent errors

#### 4. Global Level
- Error boundaries catch unhandled errors
- Fallback UI for critical failures
- Global error logger
- Error reporting to monitoring service

### Silent Error Handling Strategy

#### When to Use Silent Errors
- Analytics tracking failures
- Non-critical background sync operations
- Optional feature failures (recommendations, suggestions)
- Prefetch/cache operations
- Telemetry and monitoring failures
- A/B testing framework errors
- Third-party widget failures
- Non-essential API calls

#### Silent Error Implementation
- Log error with full context to monitoring service
- Continue application flow without interruption
- Provide fallback behavior or default values
- Track silent error metrics for debugging
- Alert developers if silent error rate exceeds threshold

#### Silent Error Configuration
- Error severity flag in error object
- Service-level configuration for silent operations
- Component-level opt-in for silent mode
- Global silent error logger
- Environment-based silent error behavior (dev vs prod)

### Error Boundary Strategy
- **Component-level boundaries**: Isolate feature failures, show inline error
- **Route-level error.tsx**: Handle page-level errors with navigation options
- **Global error boundary**: Catch catastrophic failures, show maintenance page
- **Fallback UI**: Contextual error messages with retry/reset actions

### Error Handler Utilities

#### Central Error Handler
- Detect error type and severity
- Transform errors to user-friendly messages
- Route to appropriate handler (visible vs silent)
- Log with structured data
- Trigger monitoring alerts

#### Error Logger
- Structured logging with context (user, route, timestamp)
- Separate logs for visible vs silent errors
- Error aggregation and deduplication
- Integration with monitoring services
- Local development console logging

#### Error Recovery Mechanisms
- Automatic retry with exponential backoff
- Fallback to cached data
- Graceful degradation to basic functionality
- User-initiated retry actions
- Reset to known good state

### Error Notification Strategy

#### User-Facing Errors (Visible)
- Toast notifications for transient errors
- Inline error messages for form validation
- Modal dialogs for critical errors requiring action
- Banner alerts for system-wide issues
- Empty states with error context

#### Silent Errors (Hidden)
- No user notification
- Background logging only
- Developer console in development mode
- Monitoring dashboard alerts
- Periodic error reports

### Error Context and Metadata

#### Required Error Information
- Error type and severity level
- Timestamp and request ID
- User ID (if authenticated)
- Current route and component
- Request/response data (sanitized)
- Browser and device information
- Previous actions (breadcrumb trail)

#### Silent Error Metadata
- Operation type (analytics, prefetch, etc.)
- Expected vs actual behavior
- Fallback action taken
- Impact assessment (none, minimal, moderate)
- Retry attempts made

### Error Monitoring and Alerting

#### Metrics to Track
- Error rate by type and severity
- Silent error frequency and patterns
- Time to recovery
- User impact (affected users, sessions)
- Error resolution rate

#### Alert Thresholds
- Critical errors: Immediate alert
- High severity: Alert if rate > 1%
- Silent errors: Alert if rate > 10%
- Repeated failures: Alert after 3 consecutive failures
- New error types: Alert on first occurrence

### Error Recovery Patterns

#### Retry Strategy
- Transient network errors: 3 retries with exponential backoff
- Rate limit errors: Retry after specified delay
- Server errors (5xx): 2 retries then fail
- Silent errors: Single retry then log and continue

#### Fallback Strategy
- Use cached data if available
- Show partial data with warning
- Disable optional features gracefully
- Provide offline mode for critical features
- Default values for non-critical data

#### Circuit Breaker Pattern
- Track failure rate per endpoint
- Open circuit after threshold (e.g., 50% failure rate)
- Fail fast during open circuit
- Attempt recovery after cooldown period
- Close circuit on successful requests

### Development vs Production Behavior

#### Development Mode
- Show all errors including silent ones
- Detailed error messages with stack traces
- Console logging for debugging
- Error overlay for unhandled errors
- No error suppression

#### Production Mode
- Silent errors truly silent to users
- Generic user-friendly error messages
- Comprehensive logging to monitoring service
- Graceful degradation
- Error boundaries prevent white screens

### Error Message Guidelines

#### User-Facing Messages
- Clear and concise language
- Avoid technical jargon
- Provide actionable next steps
- Include support contact for critical errors
- Maintain brand tone and voice

#### Developer Messages (Logs)
- Technical details and stack traces
- Request/response payloads
- Error codes and status
- Reproduction steps
- Related error IDs for correlation

---

## 🔐 State Management Approach

### React Context Pattern (Primary)
- Use Context API for global state
- Separate contexts by domain (Auth, Theme, User, etc.)
- Provider composition in root layout
- Custom hooks to consume context (useAuth, useTheme)
- Memoize context values to prevent unnecessary re-renders

### Custom Store Hook (Alternative)
- Factory function using useSyncExternalStore
- Lightweight alternative to Context for simple state
- Subscribe/notify pattern
- Selector-based subscriptions for performance
- No external dependencies

### State Organization Rules
- Keep state as local as possible
- Lift state only when necessary
- Use Context for truly global state
- Server state separate from client state
- Derive state instead of duplicating

---

## 🛠️ Utility Functions Organization

### Validation Utils (`validation.ts`)
- Email, password, URL, phone validators
- Required field validation
- Custom validation rule builder
- Return boolean or detailed error objects

### Format Utils (`format.ts`)
- Date formatting (short, long, relative)
- Currency formatting with Intl API
- Number formatting with locale support
- File size formatting (bytes to KB/MB/GB)
- Text truncation with ellipsis

### Helper Utils (`helpers.ts`)
- Debounce and throttle functions
- Sleep/delay utility
- Array utilities: groupBy, unique, chunk
- Object utilities: omit, pick, deepClone
- isEmpty checker for various types
- Retry logic with exponential backoff

### Storage Utils (`storage.ts`)
- localStorage wrapper with JSON serialization
- sessionStorage wrapper
- Error handling for quota exceeded
- SSR-safe (check window existence)
- Type-safe get/set methods

### Form Validation System (`formValidation.ts`)
- Schema-based validation
- Field-level and form-level validation
- Required field handling
- Custom validation rules
- Integration with useForm hook

---

## 📝 TypeScript Type Organization

### API Types (`api.types.ts`)
- Generic ApiResponse<T> wrapper
- PaginatedResponse<T> for lists
- Request/Response types for each endpoint
- Error response types

### Model Types (`models.types.ts`)
- Domain entities (User, Post, etc.)
- Enums for fixed values (UserRole, Status)
- Relationship types

### Common Types (`common.types.ts`)
- Shared utility types
- Generic helper types
- Component prop types

### Type Naming Conventions
- Interfaces: PascalCase (User, ApiResponse)
- Types: PascalCase (UserRole, RequestConfig)
- Enums: PascalCase (Status, UserRole)
- Generic types: Single uppercase letter or descriptive (T, TData, TResponse)

---

## 🎨 Styling Strategy

### Tailwind CSS (Primary)
- Utility-first approach for rapid development
- Custom theme configuration in tailwind.config
- Consistent spacing, colors, typography

### CSS Modules (Secondary)
- Complex component-specific styles
- Scoped styles to prevent conflicts
- Use when Tailwind becomes too verbose

### Theme System
- Centralized theme configuration
- CSS custom properties for dynamic theming
- Dark mode support via Tailwind classes
- Consistent design tokens

---

## 🚀 Performance Optimization Guidelines

### Code Splitting
- Route-based splitting (automatic with App Router)
- Dynamic imports for heavy components
- Lazy load modals, charts, editors

### Image Optimization
- Always use next/image component
- Proper width/height attributes
- WebP format with fallbacks
- Lazy loading for below-fold images

### API Optimization
- Request deduplication in API client
- Cache responses when appropriate
- Pagination for large datasets
- Debounce search inputs

### Bundle Optimization
- Tree shaking enabled by default
- Analyze bundle with @next/bundle-analyzer
- Code split by route and feature
- Minimize client-side JavaScript

---

## 📚 Naming Conventions

### Files
- Components: PascalCase (Button.tsx, UserProfile.tsx)
- Hooks: camelCase with 'use' prefix (useAuth.ts, useDebounce.ts)
- Utils: camelCase (formatDate.ts, validation.ts)
- Types: camelCase with '.types' suffix (user.types.ts, api.types.ts)
- Services: camelCase with '.service' suffix (auth.service.ts)

### Code
- Components: PascalCase (Button, UserProfile)
- Functions/Variables: camelCase (handleClick, userData)
- Constants: UPPER_SNAKE_CASE (API_BASE_URL, MAX_RETRIES)
- Types/Interfaces: PascalCase (User, ApiResponse)
- Private methods: prefix with underscore (_handleError)

### Folders
- lowercase with hyphens for multi-word (user-profile, api-client)
- Singular for utilities (util, helper, hook)
- Plural for collections (components, services, types)

---

## 🔧 Path Aliases Configuration

Configure in tsconfig.json for clean imports:
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/hooks/*` → `./src/hooks/*`
- `@/lib/*` → `./src/lib/*`
- `@/types/*` → `./src/types/*`
- `@/services/*` → `./src/services/*`

---

## 🔄 Data Flow Architecture

### Request Flow
1. Component triggers action
2. Hook or service method called
3. Service uses API client
4. API client applies interceptors
5. Fetch request sent
6. Response interceptors process result
7. Service transforms data
8. Component receives typed data

### State Update Flow
1. User interaction in component
2. Event handler calls context method or setState
3. Context updates state
4. All subscribed components re-render
5. Derived state recalculated

### Error Flow
1. Error occurs in API/service
2. Error handler transforms to custom type
3. Error propagates to component
4. Component displays error UI
5. Error boundary catches unhandled errors

---

## 📖 Documentation Standards

### Component Documentation
- Purpose and use case
- Props interface with descriptions
- Usage examples in comments
- Edge cases and limitations

### Hook Documentation
- What problem it solves
- Parameters and return values
- Dependencies and side effects
- Usage examples

### Service Documentation
- API endpoints used
- Request/response types
- Error scenarios
- Authentication requirements

### Utility Documentation
- Function purpose
- Parameters with types
- Return value
- Examples of usage


---

## 🔒 Security Best Practices

### Authentication
- Store tokens in httpOnly cookies when possible
- Implement token refresh logic
- Clear sensitive data on logout
- Handle 401 responses globally

### API Security
- Validate all inputs
- Sanitize user-generated content
- Use HTTPS only
- Implement rate limiting

### XSS Prevention
- Escape user input in JSX
- Use dangerouslySetInnerHTML sparingly
- Sanitize HTML content
- Content Security Policy headers

### Data Privacy
- Never log sensitive data
- Mask PII in error messages
- Implement proper CORS policies
- Secure environment variables

---

## 🎯 Development Workflow

### Feature Development
1. Create feature branch
2. Implement types first
3. Build service layer
4. Create custom hooks if needed
5. Build UI components
6. Add error handling
7. Write tests
8. Document code

### Code Review Focus
- Type safety
- Error handling completeness
- Performance considerations
- Reusability opportunities
- Security vulnerabilities
- Accessibility compliance

### Refactoring Guidelines
- Extract repeated logic to hooks
- Move business logic to services
- Create utility functions for common operations
- Simplify complex components
- Improve type definitions

---

## 📞 Quick Reference

### Import Patterns
```
Components:    import { Button } from '@/components/ui'
Hooks:         import { useAuth } from '@/hooks'
Services:      import { authService } from '@/services/auth.service'
Utils:         import { formatDate } from '@/lib/utils/format'
Types:         import type { User } from '@/types'
```

### When to Create
- **New Hook**: Logic used in 2+ components
- **New Util**: Pure function used in 2+ places
- **New Service**: New API domain/resource
- **New Component**: Reusable UI pattern
- **New Context**: Truly global state needed

### Architecture Decisions
- **State**: Local first, Context for global, avoid prop drilling
- **API**: Services use client, components use hooks
- **Validation**: Schema-based with FormValidator class
- **Errors**: Custom types, multiple handling layers
- **Types**: Separate files, comprehensive coverage

---

**Last Updated:** February 2026  
**Maintained By:** Frontend Team  
**Purpose:** Architectural reference for Kiro AI assistant

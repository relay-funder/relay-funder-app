# Akashic - AI Agent Guide

## Overview
Akashic is a Next.js 15 fundraising platform for open source projects built with TypeScript, Prisma, PostgreSQL, and Web3 integration. The project uses Docker for development, pnpm as the package manager, and features a comprehensive Web3 integration with multiple wallet adapters (Privy, Silk, and Dummy for testing).

### Technology Stack
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript 5.7
- **Styling**: Tailwind CSS with Radix UI components and Geist fonts
- **Database**: PostgreSQL with Prisma ORM (32 migrations, custom client path)
- **Authentication**: NextAuth.js with SIWE (Sign-In with Ethereum)
- **Web3**: Wagmi, Viem, Ethers.js with multiple wallet adapters
- **Payments**: Stripe integration with Crowdsplit for crypto payments
- **File Storage**: Cloudinary for image uploads with preset configurations
- **Monitoring**: Sentry for error tracking and performance monitoring
- **Testing**: Vitest with React Testing Library
- **Code Quality**: ESLint, Prettier with Tailwind plugin, Husky for git hooks
- **Deployment**: Vercel with custom build configurations

## Project Structure

### Core Architecture
- **Frontend**: Next.js 15 with App Router (`app/`)
- **Backend**: Next.js API routes (`app/api/`)
- **Database**: Prisma ORM with PostgreSQL (`prisma/`)
- **Components**: React components organized by feature (`components/`)
- **Web3**: Wallet integration and smart contracts (`lib/web3/`)
- **Styling**: Tailwind CSS with Radix UI components and Geist fonts

### Key Features
1. **Campaign Management**: Create, edit, and manage fundraising campaigns
2. **Web3 Integration**: Wallet connectivity with multiple adapters (Privy, Silk, Dummy)
3. **Dual Payment System**: Support for both crypto (USDC) and credit card payments
4. **Admin Dashboard**: Administrative functionality for campaign approval and management
5. **Collections & Rounds**: Curated campaign collections and quadratic funding rounds
6. **Real-time Notifications**: In-app notification system for user actions
7. **Image Upload**: Cloudinary integration for campaign and profile images

### Key Directories
```
/app                 # Next.js App Router pages and API routes
/components          # React components (UI, feature-specific, 75+ components)
/lib                 # Utility libraries and business logic
  ├── api/          # API utilities and types
  ├── web3/         # Web3 integration (Privy, Silk, Dummy adapters)
  ├── hooks/        # Custom React hooks
  ├── utils/        # General utilities
  ├── crowdsplit/   # Crowdsplit payment integration
  ├── treasury/     # Treasury management utilities
/server             # Server-side configuration (auth, db)
/prisma             # Database schema and migrations (32 migrations)
/types              # TypeScript type definitions
/contracts          # Smart contract ABIs (TreasuryFactory, etc.)
```

## Development Environment

### Prerequisites
- Node.js 20.x (exact version specified in package.json)
- Docker and Docker Compose
- pnpm package manager
- Git

### Setup Commands
```bash
# Clone repository
git clone <repository-url>
cd akashic

# Copy environment template
cp env.template .env.local

# Install dependencies
pnpm install

# Start development environment
docker compose up

# Generate Prisma client (runs automatically via postinstall)
pnpm prisma generate
```

### Docker Services
The development environment includes multiple Docker services:
- **app**: Main Next.js application with hot reloading
- **database**: PostgreSQL database with health checks
- **pgadmin**: Database administration interface
- **app-shell**: Shell access for advanced development tasks
- **app-trace**: Turbopack trace server for performance debugging

### Environment Variables
Required environment variables in `.env.local` (see env.template for complete list):
```bash
# Database
DATABASE_URL=postgres://username:password@db:5432/database_name

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Web3 Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id
NEXT_PUBLIC_ALCHEMY_API_KEY=your-alchemy-key

# CC Protocol Contracts (for treasury integration)
NEXT_PUBLIC_TREASURY_FACTORY=0x...
NEXT_PUBLIC_GLOBAL_PARAMS=0x...
NEXT_PUBLIC_PLATFORM_HASH=0x...
NEXT_PUBLIC_PLATFORM_ADMIN=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...

# External Services
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=akashic-yj
SENTRY_PROJECT=akashic-app

# Development
NODE_ENV=development
```

## Build and Test Commands

### Development
```bash
# Start development server
docker compose up

# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop development environment
docker compose down
```

### Database Operations
```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm dev:db

# Run migrations in development
pnpm prisma migrate dev

# Check migration status
pnpm migrate:check

# Seed database
pnpm dev:db:seed

# Reset database (development only)
pnpm prisma migrate reset
```

### Build and Deployment
```bash
# Build for production
pnpm build

# Build for production with migrations
pnpm build:production

# Start production server
pnpm start

# Type checking and linting
pnpm lint

# Format code
pnpm format:write
```

### Testing
```bash
# Run all tests with Vitest
pnpm test

# Format checking
pnpm format:write
```

## Coding Conventions

### TypeScript Standards
- **Strict TypeScript**: Strict mode enabled with comprehensive type checking
- **Type Safety**: Prefer `unknown` over `any`, use generics for reusable code
- **Interface vs Type**: Use `interface` for object shapes, `type` for unions/intersections
- **Explicit Types**: Define explicit types for function parameters and return values
- **Path Mapping**: Use `@/` for absolute imports (configured in tsconfig.json)
- **Font Loading**: Uses Geist Sans and Geist Mono fonts loaded locally

### React Component Patterns
- **Function Components**: Use function components with TypeScript
- **Props Interface**: Define component props with explicit interfaces
- **UI Components**: Import from single barrel export (`@/components/ui`)
- **Custom Hooks**: Extract complex logic into reusable hooks (`lib/hooks/`)
- **Component Size**: Keep components under 150 lines of code
- **Single Responsibility**: Each component should have one clear purpose
- **Forward Ref Pattern**: Use `React.forwardRef` for components that need refs
- **Display Name**: Set `Component.displayName` for debugging
- **Radix UI Integration**: Extensive use of Radix UI primitives for accessibility

### File Organization
- **Absolute Imports**: Use `@/` prefix for internal module imports
- **Feature Grouping**: Group related components in feature-specific folders
- **Type Definitions**: Place types in dedicated `/types` directory
- **Utility Functions**: Organize utilities in `/lib` with clear naming

### Naming Conventions
- **PascalCase**: Types, interfaces, React components
- **camelCase**: Variables, functions, object properties
- **UPPER_SNAKE_CASE**: Constants, environment variables
- **Descriptive Names**: Use explicit, descriptive variable names

## API Patterns

### Route Structure
- **RESTful Design**: Use RESTful conventions for API endpoints
- **HTTP Methods**: Implement proper GET, POST, PUT, DELETE methods
- **Route Groups**: Use route groups for logical organization
- **Dynamic Routes**: Use `[param]` for dynamic route segments

### Authentication & Authorization
- **Server-Side Auth**: Use `checkAuth(['role'])` for protected routes
- **Role-Based Access**: Support multiple roles (user, admin)
- **Session Validation**: Validate sessions on protected endpoints
- **Resource Ownership**: Check resource ownership before allowing access

### Error Handling
- **Centralized Errors**: Use predefined error types from `@/lib/api/error`
- **Consistent Format**: Return consistent error response format
- **HTTP Status Codes**: Use appropriate HTTP status codes
- **Validation Errors**: Handle Zod validation errors gracefully

### Data Validation
- **Zod Schemas**: Use Zod for input validation and type safety
- **Runtime Validation**: Validate external data at runtime
- **Type Safety**: Leverage Zod for TypeScript type inference
- **Form Data**: Use `FormData` for file uploads in POST requests
- **Sanitization**: Sanitize data on retrieval for consistency

## Database Patterns

### Prisma Usage
- **Centralized Client**: Use single Prisma client instance from `@/server/db`
- **Type Safety**: Leverage Prisma's generated types
- **Query Optimization**: Use `include`/`select` for efficient queries
- **Transactions**: Use transactions for multi-step operations
- **Custom Output Path**: Generated client in `../.generated/prisma/client`

### Schema Design
- **Descriptive Names**: Use explicit field names (e.g., `creatorAddress` not `creator`)
- **Relationships**: Define proper foreign key relationships
- **Indexes**: Add indexes for frequently queried fields
- **Enums**: Use enums for status fields and fixed values
- **Treasury Modes**: Support for dual, unified, and legacy treasury architectures
- **Payment Flow Types**: Separate crypto and credit card payment flows

### Migration Guidelines
- **Review Migrations**: Always review generated migrations before applying
- **Descriptive Names**: Use clear, descriptive migration names
- **Atomic Changes**: Keep migrations atomic and reversible
- **Testing**: Test migrations on staging before production

## Web3 Integration

### Wallet Adapters
- **Multi-Adapter Pattern**: Support Privy, Silk, and Dummy wallet providers
- **Consistent Interface**: Use unified interface across adapters
- **Error Handling**: Handle wallet connection and transaction errors
- **State Management**: Manage wallet connection state properly
- **Admin Approval**: Special handling for contract admin permissions

### Smart Contracts
- **ABI Organization**: Store contract ABIs in `/contracts` directory
- **Type Safety**: Use generated types for contract interactions
- **Gas Management**: Handle gas estimation and limits properly
- **Error Handling**: Handle contract revert errors gracefully

### Transaction Handling
- **State Tracking**: Track transaction states (pending, confirmed, failed)
- **User Feedback**: Provide clear feedback during transactions
- **Retry Logic**: Implement retry logic for failed transactions
- **Security**: Validate transaction parameters before submission

## Testing Guidelines

### Testing Framework
- **Vitest**: Modern testing framework with native TypeScript support
- **Configuration**: Simple setup with globals enabled and path aliases
- **Test Files**: Use `.test.ts` or `.test.tsx` extensions

### Unit Testing
- **Component Testing**: Test React components with proper mocking
- **Hook Testing**: Test custom hooks with React Testing Library
- **Utility Testing**: Test utility functions with comprehensive coverage
- **Type Safety**: Use TypeScript for test files

### Integration Testing
- **API Testing**: Test API endpoints with realistic data
- **Database Testing**: Test database operations and relationships
- **Web3 Testing**: Test wallet interactions and contract calls
- **E2E Testing**: Test complete user workflows

### Mocking Strategy
- **External Dependencies**: Mock external APIs and services
- **Database**: Use test database or transaction rollback
- **Web3**: Mock wallet connections and contract interactions
- **File Uploads**: Mock file upload functionality

## Security Best Practices

### Input Validation
- **Zod Validation**: Use Zod schemas for all user inputs
- **SQL Injection**: Use Prisma's parameterized queries
- **XSS Prevention**: Sanitize user-generated content
- **File Upload**: Validate file types and sizes

### Authentication
- **Secure Sessions**: Use secure session management
- **Password Hashing**: Hash sensitive data appropriately
- **Rate Limiting**: Implement rate limiting on API endpoints
- **CSRF Protection**: Protect against CSRF attacks

### Web3 Security
- **Contract Validation**: Validate contract addresses and ABIs
- **Transaction Safety**: Validate transaction parameters
- **Private Key Protection**: Never expose private keys in client code
- **Slippage Protection**: Implement slippage protection for transactions

## Performance Optimization

### React Optimization
- **React Compiler**: Let React Compiler handle automatic optimization
- **Memoization**: Use `useMemo`/`useCallback` for expensive operations
- **Code Splitting**: Use lazy loading for large components
- **Bundle Analysis**: Monitor bundle sizes and optimize imports

### Database Optimization
- **Query Efficiency**: Use proper includes and selects
- **Pagination**: Implement pagination for large datasets
- **Indexing**: Add appropriate database indexes
- **Connection Pooling**: Use connection pooling in production

### Web3 Optimization
- **RPC Efficiency**: Batch requests where possible
- **Gas Optimization**: Use efficient contract methods
- **Caching**: Cache frequently accessed blockchain data
- **Network Selection**: Choose appropriate networks for operations

## Pull Request Guidelines

### Code Review Process
- **Clear Description**: Provide clear description of changes
- **Reference Issues**: Reference related issues or tasks
- **Small Changes**: Keep PRs focused on single concerns
- **Documentation**: Update documentation for API changes

### Quality Standards
- **Type Checking**: Ensure all TypeScript checks pass
- **Linting**: Fix all linting issues
- **Testing**: Include appropriate tests for new functionality
- **Performance**: Consider performance implications of changes

### Commit Standards
- **Conventional Commits**: Use conventional commit format
- **Descriptive Messages**: Write clear, descriptive commit messages
- **Atomic Commits**: Make atomic, focused commits
- **Branch Naming**: Use descriptive branch names

## Task Prioritization and Management

### Eisenhower Matrix for Task Classification
Use the Eisenhower Matrix to categorize tasks based on urgency and importance:

- **🔥 Important and Urgent**: Tasks requiring immediate attention (critical path items)
- **📈 Important but Not Urgent**: Tasks with long-term strategic value (architectural improvements)
- **⚡ Urgent but Not Important**: Tasks needing quick execution but limited impact (minor fixes)
- **⏳ Not Urgent and Not Important**: Tasks that can be postponed or excluded (nice-to-haves)

### Task Management Process
- **Sequential Completion**: Complete tasks in order listed in `implementation-plan.mdc`
- **Progress Tracking**: Mark tasks `[x]` when complete, `[ ]` when pending
- **Dependency Management**: Use `@(unique_task_substring)` for explicit dependencies
- **Blocker Escalation**: Immediately escalate blockers to parent agents

### Implementation Plan Integration
1. **Before Starting**: Check `implementation-plan.mdc` for next sequential task
2. **During Work**: Only work on current task in the sequence
3. **After Completion**: Update `implementation-plan.mdc` with:
   - Mark task as `[x]` (completed)
   - Add two-line summary in Progress Notes section
   - Move completed task to Completed Tasks section

## Agent Creation and Management

### Autonomous Sub-Agent Spawning System
Define triggers for creating sub-agents based on task complexity:

- **Task Complexity**: Create sub-agents for tasks exceeding 8 hours
- **Parallelization Opportunities**: Spawn agents for independent subtasks
- **Specialization Needs**: Create domain-specific agents (frontend, backend, Web3, etc.)
- **Current Workload**: Spawn agents when main agent is overloaded

### Agent Hierarchy Management
- **Main Orchestrator Agent (Level 0)**: Oversees entire project and coordinates sub-agents
- **Component Research Agents (Level 1)**: Focus on tech stack research, architecture analysis
- **Implementation Agents (Level 1)**: Handle backend, frontend, and integration development
- **Remediation Agents (Level 1)**: Address code restructuring and architecture revision

### Agent Lifecycle Management
- **Creation**: Spawn agents based on complexity triggers
- **Monitoring**: Track agent progress and status
- **Coordination**: Ensure proper communication between agents
- **Termination**: Clean shutdown when tasks are complete

## Inter-Agent Communication Protocol

### Communication Standards
- **Tagging Parent Agents**: All agents must tag parent agent in updates
- **Regular Status Updates**: Provide updates every 4 hours or upon state changes
- **Immediate Escalation**: Escalate blockers to parent agent without delay

### Structured Update Format
Use consistent format for all agent communications:

```
## Status Update - [Agent Name]
**Current Status**: [Working/In Progress/Blocked/Completed]
**Progress**: [XX%] complete
**Current Task**: [Brief description]
**Blockers**: [None/List of blockers]
**Next Steps**: [Planned next actions]
**ETA**: [Estimated completion time]
```

### Communication Channels
- **Primary**: Pull request comments and issue updates
- **Secondary**: Direct agent-to-agent messaging for coordination
- **Escalation**: Parent agent notification for critical issues

## Task Validation and Approval Process

### Validation Decision Tree
1. **Code Quality Check**: Does code follow project standards?
2. **Testing Verification**: Are appropriate tests included?
3. **Documentation Review**: Is documentation updated?
4. **Security Assessment**: Are security implications considered?
5. **Performance Impact**: Does code meet performance requirements?

### Approval Workflow
- **APPROVED ✅**: All criteria pass, merge to main branch, update status dashboard
- **MINOR ISSUES**: Fixable issues identified, move to "In Progress" for fixes
- **REJECTED ❌**: Major issues or architectural concerns, create remediation sub-issue

### Quality Gates
- **Pre-commit**: Type checking, linting, formatting
- **Pre-merge**: Full test suite, integration tests
- **Post-merge**: Deployment verification, performance monitoring

## Task Analysis Recommendations

### Task Overlap Identification
- **Shared Functionality**: Identify overlapping tasks and suggest merging
- **Common Components**: Create shared components to reduce duplication
- **Utility Functions**: Extract common logic into reusable utilities

### Task Estimation Review
- **Accuracy Assessment**: Flag unrealistic time estimates
- **Historical Comparison**: Compare with similar completed tasks
- **Risk Adjustment**: Add buffer time for complex or uncertain tasks

### Dependency Analysis
- **Blocking Relationships**: Identify and document task dependencies
- **Parallel Opportunities**: Find tasks that can be worked on simultaneously
- **Critical Path**: Identify tasks that must be completed sequentially

### Task Categorization
- **Size Assessment**: Identify oversized tasks for breakdown
- **Complexity Evaluation**: Categorize tasks by technical complexity
- **Priority Alignment**: Ensure categorization matches business priorities

### Coverage and Completeness
- **Specification Comparison**: Verify tasks align with product requirements
- **Missing Tasks**: Identify gaps in DevOps, testing, performance, scalability
- **Redundancy Check**: Remove duplicate or unnecessary tasks

## Programmatic Checks

### Pre-commit Hooks
```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Format checking
pnpm format:check

# Tests
pnpm test
```

### CI/CD Pipeline
- **Build**: Build application for production
- **Test**: Run complete test suite
- **Lint**: Check code quality and style
- **Security**: Run security vulnerability scans
- **Performance**: Check bundle sizes and performance metrics

### Code Quality Tools
- **ESLint**: JavaScript/TypeScript linting with Next.js config
- **Prettier**: Code formatting with Tailwind CSS plugin
- **TypeScript**: Strict type checking with custom paths
- **Vitest**: Modern testing framework with globals
- **Husky**: Git hooks for pre-commit quality checks
- **Sentry**: Error monitoring and performance tracking

## Common Patterns and Best Practices

### Component Development
1. Start with TypeScript interface for props
2. Use existing UI components from `@/components/ui`
3. Extract complex logic into custom hooks
4. Handle loading and error states properly
5. Add appropriate accessibility attributes

### API Development
1. Use consistent error handling patterns
2. Validate inputs with Zod schemas
3. Implement proper authentication checks
4. Return consistent response formats
5. Add appropriate logging and monitoring

### Database Operations
1. Use Prisma's type-safe query methods
2. Include related data with `include` option
3. Handle transactions for multi-step operations
4. Implement proper error handling
5. Add indexes for performance-critical queries

### Web3 Integration
1. Handle wallet connection state properly
2. Provide clear user feedback during transactions
3. Implement proper error handling for blockchain operations
4. Validate contract addresses and parameters
5. Consider gas costs and network conditions

This guide provides the essential information needed to work effectively with the Akashic codebase. Follow these patterns and conventions to maintain code quality and consistency across the project.

# Relay Funder App - AI Agent Guide

## Codebase

### Overview

Relay Funder App is a Next.js 15 fundraising platform for refugee communities and humanitarian projects built with TypeScript, Prisma, PostgreSQL, and Web3 integration. The project uses Docker for development, pnpm as the package manager, and features a comprehensive Web3 integration with multiple wallet adapters (Privy, Silk, and Dummy for testing).

### Technology Stack

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript 5.7
- **Styling**: Tailwind CSS with Radix UI components and Geist fonts
- **Database**: PostgreSQL with Prisma ORM (custom client path)
- **Authentication**: NextAuth.js with SIWE (Sign-In with Ethereum)
- **Web3**: Wagmi, Viem, Ethers.js with multiple wallet adapters
- **Payments**: Stripe integration with Crowdsplit for crypto payments
- **File Storage**: IPFS (Pinata) or local storage for file uploads
- **Monitoring**: Sentry for error tracking and performance monitoring
- **Testing**: Vitest with React Testing Library
- **Code Quality**: ESLint, Prettier with Tailwind plugin, Husky for git hooks
- **Deployment**: Vercel with custom build configurations

### Key Features

1. **Campaign Management**: Create, edit, and manage fundraising campaigns
2. **Web3 Integration**: Wallet connectivity with multiple adapters (Privy, Silk, Dummy)
3. **Dual Payment System**: Support for both crypto (USDC) and credit card payments
4. **Admin Dashboard**: Administrative functionality for campaign approval and management
5. **Collections & Rounds**: Curated campaign collections and quadratic funding rounds
6. **Real-time Notifications**: In-app notification system for user actions
7. **File Storage**: Decentralized IPFS storage with Pinata integration

### Project Structure

**You MUST get permission with the user before creating new folders**

```
/app                        # Next.js 15 App Router
  ├── api/                  # API routes (REST endpoints)
  │   ├── _template/        # Template for new API routes
  │   ├── admin/            # Admin-only endpoints (users, payments, withdrawals)
  │   ├── auth/             # NextAuth.js authentication
  │   ├── campaigns/        # Campaign CRUD operations
  │   ├── collections/      # Collection management
  │   ├── crowdsplit/       # Crypto payment processing
  │   ├── payments/         # Payment tracking
  │   ├── rounds/           # Quadratic funding rounds
  │   └── users/            # User profile management
  ├── admin/                # Admin dashboard pages
  ├── campaigns/            # Campaign detail pages
  ├── collections/          # Collection pages
  ├── dashboard/            # User dashboard
  ├── login/                # Authentication pages
  ├── profile/              # User profile pages
  └── rounds/               # QF round pages

/components                 # React components (75+ files)
  ├── admin/                # Admin dashboard components
  ├── campaign/             # Campaign cards, forms, details
  ├── collection/           # Collection display components
  ├── comment/              # Comment system components
  ├── dashboard/            # Dashboard widgets
  ├── layout/               # Header, footer, navigation
  ├── login/                # Auth UI components
  ├── page/                 # Page-level shared components
  ├── payment/              # Payment flow components
  ├── profile/              # Profile display/edit components
  ├── round/                # QF round components
  ├── ui/                   # Radix UI primitives (Button, Dialog, etc.)
  └── user/                 # User-related components

/lib                        # Business logic and utilities
  ├── api/                  # Server-side API helpers (auth, error, response) + types/
  ├── hooks/                # TanStack Query hooks (useCampaigns, useRounds, etc.)
  ├── web3/                 # Web3 integration layer
  │   ├── adapter/          # Wallet adapters (Privy, Silk, Dummy)
  │   ├── config/           # Chain and wallet configuration
  │   └── hooks/            # Web3-specific React hooks
  ├── crowdsplit/           # Crowdsplit crypto payment SDK
  ├── treasury/             # Treasury contract interactions
  ├── qf/                   # Quadratic funding calculations
  ├── storage/              # File upload (IPFS/local)
  ├── constant/             # App-wide constants
  └── utils/                # General utility functions

/server                     # Server-side configuration (auth, db)
/prisma                     # Database schema and migrations
/contracts                  # Smart contract ABIs
  ├── abi/                  # Main contract ABIs (TreasuryFactory, GlobalParams)
  └── nftABI/               # NFT contract ABIs
/contexts                   # React context providers
/types                      # Global TypeScript type definitions
/styles                     # Global CSS styles
/public                     # Static assets (images, uploads)
/docs                       # Documentation (playbooks, guides)
```

### Docker Operations (MANDATORY)

> **CRITICAL**: Before running ANY of the operations listed below, you MUST consult **[docs/DOCKER_OPERATIONS.md](docs/DOCKER_OPERATIONS.md)** for the correct Docker commands. NEVER run these commands directly on the host system.

**All of the following operations MUST be run inside Docker:**

- Installing dependencies (`pnpm install`, `pnpm add`)
- Updating dependencies (`pnpm update`)
- Running the development server (`pnpm dev`)
- Building the application (`pnpm build`)
- Starting the production server (`pnpm start`)
- Running tests (`pnpm test`)
- Type checking (`pnpm type-check`)
- Linting (`pnpm lint`)
- Formatting code (`pnpm format:write`)
- Shell access for any dev tasks
- All Prisma/database operations

**Quick reference** (always prefix with `docker compose exec app`):

```bash
docker compose exec app pnpm <command>
docker compose exec app bash  # shell access
```

### Codebase Rules
1. Never fetch directly in TSX files. Use hooks.
2. Centralize query invalidation in hooks, not components.
3. Use full variable names, not abbreviations.
4. Keep components under 300 lines. Split if larger.
5. Abstract third-party imports through adapter layer.
6. Centralize shared constants in lib/constant/.

### TypeScript Standards

- **Strict TypeScript**: Strict mode enabled with comprehensive type checking
- **Type Safety**: Prefer `unknown` over `any`, use generics for reusable code
- **Interface vs Type**: Use `interface` for object shapes, `type` for unions/intersections
- **Explicit Types**: Define explicit types for function parameters and return values
- **Path Mapping**: Use `@/` for absolute imports (configured in tsconfig.json)

#### Type Assertion Best Practices (CRITICAL)

> **NEVER USE `as any`**: The `as any` assertion completely disables TypeScript's type safety and should be avoided at all costs.

**Safe Alternatives:**

1. **Use `unknown` and Type Guards**

   ```typescript
   function processData(data: unknown) {
     if (typeof data === 'object' && data !== null && 'id' in data) {
       return (data as { id: string }).id;
     }
     throw new Error('Invalid data structure');
   }
   ```

2. **Use Zod for Runtime Validation** (see API section for full Zod patterns)

   ```typescript
   const CampaignSchema = z.object({ id: z.string(), title: z.string() });
   type Campaign = z.infer<typeof CampaignSchema>;
   const campaign = CampaignSchema.parse(unknownData);
   ```

3. **Type Narrowing with Conditionals** (see Error Handling section)

**Acceptable Use Cases (Sparingly):**

- DOM elements: `document.getElementById('id') as HTMLButtonElement`
- After validation: `validatedData as Campaign` (only after Zod parsing)
- Well-known library types: `prismaResult as Campaign[]`

### Naming Conventions

- **PascalCase**: Types, interfaces, React components
- **camelCase**: Variables, functions, object properties
- **UPPER_SNAKE_CASE**: Constants, environment variables
- **Descriptive Names**: Use explicit, descriptive variable names

### File Organization

- **Absolute Imports**: Use `@/` prefix for internal module imports
- **Feature Grouping**: Group related components in feature-specific folders
- **Type Definitions**: Place types in dedicated `/types` directory
- **Utility Functions**: Organize utilities in `/lib` with clear naming

---

## Database

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

---

## React

### Component Naming and Architecture (MANDATORY)

#### Domain-Meaningful Component Names (CRITICAL)

- **NEVER** name shared UI components using implementation or refactoring-oriented terms
- **FORBIDDEN TERMS**: "unified", "unified-card", "generic", "shared", "common", "base", "wrapper"
- **REQUIRED**: Use domain-meaningful names that reflect the component's actual purpose
- **EXAMPLES**:
  - ✅ `CampaignCard` - clearly indicates it's for displaying campaigns
  - ✅ `UserProfileSection` - describes the specific domain functionality
  - ❌ `UnifiedCard` - implementation detail, not domain meaning
  - ❌ `GenericDisplay` - too abstract, no domain context

#### Component Size Limits (ENFORCED)

- **MAXIMUM**: 200-300 lines of code per component file
- **REQUIRED**: Break down large components into smaller, focused sub-components
- **STRUCTURE**: Use folder structure with index.ts for complex components
- **EXAMPLE**: Split a 800+ line component into:
  - `campaign-card/campaign-card.tsx` (main component, ~170 LOC)
  - `campaign-card/header.tsx` (header logic, ~120 LOC)
  - `campaign-card/content.tsx` (content logic, ~250 LOC)
  - `campaign-card/footer.tsx` (footer logic, ~180 LOC)
  - `campaign-card/index.ts` (exports and documentation)

### Component Patterns

- **Function Components**: Use function components with TypeScript
- **Props Interface**: Define component props with explicit interfaces
- **UI Components**: Import from single barrel export (`@/components/ui`)
- **Custom Hooks**: Extract complex logic into reusable hooks (`lib/hooks/`)
- **Single Responsibility**: Each component should have one clear purpose
- **Forward Ref Pattern**: Use `React.forwardRef` for components that need refs
- **Display Name**: Set `Component.displayName` for debugging
- **Radix UI Integration**: Extensive use of Radix UI primitives for accessibility
- **Toast State Management**: Avoid direct toast calls in catch/business logic. Set state instead and use useEffect to trigger toasts

### Data Fetching (MANDATORY)

> **NEVER USE DIRECT FETCH IN COMPONENTS**: Always use TanStack Query hooks for data fetching.

**Recommended Pattern:**

```typescript
import { useQuery } from '@tanstack/react-query';

function CampaignList() {
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => fetch('/api/campaigns').then(res => res.json()),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;
  return <div>{campaigns?.map(c => <CampaignCard key={c.id} campaign={c} />)}</div>;
}
```

**Custom Hook Pattern (PREFERRED):**

```typescript
// Create reusable custom hooks in lib/hooks/
export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    },
  });
}
```

**For Mutations:**

```typescript
const createMutation = useMutation({
  mutationFn: (data) =>
    fetch('/api/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
});
```

---

## Security

### Authentication & Authorization

#### Role-Based Access Control

- **ALWAYS** use `checkAuth(['role'])` as the FIRST line in protected API routes
- **ALWAYS** validate user sessions before any business logic
- **NEVER** bypass authentication checks, even for internal routes

```typescript
// MANDATORY pattern for all protected routes
export async function GET/POST/PUT/DELETE(req: Request) {
  try {
    const session = await checkAuth(['user']); // or ['admin'] for admin-only
    // ... rest of your logic
  } catch (error: unknown) {
    return handleError(error);
  }
}
```

#### Supported Roles

- `'user'`: Standard authenticated user
- `'admin'`: Administrative privileges
- Use `isAdmin()` for additional admin-specific checks
- Use `checkContractAdmin()` for blockchain admin operations

#### Authentication Errors

- **ALWAYS** use `ApiAuthError` for authentication failures
- **ALWAYS** use `ApiAuthNotAllowed` for authorization failures

### Resource Ownership

- **ALWAYS** verify users can only access/modify their own resources
- **ALWAYS** check ownership before UPDATE/DELETE operations

```typescript
const campaign = await db.campaign.findUnique({ where: { id: campaignId } });

if (campaign?.creatorAddress !== session.user.address && !(await isAdmin())) {
  throw new ApiAuthNotAllowed('Cannot modify campaign owned by another user');
}
```

### Database Security

- **ALWAYS** use Prisma's parameterized queries (automatic with Prisma)
- **NEVER** construct raw SQL queries with user input
- **ALWAYS** validate foreign key relationships

### Testing Authentication

- **ALWAYS** test unauthenticated access (should fail)
- **ALWAYS** test insufficient permissions (should fail)
- **ALWAYS** test valid user access (should succeed)
- **ALWAYS** test admin-only endpoints with both user and admin roles

---

## API

For the full playbook on adding new API routes and hooks, see **[docs/API_INTEGRATION_PLAYBOOK.md](docs/API_INTEGRATION_PLAYBOOK.md)**.

### Route Structure (REQUIRED TEMPLATE)

Follow the exact pattern from `app/api/_template/route.ts`:

```typescript
import { db } from '@/server/db';
import { checkAuth, isAdmin } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiIntegrityError,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';

export async function POST/GET/PUT/DELETE(req: Request) {
  try {
    // 1. ALWAYS start with authentication
    const session = await checkAuth(['user']);

    // 2. Extract and validate parameters
    const { searchParams } = new URL(req.url);
    // or: const data = await req.json();

    // 3. Validate user exists and has permissions
    const user = await db.user.findUnique({
      where: { address: session.user.address },
    });

    if (!user) {
      throw new ApiNotFoundError('User not found');
    }

    // 4. Additional role checks if needed
    if (requiresAdmin && !await isAdmin()) {
      throw new ApiAuthNotAllowed('Admin privileges required');
    }

    // 5. Business logic here

    // 6. Return response
    return response(result);
  } catch (error: unknown) {
    return handleError(error);
  }
}
```

#### Required Imports for All API Routes

```typescript
import { db } from '@/server/db';
import { checkAuth, isAdmin } from '@/lib/api/auth';
import { response, handleError } from '@/lib/api/response';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
```

### Input Validation with Zod (MANDATORY)

- **ALWAYS** define Zod schemas for request bodies and parameters
- **ALWAYS** validate input data before processing
- **ALWAYS** use TypeScript inference from Zod schemas
- **ALWAYS** place schemas in `lib/api/types/<feature>`

```typescript
import { z } from 'zod';

const CreateCampaignSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10),
  targetAmount: z.number().positive(),
});

export async function POST(req: Request) {
  try {
    const session = await checkAuth(['user']);
    const body = await req.json();
    const validatedData = CreateCampaignSchema.parse(body);
    // ... proceed with validated data
  } catch (error: unknown) {
    return handleError(error);
  }
}
```

### Key Patterns

- Server routes: `checkAuth()` → validate with Zod → `response()`/`handleError()`
- Client hooks: `useQuery`/`useInfiniteQuery`/`useMutation` with proper cache invalidation
- Pagination envelope: `{ items: T[], pagination: { currentPage, pageSize, totalPages, totalItems, hasMore } }`

---

## Error Handling and Logging

### Standardized Error Types

- `ApiAuthError`: Authentication failed
- `ApiAuthNotAllowed`: User lacks required permissions
- `ApiNotFoundError`: Requested resource doesn't exist
- `ApiParameterError`: Invalid or missing parameters
- `ApiIntegrityError`: Data consistency violation
- `ApiUpstreamError`: External service failure

### Error Response Format

- **ALWAYS** use `handleError(error)` to ensure consistent error responses
- **ALWAYS** return appropriate HTTP status codes
- **NEVER** expose sensitive information in error messages

### Type Narrowing for Error Handling

```typescript
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else if (typeof error === 'string') {
    console.error(error);
  }
}
```

### Logging Standards

- **Clean Logging**: Avoid excessive emoji use in console logging - keep logs professional and readable
- **Consistent Format**: Use consistent indentation and formatting for log messages
- **Error Logging**: Use appropriate log levels (console.error, console.warn, console.log)
- **Context Information**: Include relevant context in log messages without overwhelming output

---

## Web3

> **MANDATORY**: All Web3 features must support Privy, Silk, AND Dummy wallet adapters

### Multi-Wallet Adapter Requirements

#### Adapter Support Matrix

- **Privy**: Production wallet adapter for real users
- **Silk**: Alternative production wallet adapter
- **Dummy**: **CRITICAL** testing adapter that MUST mirror all functionality

#### Unified Interface Pattern

```typescript
interface WalletAdapter {
  useWeb3Auth(): IWeb3UseAuthHook;
  getProvider(): EthereumProvider;
  ethers: typeof import('ethers');
}
```

### Dummy Wallet Adapter (ABSOLUTELY ESSENTIAL)

Every Web3 feature MUST have a corresponding dummy implementation for testing.

#### Critical Dummy Features

1. **Authentication Simulation**

   ```typescript
   await nextAuthSignIn('siwe', {
     redirect: false,
     message: userAddress,
     signature: userAddress, // Dummy signature
   });
   ```

2. **Transaction Simulation**

   ```typescript
   const mockTransaction = {
     hash: `0x${BigInt(Date.now()).toString(16)}`,
     wait: async () => ({
       status: 1,
       blockNumber: Math.floor(Math.random() * 1000000),
       transactionHash: `0x${BigInt(Date.now()).toString(16)}`,
     }),
   };
   ```

3. **Contract Interaction Mocking**

   ```typescript
   export async function readContract(config: unknown, contract: unknown) {
     await new Promise((resolve) => setTimeout(resolve, 500));
     return '1000000000000000000'; // Mock result
   }
   ```

4. **Admin Mode Testing**

   - Addresses starting with `0xadadad` automatically get admin privileges
   - Must allow testing of admin-only contract functions
   - Should redirect admin users to `/admin` after login

5. **State Management**
   - Must track connection states (connecting, connected, disconnected)
   - Must handle chain switching events
   - Must persist dummy auth state in localStorage

#### Implementation Checklist

- ✅ Mock wallet connection/disconnection
- ✅ Simulate transaction signing with delays
- ✅ Handle contract read/write operations
- ✅ Provide realistic gas estimates
- ✅ Support chain switching simulation
- ✅ Generate valid-looking addresses and transaction hashes
- ✅ Implement admin testing mode
- ✅ Provide equivalent error scenarios for testing

#### Testing with Dummy Wallet

- **ALWAYS** verify dummy wallet provides equivalent functionality
- **ALWAYS** test complete user workflows in dummy mode
- **ALWAYS** ensure dummy responses match expected formats
- **ALWAYS** test error scenarios in dummy mode

### Smart Contract Integration

#### ABI Organization

- **ALWAYS** store contract ABIs in `/contracts/abi/` directory
- **ALWAYS** use TypeScript interfaces generated from ABIs
- **ALWAYS** implement dummy equivalents for contract interactions

#### Contract Interaction Pattern

```typescript
// Real implementation
import { readContract } from 'wagmi';
import { contractABI } from '@/contracts/abi/MyContract';

// Dummy implementation must provide equivalent
import { readContract } from '@/lib/web3/adapter/dummy/wagmi';
```

### Transaction State Management

#### Required Transaction States

- `idle`: No transaction in progress
- `pending`: Transaction submitted, waiting for confirmation
- `confirmed`: Transaction confirmed on blockchain
- `failed`: Transaction failed or reverted

#### State Tracking Pattern

```typescript
const [transactionState, setTransactionState] = useState<{
  status: 'idle' | 'pending' | 'confirmed' | 'failed';
  hash?: string;
  error?: string;
}>({ status: 'idle' });
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

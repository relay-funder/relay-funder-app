# Logger Module

A configurable, conditional logging system for the application that supports debug flags, user-specific verbose logging, hierarchical prefixes with symbols, and callable logger instances.

## Features

- **Log Types**: `debug`, `info`, `warn`, `error` with color-coded output
- **Debug Flags**: Control logging via `NEXT_PUBLIC_DEBUG_FLAGS` environment variable
- **User Addresses**: Verbose logging in production via `NEXT_PUBLIC_VERBOSE_USERS`
- **Prefixes**: Organized log output with hierarchical prefixes and optional symbols
- **Callable Interface**: Use logger as a function: `logger('message')` - preserves stack traces
- **Child Loggers**: Factory pattern for creating loggers that inherit parent configuration
- **Set-based Storage**: Addresses and flags stored as Sets to prevent duplicates

## Environment Variables

### `NEXT_PUBLIC_DEBUG_FLAGS`

Comma-separated list of debug flags to enable logging. Use `all` to enable all flags.

```bash
NEXT_PUBLIC_DEBUG_FLAGS="api,web3,auth"
# Or enable everything:
NEXT_PUBLIC_DEBUG_FLAGS="all"
```

Available flags include: `debug`, `web3`, `api`, `lib`, `auth`, `hook`, `qf`, `component`

**How it works:**

- Flags are parsed into a Set (duplicates automatically removed)
- Case-insensitive matching
- If `all` is present, all loggers with any flag will log
- If a logger's flag matches any flag in the environment variable, logging is enabled

### `NEXT_PUBLIC_VERBOSE_USERS`

Comma-separated list of user addresses that should receive verbose logging in production.

```bash
NEXT_PUBLIC_VERBOSE_USERS="0x123...,0x456..."
```

**How it works:**

- Addresses are parsed into a Set (duplicates automatically removed)
- Case-insensitive matching
- Only works in production (`IS_PRODUCTION === true`)
- Allows specific users to see debug logs in production without enabling global debug flags

## Basic Usage

The Logger instance is callable as a function. When you call `logger('message')`, it preserves the stack trace and forwards to the appropriate console method.

```ts
import { Logger } from '@/lib/logger';

// Create a logger with prefix and debug flag
const logger = new Logger({ prefix: 'MyComponent', flag: 'component' });

// Use as a callable function - preserves stack trace!
logger('This is a debug message');
// Output: [MyComponent]: This is a debug message

// Change log type
logger.setType('error');
logger('This is an error message'); // Always logged (uses console.error)
```

## Prefix Configuration

Prefixes can include text, symbols, and custom separators.

### Simple Text Prefix

```ts
const logger = new Logger({ prefix: 'API' });
logger('Request started');
// Output: [API]: Request started
```

### Prefix with Symbol

```ts
const logger = new Logger({
  prefix: { symbol: '🚀', text: 'API', separator: ' ' },
});
logger('Request started');
// Output: 🚀 [API]: Request started
```

### Hierarchical Prefixes

```ts
const parentLogger = new Logger({ prefix: 'Parent' });
const childLogger = parentLogger.factory({ prefix: 'Child' });
childLogger('Message');
// Output: [Parent | Child]: Message
```

### Custom Prefix Separator

```ts
const logger = new Logger({
  prefix: { text: 'App', separator: ' > ' },
});
const subLogger = logger.factory({ prefix: 'Module' });
subLogger('Message');
// Output: [App > Module]: Message
```

## Debug Flags

Enable logging via debug flags by setting `NEXT_PUBLIC_DEBUG_FLAGS` in your `.env` file.

### Single Flag

```ts
// Set NEXT_PUBLIC_DEBUG_FLAGS="api" in your .env

const apiLogger = new Logger({ prefix: 'API', flag: 'api' });
apiLogger('API call started'); // Logs if 'api' flag is enabled
```

### Multiple Flags

```ts
// Set NEXT_PUBLIC_DEBUG_FLAGS="api,web3" in your .env

const logger = new Logger({ flag: ['api', 'web3'] });
// Or as comma-separated string:
const logger2 = new Logger({ flag: 'api,web3' });

// Logs if EITHER 'api' OR 'web3' flag is enabled
logger('Message');
```

### Adding Flags Dynamically

```ts
const logger = new Logger({ flag: 'api' });
logger.addFlag('web3'); // Now logs if 'api' OR 'web3' enabled
logger.addFlags(['auth', 'hook']); // Add multiple at once
```

### Enable All Flags

```ts
// Set NEXT_PUBLIC_DEBUG_FLAGS="all" in your .env

// Now ALL loggers with ANY flag will log
const logger = new Logger({ flag: 'api' });
logger('This will log'); // Logs because 'all' is enabled
```

## Production Verbose Logging

Enable verbose logging for specific users in production by setting `NEXT_PUBLIC_VERBOSE_USERS`.

```ts
// Set NEXT_PUBLIC_VERBOSE_USERS="0x123...,0x456..." in production

const logger = new Logger({
  prefix: 'UserAction',
  address: '0x123...', // User's address
});

// In production, logs only appear for addresses in NEXT_PUBLIC_VERBOSE_USERS
logger('User performed action'); // Only logs if address matches
```

### Multiple Addresses

```ts
// Single address
const logger = new Logger({ address: '0x123...' });

// Multiple addresses (array)
const logger2 = new Logger({ address: ['0x123...', '0x456...'] });

// Multiple addresses (comma-separated string)
const logger3 = new Logger({ address: '0x123...,0x456...' });

// Add addresses dynamically
logger.addAddress('0x789...');
logger.addAddresses(['0xabc...', '0xdef...']);
```

## Child Loggers (Factory Pattern)

Create child loggers that inherit configuration from a parent logger. Child loggers merge their configuration with the parent's.

```ts
// Create a parent logger
const parentLogger = new Logger({
  prefix: 'ParentComponent',
  flag: 'component',
  address: '0x123...',
});

// Create child loggers that inherit configuration
const childLogger1 = parentLogger.factory({ prefix: 'Child1' });
const childLogger2 = parentLogger.factory({ prefix: 'Child2' });

childLogger1('Message from child 1');
// Output: [ParentComponent | Child1]: Message from child 1
// Inherits: 'component' flag, '0x123...' address

childLogger2('Message from child 2');
// Output: [ParentComponent | Child2]: Message from child 2
// Inherits: 'component' flag, '0x123...' address
```

### Inheritance Rules

- **Prefix**: Merged with parent's prefix using separator
- **Flags**: Combined with parent's flags (Set union - no duplicates)
- **Addresses**: Combined with parent's addresses (Set union - no duplicates)
- **Type**: Inherits parent's type unless overridden

## Dynamic Configuration

Update logger configuration at runtime. Changes take effect immediately.

```ts
const logger = new Logger({ prefix: 'App' });

// Update prefix
logger.setPrefix('API');
logger.setPrefixSymbol('🚀');

// Update flags
logger.setFlags(['api', 'web3']);
logger.addFlag('auth');

// Update addresses
logger.setAddresses(['0x123...']);
logger.addAddress('0x456...');

// Change log type
logger.setType('info');

// Append to prefix
logger.addPrefix('Request'); // Now: 'API | Request'
```

## Error and Warning Logging

Errors and warnings are **always logged**, regardless of debug flags or addresses.

```ts
const logger = new Logger();

// Errors are always logged
logger.setType('error');
logger('Critical error occurred'); // Always logged

// Warnings are always logged
logger.setType('warn');
logger('Warning: deprecated API'); // Always logged

// Debug/info logs require flags or verbose addresses
logger.setType('debug');
logger('Debug info'); // Only if flag enabled or verbose address
```

## Logging Behavior

Logging is enabled when **any** of these conditions are met:

1. **Log type is `error` or `warn`** - Always logged regardless of flags
2. **Debug flag matches** - Logger's flag(s) match `NEXT_PUBLIC_DEBUG_FLAGS` (or `all` is set)
3. **Production verbose address** - In production AND logger's address matches `NEXT_PUBLIC_VERBOSE_USERS`

If none of these conditions are met, the logger function is a no-op (does nothing).

### Flag Matching Logic

- Flags are stored as Sets internally (no duplicates)
- Matching is case-insensitive
- If `NEXT_PUBLIC_DEBUG_FLAGS` contains `all`, all loggers with any flag will log
- Otherwise, logger logs if **any** of its flags match **any** flag in the environment variable

### Address Matching Logic

- Addresses are stored as Sets internally (no duplicates)
- Matching is case-insensitive
- Only works in production
- Logger logs if **any** of its addresses match **any** address in `NEXT_PUBLIC_VERBOSE_USERS`

## API Reference

### Constructor

```ts
new Logger(config?: LoggerConstructorConfig, parent?: Logger)
```

Creates a new Logger instance. When `parent` is provided, creates a child logger that inherits parent configuration.

**Config Options:**

- `type?: LogType` - Log level (default: `'debug'` or inherits from parent)
- `prefix?: string | { symbol?: string; text?: string; separator?: string }` - Prefix configuration
  - String: Simple text prefix (e.g., `'API'`)
  - Object: Full prefix config with symbol, text, and separator
- `address?: string | string[]` - User address(es) for verbose logging
- `flag?: string | string[]` - Debug flag(s) that enable logging (default: `'debug'`)
- `appendPrefix?: (prefixA?: string, prefixB?: string) => string` - Custom prefix combiner

### Methods

#### `setPrefix(text: string): void`

Sets the prefix text, replacing any existing text.

```ts
logger.setPrefix('API');
logger('Message'); // Output: [API]: Message
```

#### `setPrefixSymbol(symbol: string): void`

Sets the prefix symbol (emoji, icon, etc.).

```ts
logger.setPrefixSymbol('🚀');
logger.setPrefix('API');
logger('Message'); // Output: 🚀 [API]: Message
```

#### `setType(type: LogType): void`

Sets the log type/level.

```ts
logger.setType('error');
logger('Error message'); // Uses console.error
```

#### `setFlags(flags: string[]): void`

Sets the debug flags, replacing any existing flags.

```ts
logger.setFlags(['api', 'web3']);
```

#### `setAddresses(addresses: string[]): void`

Sets the user addresses, replacing any existing addresses.

```ts
logger.setAddresses(['0x123...', '0x456...']);
```

#### `addPrefix(text: string): void`

Appends text to the existing prefix, separated by the configured separator.

```ts
logger.setPrefix('API');
logger.addPrefix('Request');
logger('Message'); // Output: [API | Request]: Message
```

#### `addFlag(flag: string): void`

Adds a debug flag to the existing flags (no duplicates).

```ts
logger.addFlag('api');
logger.addFlag('web3');
```

#### `addFlags(flags: string[]): void`

Adds multiple debug flags at once.

```ts
logger.addFlags(['api', 'web3', 'auth']);
```

#### `addAddress(address: string): void`

Adds an address to the existing addresses (no duplicates).

```ts
logger.addAddress('0x123...');
```

#### `addAddresses(addresses: string[]): void`

Adds multiple addresses at once.

```ts
logger.addAddresses(['0x123...', '0x456...']);
```

#### `factory(config?: LoggerConstructorConfig): Logger`

Creates a child logger that inherits configuration from this logger.

```ts
const parent = new Logger({ prefix: 'Parent', flag: 'debug' });
const child = parent.factory({ prefix: 'Child' });
child('Message'); // Output: [Parent | Child]: Message
// Child inherits 'debug' flag from parent
```

## Advanced Examples

### Component-Level Logging

```ts
// In a React component
const logger = useMemo(
  () =>
    new Logger({
      prefix: 'MyComponent',
      flag: 'component',
    }),
  [],
);

logger('Component rendered');
logger('State updated', { state });
```

### User-Specific Logging

```ts
const { address } = useAccount();

const userLogger = useMemo(
  () =>
    new Logger({
      prefix: 'UserAction',
      address: address, // User's wallet address
    }),
  [address],
);

userLogger('User clicked button'); // Only logs in prod if address matches
```

### API Request Logging

```ts
const apiLogger = new Logger({
  prefix: { symbol: '🌐', text: 'API', separator: ' ' },
  flag: 'api',
});

const requestLogger = apiLogger.factory({ prefix: 'Request' });

requestLogger('GET /api/users');
// Output: 🌐 [API | Request]: GET /api/users
```

### Error Handler Logger

```ts
const errorLogger = new Logger({
  type: 'error',
  prefix: { symbol: '❌', text: 'Error', separator: ' ' },
});

errorLogger('Failed to fetch data', error); // Always logged
```

## Implementation Details

### Stack Trace Preservation

The logger uses a callable function pattern that preserves stack traces. When you call `logger('message')`, the call site is preserved in the stack trace, making debugging easier.

### Set-Based Storage

Addresses and flags are stored as `Set<string>` internally, which:

- Automatically prevents duplicates
- Provides O(1) lookup performance
- Makes comparisons efficient

### Color-Coded Output

Log messages are color-coded based on log type:

- `debug`: Cyan
- `info`: Blue
- `warn`: Yellow
- `error`: Red

Colors use ANSI escape codes and work in most terminals.

## See Also

- `LogType` - Available log types (`'debug' | 'info' | 'warn' | 'error'`)
- `formatLogPrefix()` - Prefix formatting logic
- `appendPrefixHelper()` - Prefix combination logic

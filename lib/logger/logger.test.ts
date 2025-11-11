import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatLogPrefix, appendString, appendPrefixHelper } from './utils';

// Create spies once at module level - they persist across test runs
const consoleSpy = {
  debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
  info: vi.spyOn(console, 'info').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
};

describe('Logger', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', '');
    vi.stubEnv('NEXT_PUBLIC_VERBOSE_USERS', '');
    vi.stubEnv('NODE_ENV', '');
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', '');
    Object.values(consoleSpy).forEach((spy) => spy.mockClear());
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('Basic Logger Creation', () => {
    it('should create a logger with default config', async () => {
      const { Logger } = await import('./logger');
      const logger = new Logger();
      expect(logger).toBeDefined();
      const prefix = logger.getPrefix();
      expect(prefix).toBe('');
      const type = logger.getType();
      expect(type).toBe('debug');
      const prefixSeparator = logger.getPrefixSeparator();
      expect(prefixSeparator).toBe(' | ');
      const addresses = logger.getAddresses();
      expect(addresses).toEqual([]);
      const flags = logger.getFlags();
      expect(flags).toEqual(['debug']);
      const prefixSymbol = logger.getPrefixSymbol();
      expect(prefixSymbol).toBe('');
      expect(typeof logger).toBe('function');
    });

    it('should create a logger with custom prefix', async () => {
      const { Logger } = await import('./logger');
      const logger = new Logger({ prefix: 'Test' });
      const prefix = logger.getPrefix();
      expect(prefix).toBe('Test');
    });

    it('should create a logger with custom type', async () => {
      const { Logger } = await import('./logger');
      const logger = new Logger({ type: 'error' });
      const type = logger.getType();
      expect(type).toBe('error');
    });

    it('should be callable as a function', async () => {
      const { Logger } = await import('./logger');
      const logger = new Logger({ prefix: 'Test' });
      expect(typeof logger).toBe('function');
      logger('test message');
    });
  });

  describe('Flag-Based Logging', () => {
    it('should log when flag matches NEXT_PUBLIC_DEBUG_FLAGS', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ prefix: 'API', flag: 'api' });
      logger('test message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*API.*\]/),
        'test message',
      );
    });

    it('should not log when flag does not match', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'web3');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ prefix: 'API', flag: 'api' });
      logger('test message');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('should log when any flag matches', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api,web3');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ flag: ['api', 'other'] });
      logger('test message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching('test message'),
      );
    });

    it('should log when "all" flag is set', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'all');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ flag: 'any-flag' });
      logger('test message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching('test message'),
      );
    });

    it('should handle case-insensitive flag matching', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'API');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ flag: 'api' });
      logger('test message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching('test message'),
      );
    });

    it('should handle multiple flags as string', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ flag: 'api,web3' });
      logger('test message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching('test message'),
      );
    });

    it('should prevent duplicate flags', async () => {
      const { Logger } = await import('./logger');
      const logger = new Logger({ flag: ['api', 'api', 'web3'] });
      logger.addFlag('api');
      logger.addFlags(['web3', 'api']);
      expect(logger).toBeDefined();
      expect(logger.getFlags()).toEqual(['api', 'web3']);
    });
  });

  describe('Error and Warning Logging', () => {
    it('should always log errors regardless of flags', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', '');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ type: 'error' });
      expect(logger.getType()).toBe('error');
      logger('error message');
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringMatching('error message'),
      );
    });

    it('should always log warnings regardless of flags', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', '');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ type: 'warn' });
      expect(logger.getType()).toBe('warn');
      logger('warning message');
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringMatching('warning message'),
      );
    });

    it('should use correct console method for error', async () => {
      const { Logger } = await import('./logger');
      const logger = new Logger({ type: 'error' });
      expect(logger.getType()).toBe('error');
      logger('error');
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringMatching('error'),
      );
    });

    it('should use correct console method for warn', async () => {
      const { Logger } = await import('./logger');
      const logger = new Logger({ type: 'warn' });
      expect(logger.getType()).toBe('warn');
      logger('warning');
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringMatching('warning'),
      );
    });

    it('should use correct console method for info', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ type: 'info', flag: 'api' });
      expect(logger.getType()).toBe('info');
      expect(logger.getFlags()).toContain('api');
      logger('info');
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringMatching('info'),
      );
    });

    it('should use correct console method for debug', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ type: 'debug', flag: 'api' });
      expect(logger.getType()).toBe('debug');
      expect(logger.getFlags()).toContain('api');
      logger('debug');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching('debug'),
      );
    });
  });

  describe('Prefix Handling', () => {
    it('should format prefix with text only', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ prefix: 'API', flag: 'api' });
      expect(logger.getPrefix()).toBe('API');
      expect(logger.getFlags()).toContain('api');
      logger('message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*API.*\]/),
        'message',
      );
    });

    it('should format prefix with symbol', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({
        prefix: { symbol: '🚀', text: 'API', separator: ' ' },
        flag: 'api',
      });
      expect(logger.getPrefix()).toBe('API');
      expect(logger.getPrefixSymbol()).toBe('🚀');
      expect(logger.getPrefixSeparator()).toBe(' ');
      expect(logger.getFlags()).toContain('api');
      logger('message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching(/🚀.*\[.*API.*\]/),
        'message',
      );
    });

    it('should handle hierarchical prefixes', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const parent = new Logger({ prefix: 'Parent', flag: 'api' });
      expect(parent.getPrefix()).toBe('Parent');
      const child = parent.factory({ prefix: 'Child' });
      expect(child.getPrefix()).toContain('Parent');
      expect(child.getPrefix()).toContain('Child');
      child('message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*Parent.*Child.*\]/),
        'message',
      );
    });

    it('should use custom separator', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({
        prefix: { text: 'App', separator: ' > ' },
        flag: 'api',
      });
      expect(logger.getPrefixSeparator()).toBe(' > ');
      const child = logger.factory({ prefix: 'Module' });
      expect(child.getPrefixSeparator()).toBe(' > ');
      child('message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*App.*>.*Module.*\]/),
        'message',
      );
    });

    it('should update prefix dynamically', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ prefix: 'Old', flag: 'api' });
      expect(logger.getPrefix()).toBe('Old');
      logger.setPrefix('New');
      expect(logger.getPrefix()).toBe('New');
      logger('message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*New.*\]/),
        'message',
      );
    });

    it('should append to prefix', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ prefix: 'API', flag: 'api' });
      expect(logger.getPrefix()).toBe('API');
      logger.addPrefix('Request');
      expect(logger.getPrefix()).toContain('API');
      expect(logger.getPrefix()).toContain('Request');
      logger('message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*API.*Request.*\]/),
        'message',
      );
    });

    it('should update prefix symbol', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ prefix: 'API', flag: 'api' });
      expect(logger.getPrefixSymbol()).toBe('');
      logger.setPrefixSymbol('🚀');
      expect(logger.getPrefixSymbol()).toBe('🚀');
      logger('message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching(/🚀.*\[.*API.*\]/),
        'message',
      );
    });
  });

  describe('Address-Based Verbose Logging', () => {
    it('should log when address matches NEXT_PUBLIC_VERBOSE_USERS in production', async () => {
      vi.stubEnv('NEXT_PUBLIC_VERBOSE_USERS', '0xabc...');
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ address: '0xabc...' });
      expect(logger.getAddresses()).toContain('0xabc...');
      logger('message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching('message'),
      );
    });

    it('should not log when address matches NEXT_PUBLIC_VERBOSE_USERS in development', async () => {
      vi.stubEnv('NEXT_PUBLIC_VERBOSE_USERS', '0xabc...');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ address: '0xabc...' });
      expect(logger.getAddresses()).toContain('0xabc...');
      logger('message');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('should not log when address does not match NEXT_PUBLIC_VERBOSE_USERS in production', async () => {
      vi.stubEnv('NEXT_PUBLIC_VERBOSE_USERS', '0xabc...');
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ address: '0xdef...' });
      expect(logger.getAddresses()).toContain('0xdef...');
      expect(logger.getAddresses()).not.toContain('0xabc...');
      logger('message');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('should handle multiple addresses', async () => {
      vi.stubEnv('NEXT_PUBLIC_VERBOSE_USERS', '0xabc...');
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ address: ['0x123...', '0xabc...'] });
      expect(logger.getAddresses()).toContain('0x123...');
      expect(logger.getAddresses()).toContain('0xabc...');
      logger('message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching('message'),
      );
    });

    it('should prevent duplicate addresses', async () => {
      const { Logger } = await import('./logger');
      const logger = new Logger({ address: ['0x123...', '0x123...'] });
      expect(logger.getAddresses()).toEqual(['0x123...']);
      logger.addAddress('0x123...');
      logger.addAddresses(['0x123...', '0x456...']);
      expect(logger.getAddresses()).toEqual(['0x123...', '0x456...']);
    });

    it('should handle address as comma-separated string', async () => {
      vi.stubEnv('NEXT_PUBLIC_VERBOSE_USERS', '0xabc...');
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ address: '0xabc...,0x456...' });
      expect(logger.getAddresses()).toContain('0xabc...');
      expect(logger.getAddresses()).toContain('0x456...');
      logger('message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching('message'),
      );
    });
  });

  describe('Child Logger Inheritance', () => {
    it('should inherit parent prefix', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const parent = new Logger({ prefix: 'Parent', flag: 'api' });
      expect(parent.getPrefix()).toBe('Parent');
      const child = parent.factory({ prefix: 'Child' });
      expect(child.getPrefix()).toContain('Parent');
      expect(child.getPrefix()).toContain('Child');
      child('message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*Parent.*Child.*\]/),
        'message',
      );
    });

    it('should inherit parent flags', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const parent = new Logger({ flag: 'api' });
      expect(parent.getFlags()).toContain('api');
      const child = parent.factory({ prefix: 'Child' });
      expect(child.getFlags()).toContain('api');
      child('message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('should merge parent and child flags', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api,web3');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const parent = new Logger({ flag: 'api' });
      expect(parent.getFlags()).toContain('api');
      const child = parent.factory({ flag: 'web3' });
      expect(child.getFlags()).toContain('api');
      expect(child.getFlags()).toContain('web3');
      child('message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('should inherit parent addresses', async () => {
      const { Logger } = await import('./logger');
      const parent = new Logger({ address: '0x123...' });
      expect(parent.getAddresses()).toContain('0x123...');
      const child = parent.factory({ prefix: 'Child' });
      expect(child.getAddresses()).toContain('0x123...');
    });

    it('should merge parent and child addresses', async () => {
      const { Logger } = await import('./logger');
      const parent = new Logger({ address: '0x123...' });
      expect(parent.getAddresses()).toContain('0x123...');
      const child = parent.factory({ address: '0x456...' });
      expect(child.getAddresses()).toContain('0x123...');
      expect(child.getAddresses()).toContain('0x456...');
    });

    it('should inherit parent type', async () => {
      const { Logger } = await import('./logger');
      const parent = new Logger({ type: 'error' });
      expect(parent.getType()).toBe('error');
      const child = parent.factory({ prefix: 'Child' });
      expect(child.getType()).toBe('error');
      child('message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should allow overriding parent type', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const parent = new Logger({ type: 'error', flag: 'api' });
      expect(parent.getType()).toBe('error');
      const child = parent.factory({ type: 'debug' });
      expect(child.getType()).toBe('debug');
      child('message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('should create child without config', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const parent = new Logger({ prefix: 'Parent', flag: 'api' });
      expect(parent.getPrefix()).toBe('Parent');
      const child = parent.factory();
      expect(child.getPrefix()).toBe('Parent');
      expect(child.getFlags()).toEqual(parent.getFlags());
      child('message');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*Parent.*\]/),
        'message',
      );
    });
  });

  describe('Dynamic Configuration', () => {
    it('should update flags dynamically', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ flag: 'web3' });
      expect(logger.getFlags()).toContain('web3');
      logger('message');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      logger.setFlags(['api']);
      expect(logger.getFlags()).toEqual(['api']);
      logger('message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('should update addresses dynamically', async () => {
      const { Logger } = await import('./logger');
      const logger = new Logger();
      expect(logger.getAddresses()).toEqual([]);
      logger.setAddresses(['0x123...']);
      expect(logger.getAddresses()).toEqual(['0x123...']);
    });

    it('should update type dynamically', async () => {
      const { Logger } = await import('./logger');
      const logger = new Logger({ type: 'debug' });
      expect(logger.getType()).toBe('debug');
      logger.setType('error');
      expect(logger.getType()).toBe('error');
      logger('message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should add flags dynamically', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api,web3');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ flag: 'api' });
      expect(logger.getFlags()).toContain('api');
      logger.addFlag('web3');
      expect(logger.getFlags()).toContain('api');
      expect(logger.getFlags()).toContain('web3');
      logger('message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('should add multiple flags at once', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api,web3,auth');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ flag: 'api' });
      expect(logger.getFlags()).toContain('api');
      logger.addFlags(['web3', 'auth']);
      expect(logger.getFlags()).toContain('api');
      expect(logger.getFlags()).toContain('web3');
      expect(logger.getFlags()).toContain('auth');
      logger('message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('should add addresses dynamically', async () => {
      const { Logger } = await import('./logger');
      const logger = new Logger({ address: '0x123...' });
      expect(logger.getAddresses()).toContain('0x123...');
      logger.addAddress('0x456...');
      expect(logger.getAddresses()).toContain('0x123...');
      expect(logger.getAddresses()).toContain('0x456...');
    });

    it('should add multiple addresses at once', async () => {
      const { Logger } = await import('./logger');
      const logger = new Logger({ address: '0x123...' });
      expect(logger.getAddresses()).toContain('0x123...');
      logger.addAddresses(['0x456...', '0x789...']);
      expect(logger.getAddresses()).toContain('0x123...');
      expect(logger.getAddresses()).toContain('0x456...');
      expect(logger.getAddresses()).toContain('0x789...');
    });
  });

  describe('Set Operations', () => {
    it('should prevent duplicate flags', async () => {
      const { Logger } = await import('./logger');
      const logger = new Logger({ flag: ['api', 'api', 'web3'] });
      expect(logger.getFlags()).toEqual(['api', 'web3']);
      logger.addFlag('api');
      logger.addFlags(['web3', 'api']);
      expect(logger.getFlags()).toEqual(['api', 'web3']);
    });

    it('should prevent duplicate addresses', async () => {
      const { Logger } = await import('./logger');
      const logger = new Logger({ address: ['0x123...', '0x123...'] });
      expect(logger.getAddresses()).toEqual(['0x123...']);
      logger.addAddress('0x123...');
      logger.addAddresses(['0x123...', '0x456...']);
      expect(logger.getAddresses()).toEqual(['0x123...', '0x456...']);
    });
  });

  describe('No-Op Behavior', () => {
    it('should not log when no conditions are met', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', '');
      vi.stubEnv('NEXT_PUBLIC_VERBOSE_USERS', '');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ prefix: 'Test', flag: 'api' });
      logger('message');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should not log debug when flag does not match', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'web3');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ prefix: 'Test', flag: 'api' });
      logger('message');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Arguments', () => {
    it('should pass multiple arguments to console', async () => {
      vi.stubEnv('NEXT_PUBLIC_DEBUG_FLAGS', 'api');
      vi.resetModules();
      const { Logger } = await import('./logger');
      const logger = new Logger({ prefix: 'Test', flag: 'api' });
      logger('message', { data: 'test' }, 123);
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*Test.*\]/),
        'message',
        { data: 'test' },
        123,
      );
    });
  });
});

describe('Utils', () => {
  describe('formatLogPrefix', () => {
    it('should format prefix with text', () => {
      const result = formatLogPrefix('Test', 'debug');
      expect(result).toMatch(/\[.*Test.*\]/);
    });

    it('should format prefix with symbol', () => {
      const result = formatLogPrefix('Test', 'debug', '🚀');
      expect(result).toContain('🚀');
      expect(result).toMatch(/\[.*Test.*\]/);
    });

    it('should return empty string for empty prefix', () => {
      const result = formatLogPrefix('', 'debug');
      expect(result).toBe('');
    });

    it('should include color codes', () => {
      const result = formatLogPrefix('Test', 'error');
      expect(result).toContain('\x1b[31m'); // Red color code
    });
  });

  describe('appendString', () => {
    it('should append two strings with separator', () => {
      expect(appendString('a', 'b', ' | ')).toBe('a | b');
    });

    it('should handle undefined first string', () => {
      expect(appendString(undefined, 'b')).toBe('b');
    });

    it('should handle undefined second string', () => {
      expect(appendString('a', undefined)).toBe('a');
    });

    it('should handle both undefined', () => {
      expect(appendString(undefined, undefined)).toBe('');
    });

    it('should use empty separator by default', () => {
      expect(appendString('a', 'b')).toBe('ab');
    });
  });

  describe('appendPrefixHelper', () => {
    it('should combine prefixes with separator', () => {
      const result = appendPrefixHelper('Parent', 'Child', ' | ');
      expect(result).toBe('Parent | Child');
    });

    it('should use custom append function', () => {
      const customFn = (a = '', b = '') => `${a} > ${b}`;
      const result = appendPrefixHelper('Parent', 'Child', '', customFn);
      expect(result).toBe('Parent > Child');
    });

    it('should handle empty prefixes', () => {
      expect(appendPrefixHelper('', 'Child', ' | ')).toBe('Child');
      expect(appendPrefixHelper('Parent', '', ' | ')).toBe('Parent');
    });
  });
});

/**
 * @fileoverview Configurable conditional logging system.
 * @module logger
 * @see {@link ./README.md} for detailed usage documentation
 */

import { debugAddressesSet, debugFlagsSet, isProduction } from './contants';
import { LogType } from './types';
import { appendPrefixHelper, appendString, formatLogPrefix } from './utils';

interface LoggerConfig {
  type: LogType;
  prefix: { symbol: string; text: string; separator: string };
  addresses: Set<string>;
  flags: Set<string>;
}

interface LoggerConstructorConfig {
  type?: LogType;
  prefix?: string | { symbol?: string; text?: string; separator?: string };
  address?: string | string[];
  flag?: string | string[];
  appendPrefix?: (prefixA?: string, prefixB?: string) => string;
}

const defaultConfig: LoggerConfig = {
  type: 'debug',
  prefix: { symbol: '', text: '', separator: ' | ' },
  addresses: new Set(),
  flags: new Set(['debug']),
};

/**
 * Callable logger class supporting conditional logging via flags, addresses, and prefixes.
 * Instances are callable as functions: `logger('message')`
 */
export class Logger extends Function {
  private config: LoggerConfig;
  _call: (...args: unknown[]) => void = () => {};

  /** Creates a new Logger instance. */
  constructor(config?: LoggerConstructorConfig, parent?: Logger) {
    super();
    if (parent instanceof Logger) {
      if (!config) {
        this.config = {
          ...parent.config,
          addresses: new Set(parent.config.addresses),
          flags: new Set(parent.config.flags),
          prefix: { ...parent.config.prefix },
        };
      } else {
        const prefix = { ...parent.config.prefix };
        if (config.prefix !== undefined) {
          if (typeof config.prefix === 'string') {
            prefix.text = appendPrefixHelper(
              parent.config.prefix.text,
              config.prefix,
              parent.config.prefix.separator,
              config.appendPrefix,
            );
          } else {
            prefix.symbol = config.prefix.symbol ?? prefix.symbol;
            prefix.separator = config.prefix.separator ?? prefix.separator;
            prefix.text = appendPrefixHelper(
              prefix.text,
              config.prefix.text,
              prefix.separator,
              config.appendPrefix,
            );
          }
        }

        const type = config.type ?? parent.config.type;

        const addresses = new Set(parent.config.addresses);
        if (config.address) {
          const addressesToAdd = Array.isArray(config.address)
            ? config.address
            : typeof config.address === 'string'
              ? config.address
                  .split(',')
                  .map((a) => a.trim())
                  .filter((a) => a)
              : [config.address];
          addressesToAdd.forEach((addr) => addresses.add(addr));
        }

        const flags = new Set(parent.config.flags);
        if (config.flag) {
          const flagsToAdd = Array.isArray(config.flag)
            ? config.flag
            : typeof config.flag === 'string'
              ? config.flag
                  .split(',')
                  .map((f) => f.trim())
                  .filter((f) => f)
              : [config.flag];
          flagsToAdd.forEach((flag) => flags.add(flag));
        }

        this.config = {
          type,
          prefix,
          addresses,
          flags,
        };
      }
    } else {
      if (!config) {
        this.config = {
          ...defaultConfig,
          prefix: { ...defaultConfig.prefix },
          flags: new Set(defaultConfig.flags),
          addresses: new Set(defaultConfig.addresses),
        };
      } else {
        // Handle normal constructor: new Logger({...})
        const addresses = new Set<string>();
        if (config.address) {
          const addressesToAdd = Array.isArray(config.address)
            ? config.address
            : typeof config.address === 'string'
              ? config.address
                  .split(',')
                  .map((a) => a.trim())
                  .filter((a) => a)
              : [config.address];
          addressesToAdd.forEach((addr) => addresses.add(addr));
        }

        const flags = new Set<string>();
        if (config.flag) {
          const flagsToAdd = Array.isArray(config.flag)
            ? config.flag
            : typeof config.flag === 'string'
              ? config.flag
                  .split(',')
                  .map((f) => f.trim())
                  .filter((f) => f)
              : [config.flag];
          flagsToAdd.forEach((flag) => flags.add(flag));
        } else {
          // Default to 'debug' flag if none provided
          flags.add('debug');
        }
        this.config = {
          type: config.type ?? defaultConfig.type,

          prefix: config.prefix
            ? typeof config.prefix === 'string'
              ? { symbol: '', text: config.prefix, separator: ' | ' }
              : {
                  symbol: config.prefix.symbol ?? '',
                  text: config.prefix.text ?? '',
                  separator: config.prefix.separator ?? ' | ',
                }
            : { ...defaultConfig.prefix },
          addresses,
          flags,
        } satisfies LoggerConfig;
      }
    }

    this.updateLogFn();

    // Create a callable function that preserves stack trace
    // Use a wrapper function that always calls the current _call so dynamic updates work
    const callable = ((...args: unknown[]) => {
      return (callable as unknown as Logger)._call(...args);
    }) as Logger & ((...args: unknown[]) => void);

    // Copy all Logger properties and methods to the callable function
    Object.setPrototypeOf(callable, Logger.prototype);
    Object.assign(callable, this);

    return callable;
  }

  private checkIsVerboseAddress(): boolean {
    if (this.config.addresses.size === 0 || debugAddressesSet.size === 0) {
      return false;
    }
    return [...this.config.addresses].some((addr) =>
      debugAddressesSet.has(addr.toLowerCase()),
    );
  }

  private checkIsFlagsEnabled(): boolean {
    if (debugFlagsSet.has('all')) {
      return true;
    }

    if (this.config.flags.size === 0 || debugFlagsSet.size === 0) {
      return false;
    }

    return [...this.config.flags].some((flag) =>
      debugFlagsSet.has(flag.toLowerCase()),
    );
  }

  private checkShouldLog(): boolean {
    if (this.config.type === 'error' || this.config.type === 'warn') {
      return true;
    }

    if (this.checkIsFlagsEnabled()) {
      return true;
    }

    const isVerboseAddress = this.checkIsVerboseAddress();
    if (isProduction && isVerboseAddress) {
      return true;
    }

    return false;
  }

  private updateLogFn(): void {
    if (this.checkShouldLog()) {
      const prefix = formatLogPrefix(
        this.config.prefix.text,
        this.config.type,
        this.config.prefix.symbol,
      );
      // Bind the appropriate console method with the prefix
      // When logFn is called, it will use console[type] with the prefix prepended
      this._call = prefix
        ? console[this.config.type].bind(console, prefix)
        : console[this.config.type].bind(console);
    } else {
      // Logging disabled - use no-op function
      this._call = () => {};
    }
  }

  setPrefixSymbol(symbol: string): void {
    this.config.prefix.symbol = symbol;
    this.updateLogFn();
  }

  setPrefix(text: string): void {
    this.config.prefix.text = text;
    this.updateLogFn();
  }

  setAddresses(addresses: string[]): void {
    this.config.addresses = new Set(addresses);
    this.updateLogFn();
  }

  setFlags(flags: string[]): void {
    this.config.flags = new Set(flags);
    this.updateLogFn();
  }

  setType(type: LogType): void {
    this.config.type = type;
    this.updateLogFn();
  }

  addPrefix(text: string): void {
    this.config.prefix.text = appendString(
      this.config.prefix.text,
      text,
      this.config.prefix.separator,
    );
    this.updateLogFn();
  }

  addAddress(address: string): void {
    this.config.addresses.add(address);
    this.updateLogFn();
  }

  addAddresses(addresses: string[]): void {
    addresses.forEach((address) => this.config.addresses.add(address));
    this.updateLogFn();
  }

  addFlag(flag: string): void {
    this.config.flags.add(flag);
    this.updateLogFn();
  }

  addFlags(flags: string[]): void {
    flags.forEach((flag) => this.config.flags.add(flag));
    this.updateLogFn();
  }

  getPrefix(): string {
    return this.config.prefix.text;
  }

  getPrefixSymbol(): string {
    return this.config.prefix.symbol;
  }

  getPrefixSeparator(): string {
    return this.config.prefix.separator;
  }

  getAddresses(): string[] {
    return [...this.config.addresses];
  }

  getFlags(): string[] {
    return [...this.config.flags];
  }

  getType(): LogType {
    return this.config.type;
  }

  /** Creates a child logger inheriting this logger's configuration. */
  factory(
    config?: LoggerConstructorConfig,
  ): Logger & ((...args: unknown[]) => void) {
    return new Logger(config, this) as Logger & ((...args: unknown[]) => void);
  }
}

/**
 * Error Registry Module - A utility for tracking and managing errors in your application.
 *
 * This module provides a robust error tracking system that allows you to register, observe,
 * and manage errors throughout your application. It includes a decorator for automatically
 * catching errors in methods.
 *
 * @example
 * ```ts
 * import { ErrorRegistry } from "jsr:@bkamkl9/xerrorhandler";
 *
 * const registry = new ErrorRegistry();
 *
 * // Use the decorator to automatically catch errors
 * class MyService {
 *   @registry.catchError()
 *   public riskyOperation() {
 *     throw new Error("Something went wrong");
 *   }
 * }
 *
 * // Register an observer to be notified of errors
 * registry.registerObserver((entry) => {
 *   console.log(`Error in ${entry.constructor_name}.${entry.method_name}: ${entry.error.message}`);
 * });
 *
 * const service = new MyService();
 * service.riskyOperation(); // Error will be caught and registered
 *
 * // Log all errors in the registry
 * registry.logRegistry();
 * ```
 *
 * @module
 */

/**
 * Represents an entry in the error registry.
 * Contains information about the error, its context, and when it occurred.
 */
export interface ErrorRegistryEntry {
  /** The actual Error object that was caught */
  error: Error;

  /** The context (typically 'this') in which the error occurred */
  context: any;

  /** The name of the constructor/class where the error occurred */
  constructor_name: string;

  /** The name of the method where the error occurred */
  method_name: string;

  /** The timestamp when the error was registered */
  timestamp: Date;
}

/**
 * A registry for tracking and managing errors in an application.
 *
 * The ErrorRegistry provides methods for:
 * - Registering errors
 * - Observing when new errors occur
 * - Retrieving and clearing the error history
 * - Automatically catching errors with a method decorator
 */
export class ErrorRegistry {
  private errorRegistryEntries: ErrorRegistryEntry[] = [];
  private errorRegistryObservers: ((entry: ErrorRegistryEntry) => void)[] = [];

  constructor() {}

  public getRegistry(): ErrorRegistryEntry[] {
    return this.errorRegistryEntries;
  }

  public clearRegistry(): void {
    this.errorRegistryEntries = [];
  }

  public registerObserver(observer: (entry: ErrorRegistryEntry) => void): void {
    this.errorRegistryObservers.push(observer);
  }

  private notifyObservers(entry: ErrorRegistryEntry): void {
    for (const observer of this.errorRegistryObservers) {
      observer(entry);
    }
  }

  public unregisterObserver(
    observer: (entry: ErrorRegistryEntry) => void,
  ): void {
    this.errorRegistryObservers = this.errorRegistryObservers.filter(
      (o) => o !== observer,
    );
  }

  private pushErrorToRegistry(
    error: Error,
    context: any,
    constructor_name: string,
    method_name: string,
  ): void {
    const entry: ErrorRegistryEntry = {
      error,
      context,
      constructor_name,
      method_name,
      timestamp: new Date(),
    };
    this.errorRegistryEntries.push(entry);
    this.notifyObservers(entry);
  }

  public logRegistry(): void {
    for (const entry of this.errorRegistryEntries) {
      const { error, ...rest } = entry;
      console.error({
        error: {
          name: error.name,
          message: error.message,
        },
        ...rest,
      });
    }
  }

  public catchError(): MethodDecorator {
    // deno-lint-ignore no-this-alias
    const errorRegistry = this;

    return function (
      target: any,
      _: string | symbol,
      descriptor: PropertyDescriptor,
    ) {
      const method = descriptor.value;

      descriptor.value = function (...args: any) {
        try {
          return method.apply(this, args);
        } catch (error) {
          errorRegistry.pushErrorToRegistry(
            error as Error,
            this,
            target.constructor.name,
            method.name,
          );
        }
      };

      return descriptor;
    };
  }
}

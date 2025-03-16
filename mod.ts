export interface ErrorRegistryEntry {
  error: Error;
  context: any;
  constructor_name: string;
  method_name: string;
  timestamp: Date;
}

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

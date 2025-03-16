# xerrorhandler

A lightweight, flexible error handling utility for TypeScript/JavaScript applications that helps you track, manage, and respond to errors throughout your application.

## Features

- 🔍 **Error Tracking**: Automatically capture and store errors with contextual information
- 🔔 **Observer Pattern**: Subscribe to error events to implement custom error handling logic
- 🛡️ **Method Decorator**: Easily wrap methods with error catching functionality
- 📊 **Error Registry**: Maintain a centralized record of all captured errors
- 📝 **Detailed Context**: Each error includes class name, method name, and timestamp

## Installation

```bash
# Using jsr
import { ErrorRegistry } from "jsr:@bkamkl9/xerrorhandler";
```

## Basic Usage

```typescript
import { ErrorRegistry } from "jsr:@bkamkl9/xerrorhandler";

// Create a new error registry
const registry = new ErrorRegistry();

// Use the decorator to automatically catch errors
class UserService {
  @registry.catchError()
  fetchUser(id: string) {
    // If this throws an error, it will be caught and registered
    if (!id) {
      throw new Error("User ID is required");
    }
    return { id, name: "John Doe" };
  }
}

// Try the risky operation
const service = new UserService();
service.fetchUser(""); // This will throw an error that gets caught

// View all errors in the console
registry.logRegistry();
```

## Advanced Usage

### Error Observers

You can register observers to be notified when errors occur:

```typescript
import { ErrorRegistry, ErrorRegistryEntry } from "jsr:@bkamkl9/xerrorhandler";

const registry = new ErrorRegistry();

// Create an observer that sends errors to a monitoring service
const monitoringObserver = (entry: ErrorRegistryEntry) => {
  console.log(`[ALERT] Error in ${entry.constructor_name}.${entry.method_name}`);
  console.log(`Message: ${entry.error.message}`);
  console.log(`Time: ${entry.timestamp}`);
  
  // You could send this to a monitoring service
  // monitoringService.reportError(entry);
};

// Register the observer
registry.registerObserver(monitoringObserver);

// Later, if you want to stop observing
// registry.unregisterObserver(monitoringObserver);
```

### Managing the Error Registry

```typescript
import { ErrorRegistry } from "jsr:@bkamkl9/xerrorhandler";

const registry = new ErrorRegistry();

// ... application code that generates errors ...

// Get all errors
const allErrors = registry.getRegistry();
console.log(`Total errors: ${allErrors.length}`);

// Process errors for analytics
const errorsByType = allErrors.reduce((acc, entry) => {
  const type = entry.error.name;
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {});

console.log("Error distribution:", errorsByType);

// Clear the registry (e.g., after processing or on application restart)
registry.clearRegistry();
```

### Complete Example

```typescript
import { ErrorRegistry } from "jsr:@bkamkl9/xerrorhandler";

// Create a global error registry
const errorRegistry = new ErrorRegistry();

// Define a service with error-prone methods
class DataService {
  private data: Record<string, any> = {};
  
  @errorRegistry.catchError()
  getData(key: string): any {
    if (!this.data[key]) {
      throw new Error(`Data not found for key: ${key}`);
    }
    return this.data[key];
  }
  
  @errorRegistry.catchError()
  setData(key: string, value: any): void {
    if (!key) {
      throw new Error("Cannot set data with empty key");
    }
    this.data[key] = value;
  }
}

// Set up error observers
errorRegistry.registerObserver((entry) => {
  // Log to console with colors
  console.error(
    `%c[ERROR] ${entry.constructor_name}.${entry.method_name}: ${entry.error.message}`,
    "color: red; font-weight: bold"
  );
  
  // You could also send to an analytics service
  // analyticsService.trackError(entry);
});

// Use the service
const service = new DataService();
service.setData("user", { name: "Alice" });
service.getData("user"); // Works fine
service.getData("settings"); // Will throw and register an error

// Display all errors
console.log("\nError Registry Contents:");
errorRegistry.logRegistry();
```

## API Reference

For detailed API documentation, please visit the [JSR package page](https://jsr.io/@bkamkl9/xerrorhandler).

## License

MIT

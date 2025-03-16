import { ErrorRegistry, ErrorRegistryEntry } from "../mod.ts";
import { assert } from "@std/assert";

const moduleScopeRegistry = new ErrorRegistry();

class MockClass {
  @moduleScopeRegistry.catchError()
  public riskyOperation() {
    throw new Error("Something went wrong");
  }
}

Deno.test("Test registry definition", () => {
  assert(moduleScopeRegistry instanceof ErrorRegistry);
});

Deno.test("Test decorating method", () => {
  class MockClass {
    @moduleScopeRegistry.catchError()
    public riskyOperation() {
      throw new Error("Something went wrong");
    }
  }
  const mock = new MockClass();
  mock.riskyOperation();
});

Deno.test("Test catching error", () => {
  const mock = new MockClass();
  mock.riskyOperation();
  const registry = moduleScopeRegistry.getRegistry();
  const registryEntry = registry[0];
  assert(registryEntry.error instanceof Error);
  assert(registryEntry.constructor_name === "MockClass");
  assert(registryEntry.method_name === "riskyOperation");
  assert(registryEntry.timestamp instanceof Date);
});

Deno.test("Test observing registry", () => {
  moduleScopeRegistry.registerObserver((entry) => {
    assert(entry.error instanceof Error);
    assert(entry.context instanceof MockClass);
    assert(entry.constructor_name === "MockClass");
    assert(entry.method_name === "riskyOperation");
    assert(entry.timestamp instanceof Date);
  });
  const mock = new MockClass();
  mock.riskyOperation();
});

Deno.test("Test unregistering observer", () => {
  let observed = false;

  function observer(_: ErrorRegistryEntry) {
    observed = true;
  }

  moduleScopeRegistry.registerObserver(observer);
  moduleScopeRegistry.unregisterObserver(observer);

  const mock = new MockClass();
  mock.riskyOperation();

  assert(!observed);
});

Deno.test("Test clearing registry", () => {
  const mock = new MockClass();
  mock.riskyOperation();
  moduleScopeRegistry.clearRegistry();
  const registry = moduleScopeRegistry.getRegistry();
  assert(registry.length === 0);
});

Deno.test("Test logging registry", () => {
  assert(moduleScopeRegistry.logRegistry !== undefined);
});

Deno.test("Test catching error with context", () => {
  moduleScopeRegistry.clearRegistry();
  const mock = new MockClass();
  mock.riskyOperation();
  const registry = moduleScopeRegistry.getRegistry();
  assert(registry.length === 1);
});

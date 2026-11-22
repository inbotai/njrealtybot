import { AsyncLocalStorage } from "node:async_hooks";

// Next reads globalThis.AsyncLocalStorage once, when its server modules load.
// The regression suite imports middleware at startup, so this has to run first.
(globalThis as { AsyncLocalStorage?: typeof AsyncLocalStorage }).AsyncLocalStorage = AsyncLocalStorage;

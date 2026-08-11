import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    // The emblem's paint test drives a real browser and is slower than a unit test.
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // environment: 'happy-dom',
    setupFiles: ["vitest.setup.js"],
    environment: "jsdom",
    deps: {
      // >= 0.34
      optimizer: {
        web: {
          include: ["vitest-canvas-mock"],
        },
      },
    },
  },
});

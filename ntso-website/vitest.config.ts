import { defineConfig } from "vitest/config";
import path from "path";

const alias = {
  "@": path.resolve(__dirname, "src"),
  // `server-only` throws outside the React server runtime; tests run server code directly.
  "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
};

export default defineConfig({
  resolve: { alias },
  test: {
    // Integration tests share one database; run files sequentially.
    fileParallelism: false,
    projects: [
      { resolve: { alias }, test: { name: "unit", include: ["tests/unit/**/*.test.ts"], environment: "node" } },
      {
        resolve: { alias },
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          environment: "node",
          globalSetup: ["tests/integration/global-setup.ts"],
          env: {
            DATABASE_URL: process.env.TEST_DATABASE_URL || "",
            RATE_LIMIT_STORE: "database",
            STORAGE_DRIVER: "local",
            UPLOAD_DIR: path.resolve(__dirname, ".test-uploads"),
            SMTP_HOST: "",
            NODE_ENV: "test",
          },
        },
      },
    ],
  },
});

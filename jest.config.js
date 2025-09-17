export default {
  preset: "ts-jest",
  testTimeout: 10000,
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(nanoid)/)", // ⬅️ Force nanoid to be transformed
  ],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/index.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/utils/test-setup.ts"],
};

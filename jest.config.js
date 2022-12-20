const skipE2E = Boolean(process.env.SKIP_E2E)
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  roots: ['<rootDir>/src', ...(skipE2E ? [] : ['<rootDir>/e2e'])],
  setupFilesAfterEnv: ['./jest-config.ts'],
};

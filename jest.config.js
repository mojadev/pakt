const skipE2E = Boolean(process.env.SKIP_E2E);
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  roots: ['<rootDir>/src', '<rootDir>/e2e/'],
  testPathIgnorePatterns: ['node_modules', ...(skipE2E ? ['e2e.spec'] : [])],
  setupFilesAfterEnv: ['./jest-config.ts'],
  moduleNameMapper: {
    '^@logger$': '<rootDir>/src/logger',
  },

  coveragePathIgnorePatterns: ['node_modules/', '/src/generator/verify/'],
};

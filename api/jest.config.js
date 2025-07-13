module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['./src', './tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['./tests/setup.ts'],
  testTimeout: 15000,
  verbose: true
};

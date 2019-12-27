module.exports = {
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['./src/tests/setupTests.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};

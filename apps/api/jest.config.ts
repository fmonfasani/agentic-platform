import type { Config } from 'jest'

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: __dirname,
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  setupFiles: ['<rootDir>/test/jest.setup.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
}

export default config

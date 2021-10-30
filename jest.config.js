/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@web3-react/(.*)$': '<rootDir>/packages/$1/src',
  },
  verbose: true,
  transform: {
    "^.+\\.tsx?$": 'ts-jest'
  },
  globals: {
    'ts-jest': {
      diagnostics: {
        // Do not fail on TS compilation errors
        // https://kulshekhar.github.io/ts-jest/user/config/diagnostics#do-not-fail-on-first-error
        warnOnly: true
      }
    }
  },
}

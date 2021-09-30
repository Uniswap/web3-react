module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@web3-react/(.*)$': '<rootDir>/packages/$1/src',
  },
}

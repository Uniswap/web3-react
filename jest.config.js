module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@web3-react/(.*)$': '<rootDir>/packages/$1/src',
  },
}

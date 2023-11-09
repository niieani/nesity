import type jest from '@niieani/scaffold/src/configs/jest'

export default {
  testMatch: ['<rootDir>/packages/*/src/**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^(\\.\\.?\\/.+)\\.jsx?$': '$1',
  },
} as typeof jest

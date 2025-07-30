import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'pages/api/**/*.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testTimeout: 30000,
  // 设置测试环境变量
  setupFiles: ['<rootDir>/__tests__/setup.ts'],
}

export default config
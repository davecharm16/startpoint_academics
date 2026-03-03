const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@startpoint/supabase/client$': '<rootDir>/../../packages/supabase/src/client',
    '^@startpoint/supabase/server$': '<rootDir>/../../packages/supabase/src/server',
    '^@startpoint/supabase/admin$': '<rootDir>/../../packages/supabase/src/admin',
    '^@startpoint/ui$': '<rootDir>/../../packages/ui/src/index',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};

module.exports = createJestConfig(customJestConfig);

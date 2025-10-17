module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: ['./tsconfig.base.json', './web/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-var-requires': 'warn',
    
    // Import
    'import/no-cycle': ['warn', { maxDepth: 10 }],
    'import/no-duplicates': 'error',
    
    // General
    'no-console': 'off',
    'no-debugger': 'warn',
    'prefer-const': 'warn',
    'no-unused-vars': 'off', // Use TypeScript's version
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'archive/',
    'backups/',
    'audit/',
    '*.config.js',
    '*.config.cjs',
    'web/dist/',
  ],
  overrides: [
    {
      // Frontend TypeScript/React
      files: ['web/src/**/*.{ts,tsx}'],
      env: {
        browser: true,
        es2022: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      // Backend JavaScript (gradually migrating to TS)
      files: ['src/**/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      // Test files
      files: ['**/*.test.{ts,tsx,js}', '**/*.spec.{ts,tsx,js}'],
      env: {
        jest: true,
      },
    },
  ],
};


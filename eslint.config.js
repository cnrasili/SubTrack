module.exports = [
  {
    ignores: ['node_modules/**'],
  },
  {
    files: ['backend/src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
    },
    rules: {
      eqeqeq: 'error',
      'no-var': 'error',
      'no-unused-vars': ['warn', { vars: 'all', args: 'none' }],
    },
  },
  {
    files: ['backend/tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      eqeqeq: 'error',
      'no-unused-vars': ['warn', { vars: 'all', args: 'none' }],
    },
  },
  {
    files: ['frontend/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        document: 'readonly',
        window: 'readonly',
        fetch: 'readonly',
        URLSearchParams: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        console: 'readonly',
        Promise: 'readonly',
        parseInt: 'readonly',
        parseFloat: 'readonly',
        isNaN: 'readonly',
        Number: 'readonly',
        Math: 'readonly',
        Date: 'readonly',
        Object: 'readonly',
        String: 'readonly',
        api: 'readonly',
        views: 'writable',
      },
    },
    rules: {
      eqeqeq: 'error',
      'no-var': 'error',
      'no-unused-vars': ['warn', { vars: 'all', args: 'none' }],
    },
  },
];

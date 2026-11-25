const expoConfig = require('eslint-config-expo/flat');
const {defineConfig} = require('eslint/config');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'node_modules/**',
      'ios/**',
      'android/**',
      'dist/**',
      'web-build/**',
      '.expo/**',
      'coverage/**',
      'public/**',
    ],
  },
  {
    files: ['jest.setup.js'],
    languageOptions: {
      globals: globals.jest,
    },
  },
  {
    rules: {
      'no-trailing-spaces': 'warn',
      'eol-last': ['warn', 'always'],
    },
  },
]);

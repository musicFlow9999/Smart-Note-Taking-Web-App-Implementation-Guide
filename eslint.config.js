export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'no-unused-vars': ['warn'],
      'no-console': ['warn'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
]

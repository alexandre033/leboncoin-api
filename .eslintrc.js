module.exports = {
  extends: ['eslint:recommended'],
  plugins: ['prettier'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    jest: true
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'none',
        parser: 'flow',
        semi: true,
        tabWidth: 2,
        bracketSpacing: true,
        endOfLine: 'auto'
      }
    ],
    'no-use-before-define': 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-filename-extension': 'off',
    'react/prop-types': 'off',
    'comma-dangle': 'off',
    'no-extra-parens': ['error', 'functions'],
    'react/destructuring-assignment': ['warn', 'always'],
    'object-curly-spacing': ['error', 'always'],
    'no-param-reassign': 'off',
    'no-console': 'warn',
    'no-underscore-dangle': [2, { allowAfterThis: true }],
    'consistent-return': 'off',
    'no-bitwise': 'off',
    'lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true }
    ]
  },
  globals: {
    fetch: false
  }
};

const prettier = require('eslint-plugin-prettier');
const globals = require('globals');
const js = require('@eslint/js');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

module.exports = [
  {
    ignores: ['**/dist/', '**/node_modules/', '**/test/', '**/tools/']
  },
  ...compat.extends('eslint:recommended'),
  {
    plugins: {
      prettier
    },

    languageOptions: {
      globals: {
        ...globals.node
      },

      ecmaVersion: 2019,
      sourceType: 'commonjs'
    },

    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'none'
        }
      ],

      'no-extra-semi': 0,
      'no-mixed-spaces-and-tabs': 0,
      'no-prototype-builtins': 0
    }
  },
  {
    files: ['lib/dom/**'],
    languageOptions: {
      globals: {
        ...globals.browser,
        util: true
      }
    }
  }
];

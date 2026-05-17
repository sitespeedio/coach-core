const prettier = require('eslint-plugin-prettier');
const globals = require('globals');
const js = require('@eslint/js');

module.exports = [
  {
    ignores: ['**/dist/', '**/node_modules/', '**/test/', '**/tools/']
  },
  js.configs.recommended,
  {
    plugins: {
      prettier
    },

    languageOptions: {
      globals: {
        ...globals.node
      },

      ecmaVersion: 'latest',
      sourceType: 'module'
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
      sourceType: 'script',
      globals: {
        ...globals.browser,
        util: true
      }
    }
  },
  {
    // util.js itself declares util locally, so don't treat it as a global there.
    files: ['lib/dom/util.js'],
    languageOptions: {
      globals: {
        util: 'off'
      }
    }
  }
];

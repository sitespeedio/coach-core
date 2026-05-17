import prettier from 'eslint-plugin-prettier';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import js from '@eslint/js';

export default [
  {
    ignores: ['**/dist/', '**/node_modules/', '**/test/', '**/tools/']
  },
  js.configs.recommended,
  unicorn.configs.recommended,
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
      'no-prototype-builtins': 0,
      'unicorn/filename-case': 0,
      'unicorn/prevent-abbreviations': 0,
      'unicorn/no-array-reduce': 0,
      'unicorn/no-array-sort': 0,
      'unicorn/no-array-reverse': 0,
      'unicorn/prefer-spread': 0,
      // Destructured imports from node:* namespaces are clearer than
      // forcing `import path from 'node:path'` everywhere.
      'unicorn/import-style': 0,
      // The vendored wappalyzer engine intentionally uses null to match
      // the upstream data format. null vs undefined is semantically
      // load-bearing in a few places, not a style preference.
      'unicorn/no-null': 0
    }
  },
  {
    // The DOM advice rules are not modules — they are IIFE script fragments
    // that get concatenated into dist/coach.min.js and run inside the
    // browser via WebDriver's executeScript. `"use strict"` is intentional
    // there; eslint's `prefer-module` rule does not apply.
    files: ['lib/dom/**'],
    rules: {
      'unicorn/prefer-module': 0
    },
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

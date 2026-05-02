import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { flatConfigs } from 'eslint-plugin-import-x';
import globals from 'globals';
import { configs } from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...configs.recommended,
  flatConfigs.recommended,
  flatConfigs.typescript,
  prettier,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.commonjs,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        node: true,
      },
    },
    rules: {
      // --- your rules, carried over ---
      'no-console': 'off',
      'no-plusplus': 'off',
      'no-await-in-loop': 'off',
      'no-return-assign': 'off',
      'no-param-reassign': 'off',
      'no-nested-ternary': 'off',
      'func-names': 'off',
      'prefer-promise-reject-errors': 'off',
      'prefer-destructuring': 'warn',
      camelcase: 'warn',
      // disable base rules in favour of TS-aware versions below
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',

      // --- TS equivalents ---
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: 'res|next|^err',
          ignoreRestSiblings: false,
        },
      ],
      '@typescript-eslint/no-use-before-define': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',

      // --- import rules ---
      'import-x/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      'import-x/no-duplicates': 'error',
      'import-x/prefer-default-export': 'off',
    },
  },
];

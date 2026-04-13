// eslint.config.mjs
// @ts-check

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-simple-import-sort';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  // ---- Ignore build artifacts
  {
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '*.d.ts',
    ],
  },

  // ---- Base JS recommended
  eslint.configs.recommended,

  // ---- TS (type-aware)
  ...tseslint.configs.recommendedTypeChecked,

  // ---- Prettier (disable conflicting rules + run prettier as an ESLint rule)
  prettierRecommended,

  // ---- Global language options (for src code)
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },

  // ---- Plugins (imports hygiene)
  {
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    settings: {
      'import/resolver': {
        typescript: { project: ['./tsconfig.json'] },
        node: true,
      },
    },
    rules: {
      // ---- Clean code / correctness
      eqeqeq: ['error', 'smart'],
      curly: ['error', 'all'],
      'prefer-const': ['error', { destructuring: 'all' }],
      'no-debugger': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // ---- Unused imports/vars (auto-fix remove unused imports)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // ---- Imports hygiene + sorting
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'], // side effects
            ['^node:'], // node builtins
            ['^@?\\w'], // packages
            ['^@/'], // alias (nếu bạn dùng)
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'], // parent
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'], // same-folder
            ['^.+\\.s?css$'], // styles (ít dùng ở backend nhưng để cũng ok)
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // ---- TypeScript preferences
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // ---- Your current preferences
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },

  // ---- Jest files only (Nest default)
  {
    files: [
      '**/*.{spec,test}.{ts,tsx,js,jsx}',
      '**/__tests__/**/*.{ts,tsx,js,jsx}',
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },

  // ---- Tooling/config files
  {
    files: [
      '**/*.{config,conf}.{js,cjs,mjs,ts}',
      '**/scripts/**/*.{js,ts,mjs,cjs}',
    ],
    rules: {
      'no-console': 'off',
    },
  },
);

import path from 'node:path'

import { defineConfig } from 'eslint/config'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import { configs, plugins } from 'eslint-config-airbnb-extended'
import { configs as eslintConfigs } from '@jenssimon/eslint-config-base'
import vitest from '@vitest/eslint-plugin'
import globals from 'globals'

const gitignorePath = path.resolve('.', '.gitignore')


const jsConfig = [
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  plugins.stylistic,
  plugins.importX,
  // Airbnb Base Recommended Config
  ...configs.base.recommended,
]

const typescriptConfig = [
  plugins.typescriptEslint,
  ...configs.base.typescript,
]


export default defineConfig(
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      '.yarn/',
    ],
  },

  jsConfig,
  typescriptConfig,

  eslintConfigs.base,

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'import-x/no-extraneous-dependencies': 'off',
      'no-console': 'off',
      'no-restricted-syntax': 'off',
    },
  },

  {
    files: [
      'elevator.js',
      'elevator.template.js',
    ],
    rules: {
      'class-methods-use-this': 'off',
    },
  },

  {
    files: [
      '**/*.test.*',
      '**/*.spec.*',
      '**/__tests__/**',
      '**/__mocks__/**',
    ],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },

  {
    files: ['tests/elevator.js'],
    rules: {
      'class-methods-use-this': 'off',
      'max-classes-per-file': 'off',
    },
  },

  {
    files: ['types/elevatorsaga.d.ts'],
    rules: {
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    files: ['types/global.d.ts'],
    rules: {
      'unicorn/require-module-specifiers': 'off',
      'vars-on-top': 'off',
    },
  },
)

import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

import pluginImport from 'eslint-plugin-import';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginSecurity from 'eslint-plugin-security';
import pluginJest from 'eslint-plugin-jest';
import pluginPromise from 'eslint-plugin-promise';
import pluginN from 'eslint-plugin-n';

import globals from 'globals';

export default [
    {
        ignores: ['CHANGELOG.md'],
    },

    js.configs.recommended,

    {
        files: ['**/*.js', '**/*.mjs'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.es2022,
            },
        },
        plugins: {
            import: pluginImport,
            unicorn: pluginUnicorn,
            security: pluginSecurity,
            jest: pluginJest,
            promise: pluginPromise,
            n: pluginN,
        },
        rules: {
            // Core rules
            'no-console': 'error',
            'no-prototype-builtins': 'error',
            'no-duplicate-imports': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

            // Unicorn rules
            'unicorn/prefer-module': 'error',
            'unicorn/no-array-for-each': 'error',

            // Security rules
            'security/detect-buffer-noassert': 'warn',
            'security/detect-child-process': 'error',
            'security/detect-disable-mustache-escape': 'error',
            'security/detect-eval-with-expression': 'error',
            'security/detect-new-buffer': 'warn',
            'security/detect-non-literal-fs-filename': 'warn',
            'security/detect-non-literal-require': 'warn',
            'security/detect-possible-timing-attacks': 'warn',
            'security/detect-pseudoRandomBytes': 'warn',
            'security/detect-unsafe-regex': 'warn',

            // Import rules
            'import/first': 'error',
            'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

            // Promise rules
            'promise/catch-or-return': 'warn',

            // Code length limits
            'max-lines': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
            'max-lines-per-function': [
                'error',
                { max: 40, skipBlankLines: true, skipComments: true },
            ],
        },
    },

    // TypeScript declaration files
    {
        files: ['**/*.d.ts'],
        languageOptions: {
            parser: tsparser,
            ecmaVersion: 2022,
            sourceType: 'module',
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            'no-duplicate-imports': 'error',
            'prefer-const': 'error',
            '@typescript-eslint/prefer-as-const': 'error',

            'no-unused-vars': 'off',
        },
    },

    {
        files: ['**/*.test.js', '**/*.test.mjs'],
        plugins: {
            jest: pluginJest,
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.jest,
                ...globals.node,
                ...globals.es2022,
            },
        },
        rules: {
            'import/first': 'off',
            'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
            'unicorn/no-array-for-each': 'off',

            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

            'jest/no-disabled-tests': 'error',
            'jest/no-focused-tests': 'error',
            'jest/no-identical-title': 'error',

            'max-lines': 'off',
            'max-lines-per-function': 'off',
            'no-duplicate-imports': 'error',
        },
    },

    {
        files: ['**/payload-schema.mjs', 'eslint.config.js'],
        rules: {
            'max-lines': 'off',
        },
    },
    prettier,
];

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
            'no-console': 'error',
            'no-prototype-builtins': 'error',

            'unicorn/prefer-module': 'error',
            'unicorn/no-array-for-each': 'error',

            'security/detect-object-injection': 'off',
            'security/detect-buffer-noassert': 'warn',
            'security/detect-child-process': 'error',
            'security/detect-disable-mustache-escape': 'error',
            'security/detect-eval-with-expression': 'error',
            'security/detect-new-buffer': 'warn',
            'security/detect-no-csrf-before-method-override': 'off',
            'security/detect-non-literal-fs-filename': 'warn',
            'security/detect-non-literal-require': 'warn',
            'security/detect-possible-timing-attacks': 'warn',
            'security/detect-pseudoRandomBytes': 'warn',
            'security/detect-unsafe-regex': 'warn',

            'import/no-dynamic-require': 'off',
            'import/first': 'error',
            'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
            'import/no-unresolved': 'off',

            'promise/always-return': 'off',
            'promise/catch-or-return': 'warn',
            'n/no-missing-import': 'off',

            'max-lines': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
            'max-lines-per-function': [
                'error',
                { max: 40, skipBlankLines: true, skipComments: true },
            ],
            'no-duplicate-imports': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        },
    },

    // TypeScript configuration
    {
        files: ['**/*.ts', '**/*.mts'],
        languageOptions: {
            parser: tsparser,
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.es2022,
            },
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            import: pluginImport,
            unicorn: pluginUnicorn,
            security: pluginSecurity,
            jest: pluginJest,
            promise: pluginPromise,
            n: pluginN,
        },
        rules: {
            // TypeScript-specific rules
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/prefer-const': 'error',
            '@typescript-eslint/no-inferrable-types': 'error',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/prefer-nullish-coalescing': 'error',
            '@typescript-eslint/prefer-optional-chain': 'error',

            // Disable conflicting base rules
            'no-unused-vars': 'off',

            // Keep existing rules
            'no-console': 'error',
            'no-prototype-builtins': 'error',
            'unicorn/prefer-module': 'error',
            'unicorn/no-array-for-each': 'error',
            'security/detect-object-injection': 'off',
            'security/detect-buffer-noassert': 'warn',
            'security/detect-child-process': 'error',
            'security/detect-disable-mustache-escape': 'error',
            'security/detect-eval-with-expression': 'error',
            'security/detect-new-buffer': 'warn',
            'security/detect-no-csrf-before-method-override': 'off',
            'security/detect-non-literal-fs-filename': 'warn',
            'security/detect-non-literal-require': 'warn',
            'security/detect-possible-timing-attacks': 'warn',
            'security/detect-pseudoRandomBytes': 'warn',
            'security/detect-unsafe-regex': 'warn',
            'import/no-dynamic-require': 'off',
            'import/first': 'error',
            'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
            'import/no-unresolved': 'off',
            'promise/always-return': 'off',
            'promise/catch-or-return': 'warn',
            'n/no-missing-import': 'off',
            'max-lines': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
            'max-lines-per-function': [
                'error',
                { max: 40, skipBlankLines: true, skipComments: true },
            ],
            'no-duplicate-imports': 'error',
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

    // TypeScript test configuration
    {
        files: ['**/*.test.ts', '**/*.test.mts'],
        languageOptions: {
            parser: tsparser,
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.jest,
                ...globals.node,
                ...globals.es2022,
            },
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            jest: pluginJest,
            import: pluginImport,
            unicorn: pluginUnicorn,
            security: pluginSecurity,
            promise: pluginPromise,
            n: pluginN,
        },
        rules: {
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',

            'no-unused-vars': 'off',
            'import/first': 'off',
            'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
            'unicorn/no-array-for-each': 'off',
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

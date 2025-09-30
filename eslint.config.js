import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';
import pluginJest from 'eslint-plugin-jest';
import pluginN from 'eslint-plugin-n';
import pluginPromise from 'eslint-plugin-promise';
import pluginSecurity from 'eslint-plugin-security';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import pluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

export default [
    {
        ignores: ['CHANGELOG.md'],
    },

    js.configs.recommended,

    {
        files: ['**/*.js', '**/*.mjs'],
        ignores: ['eslint.config.js', '**/*.test.js', '**/*.test.mjs'],
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
            promise: pluginPromise,
            n: pluginN,
            sort: simpleImportSort,
            sonar: sonarjs,
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
            'unicorn/prefer-node-protocol': 'error',
            'unicorn/prefer-top-level-await': 'error',

            // Security rules
            'security/detect-buffer-noassert': 'warn',
            'security/detect-child-process': 'error',
            'security/detect-disable-mustache-escape': 'error',
            'security/detect-eval-with-expression': 'error',
            'security/detect-new-buffer': 'warn',
            'security/detect-non-literal-fs-filename': 'warn',
            'security/detect-unsafe-regex': 'warn',

            // Import rules
            'import/first': 'error',
            'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

            // Promise rules
            'promise/catch-or-return': 'warn',

            // sort
            'sort/imports': 'error',
            'sort/exports': 'error',

            // sonar
            'sonar/cognitive-complexity': ['error', 10],
            'sonar/no-hardcoded-secrets': 'error',
            'sonar/no-hardcoded-passwords': 'error',
            'sonar/confidential-information-logging': 'error',
            'sonar/no-identical-functions': 'error',
            'sonar/no-identical-expressions': 'error',
            'sonar/function-return-type': 'warn',

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
            import: pluginImport,
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
            'jest/prefer-to-have-length': 'error',
            'jest/valid-expect': 'error',

            'max-lines': 'off',
            'max-lines-per-function': 'off',
            'import/no-duplicates': 'error',
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

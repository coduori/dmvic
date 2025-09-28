export default {
    testTimeout: 25000,

    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',

    // An array of file extensions your modules use
    moduleFileExtensions: ['js', 'mjs', 'json', 'jsx', 'ts', 'mts', 'tsx', 'node'],

    // The test environment that will be used for testing
    testEnvironment: 'node',

    // The glob patterns Jest uses to detect test files
    testMatch: ['**.test.mjs', '**.test.mts'],

    // Support for ESM
    preset: 'ts-jest/presets/default-esm',
    extensionsToTreatAsEsm: ['.mts', '.ts'],

    // A map from regular expressions to paths to transformers
    transform: {
        '^.+\\.mts?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: {
                    verbatimModuleSyntax: false,
                },
            },
        ],
    },

    // Module name mapping for ESM imports
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },

    // Transform ignore patterns
    transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],
};

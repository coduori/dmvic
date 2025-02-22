/* eslint-env jest */

import { jest } from '@jest/globals';

import { initialize } from '../src/index.mjs';

jest.mock('undici');
jest.mock('fs');
jest.mock('../src/secretsManager.mjs');
jest.mock('../src/certManager.mjs');

describe('initialize', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should throw an error if config is not provided or is invalid', async () => {
        await expect(initialize()).rejects.toThrow('Invalid configuration. Expected an object.');
        await expect(initialize(null)).rejects.toThrow('Invalid configuration. Expected an object.');
        await expect(initialize('invalid')).rejects.toThrow('Invalid configuration. Expected an object.');
    });
});

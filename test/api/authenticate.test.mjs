import Chance from 'chance';
import { jest } from '@jest/globals';

import { apiConfig } from '../../lib/config/api-configs.mjs';

const chance = new Chance();

const mockMakeUnauthenticatedRequest = jest.fn();
jest.unstable_mockModule('../../lib/utils/api-helpers.mjs', () => ({
    makeUnauthenticatedRequest: mockMakeUnauthenticatedRequest,
}));

const { authenticate } = await import('../../lib/api/authenticate.mjs');

describe('authenticate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('should call makeUnauthenticatedRequest', async () => {
        const email = chance.email();
        const password = chance.string({ length: 8 });
        const resolvedResponse = { success: true, data: {} };
        mockMakeUnauthenticatedRequest.mockResolvedValueOnce(resolvedResponse);

        const response = await authenticate(email, password);

        expect(mockMakeUnauthenticatedRequest).toHaveBeenCalledTimes(1);
        expect(mockMakeUnauthenticatedRequest).toHaveBeenCalledWith(apiConfig.general.login, {
            email,
            password,
        });
        expect(response).toBe(resolvedResponse);
    });

    it('should throw if makeUnauthenticatedRequest throws', async () => {
        const email = chance.email();
        const password = chance.string({ length: 8 });
        const errorMessage = new Error('an error occurred!');

        mockMakeUnauthenticatedRequest.mockRejectedValueOnce(errorMessage);

        await expect(authenticate(email, password)).rejects.toThrow(errorMessage);
    });
});

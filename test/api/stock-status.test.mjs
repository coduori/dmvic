import { expect, jest } from '@jest/globals';

import {
    mockApiConfig,
    mockInvoke,
    mockRequestHandler,
    mockGetSecret,
    mockSecretsManager,
} from '../mocks/mocks.mjs';

const mockGetAPIBaseURL = mockApiConfig.getAPIBaseURL;

jest.unstable_mockModule('../../lib/utils/request-handler.mjs', () => mockRequestHandler);
jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => mockApiConfig);
jest.unstable_mockModule('../../lib/utils/secrets-manager.mjs', () => mockSecretsManager);

const { checkStockStatus } = await import('../../lib/api/stock-status.mjs');

describe('checkStockStatus', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should throw if no authToken is provided', async () => {
        await expect(checkStockStatus(null, 27)).rejects.toThrow(
            'Authentication token is required!'
        );
    });

    it('should call invoke with correct arguments and returns response', async () => {
        mockInvoke.mockResolvedValue({ stock: 10 });
        const result = await checkStockStatus('token123', 27);
        expect(mockGetSecret).toHaveBeenCalledWith('environment');
        expect(mockGetAPIBaseURL).toHaveBeenCalledWith('test');
        expect(mockInvoke).toHaveBeenCalledWith(
            'POST',
            'https://test-api.example.com/api/t5/Integration/MemberCompanyStock',
            { MemberCompanyId: 27 },
            'token123'
        );
        expect(result).toEqual({ stock: 10 });
    });

    it('should throw with correct message if invoke throws', async () => {
        mockInvoke.mockRejectedValue(new Error('Network error'));
        await expect(checkStockStatus('token123', 27)).rejects.toThrow(
            'Error fetching data: Network error'
        );
    });
});

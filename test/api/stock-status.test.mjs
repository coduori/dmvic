import { expect, jest } from '@jest/globals';

import {
    mockApiConfig,
    mockInvoke,
    mockRequestHandler,
    mockGetSecret,
    mockSecretsHandler,
} from '../mocks/mocks.mjs';
import { INSURERS } from '../../lib/utils/insurers.mjs';
import { cryptoPickOne } from '../random-pick.mjs';

const mockGetAPIBaseURL = mockApiConfig.getAPIBaseURL;

jest.unstable_mockModule('../../lib/utils/request-handler.mjs', () => mockRequestHandler);
jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => mockApiConfig);
jest.unstable_mockModule('../../lib/utils/secrets-handler.mjs', () => mockSecretsHandler);

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

    it.each(Object.keys(INSURERS))(
        'should call invoke with correct arguments and returns response: %s',
        async (insurer) => {
            mockInvoke.mockResolvedValue({ stock: 10 });
            const result = await checkStockStatus('token123', insurer);
            expect(mockGetSecret).toHaveBeenCalledWith('environment');
            expect(mockGetAPIBaseURL).toHaveBeenCalledWith('test');
            expect(mockInvoke).toHaveBeenCalledWith(
                'POST',
                'https://test-api.example.com/api/t5/Integration/MemberCompanyStock',
                { MemberCompanyId: INSURERS[insurer] },
                'token123'
            );
            expect(result).toEqual({ stock: 10 });
        }
    );

    it('should throw with correct message if invoke throws', async () => {
        const insurer = cryptoPickOne(Object.keys(INSURERS));
        mockInvoke.mockRejectedValue(new Error('Network error'));
        await expect(checkStockStatus('token123', insurer)).rejects.toThrow(
            'Error fetching data: Network error'
        );
    });
});

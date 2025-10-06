import { jest } from '@jest/globals';

import { mockApiConfig } from '../mocks/mocks.mjs';
import { INSURERS } from '../../lib/utils/insurers.mjs';

const mockMakeAuthenticatedRequest = jest.fn();
const mockValidateSupportedValues = jest.fn();

jest.unstable_mockModule('../../lib/utils/api-helpers.mjs', () => ({
    makeAuthenticatedRequest: mockMakeAuthenticatedRequest,
    validateSupportedValues: mockValidateSupportedValues,
}));

jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => mockApiConfig);

const { checkStockStatus } = await import('../../lib/api/stock-status.mjs');

describe('checkStockStatus', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it.each(Object.keys(INSURERS))('should call validateSupportedValues(): %s', (insurer) => {
        const validAuthToken = 'valid-auth-token';
        const { apiConfig } = mockApiConfig;

        expect(() => checkStockStatus(validAuthToken, insurer)).not.toThrow();
        expect(mockValidateSupportedValues).toHaveBeenCalledTimes(1);
        expect(mockMakeAuthenticatedRequest).toHaveBeenCalledTimes(1);
        expect(mockMakeAuthenticatedRequest).toHaveBeenCalledWith(
            apiConfig.general.memberCompanyStock,
            {
                MemberCompanyId: INSURERS[insurer],
            },
            validAuthToken
        );
    });

    it.each(Object.keys(INSURERS))(
        'should throw if validateSupportedValues() throws: %s',
        async (insurer) => {
            mockValidateSupportedValues.mockImplementationOnce(() => {
                throw new Error('unsupported value!');
            });

            const validAuthToken = 'valid-auth-token';

            await expect(checkStockStatus(validAuthToken, insurer)).rejects.toThrow(
                /unsupported value!/
            );
            expect(mockValidateSupportedValues).toHaveBeenCalledTimes(1);
            expect(mockMakeAuthenticatedRequest).not.toHaveBeenCalled();
        }
    );

    it.each(Object.keys(INSURERS))(
        'should throw if makeAuthenticatedRequest() throws: %s',
        async (insurer) => {
            mockMakeAuthenticatedRequest.mockRejectedValueOnce(() => {
                throw new Error('network error');
            });
            const validAuthToken = 'valid-auth-token';
            const { apiConfig } = mockApiConfig;

            await expect(() => checkStockStatus(validAuthToken, insurer)).rejects.toThrow(
                /Stock Status Check Failed: /
            );
            expect(mockValidateSupportedValues).toHaveBeenCalledTimes(1);
            expect(mockMakeAuthenticatedRequest).toHaveBeenCalledTimes(1);
            expect(mockMakeAuthenticatedRequest).toHaveBeenCalledWith(
                apiConfig.general.memberCompanyStock,
                {
                    MemberCompanyId: INSURERS[insurer],
                },
                validAuthToken
            );
        }
    );
});

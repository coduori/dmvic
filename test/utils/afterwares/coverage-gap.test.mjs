import { jest } from '@jest/globals';

import { COVERAGE_GAP_POLICIES } from '../../../lib/utils/constants.mjs';
import {
    coverageGapErrorResponse,
    notFoundErrorResponse,
} from '../../fixtures/sample-sdk-response.mjs';

const mockGetSecret = jest.fn();
const mockConfigureSecrets = jest.fn();
const mockConfirmCoverIssuance = jest.fn();

jest.unstable_mockModule('../../../lib/utils/secrets-handler.mjs', () => ({
    getSecret: mockGetSecret,
    configureSecrets: mockConfigureSecrets,
}));

jest.unstable_mockModule('../../../lib/api/confirm-cover-issuance.mjs', () => ({
    confirmCoverIssuance: mockConfirmCoverIssuance,
}));

const { coverageGapAfterware } = await import('../../../lib/utils/afterwares/coverage-gap.mjs');

describe('coverage gap afterware', () => {
    const authToken = 'test-auth-token';
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it(`should call confirmCoverIssuance() if policy config is set to ${COVERAGE_GAP_POLICIES.BYPASS}`, async () => {
        mockGetSecret.mockReturnValueOnce(COVERAGE_GAP_POLICIES.BYPASS);
        await coverageGapAfterware(coverageGapErrorResponse, { authToken });
        expect(mockGetSecret).toHaveBeenCalledTimes(1);
        expect(mockConfirmCoverIssuance).toHaveBeenCalledTimes(1);
        expect(mockConfirmCoverIssuance).toHaveBeenCalledWith(
            authToken,
            coverageGapErrorResponse.issuanceRequestId
        );
    });

    it(`should return response without calling confirmCoverIssuance() if policy config is set to ${COVERAGE_GAP_POLICIES.STRICT}`, async () => {
        mockGetSecret.mockReturnValueOnce(COVERAGE_GAP_POLICIES.STRICT);
        const response = await coverageGapAfterware(coverageGapErrorResponse, { authToken });
        expect(mockGetSecret).toHaveBeenCalledTimes(1);
        expect(mockConfirmCoverIssuance).toHaveBeenCalledTimes(0);
        expect(response).toEqual(coverageGapErrorResponse);
    });

    it(`should return response without calling confirmCoverIssuance() if response error does not include a coverage gap error`, async () => {
        mockGetSecret.mockReturnValueOnce(COVERAGE_GAP_POLICIES.BYPASS);
        const response = await coverageGapAfterware(notFoundErrorResponse, { authToken });
        expect(mockGetSecret).toHaveBeenCalledTimes(0);
        expect(mockConfirmCoverIssuance).toHaveBeenCalledTimes(0);
        expect(response).toEqual(notFoundErrorResponse);
    });
});

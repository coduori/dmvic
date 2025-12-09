import { jest } from '@jest/globals';

import { apiConfig } from '../../lib/config/api-configs.mjs';
import { generateTestCredentials } from '../factories/test-credential-generator.mjs';
import { getBaseRequestPayload } from '../fixtures/base-payload.mjs';

const testCredentials = generateTestCredentials();
const mockMakeAuthenticatedRequest = jest.fn();

jest.unstable_mockModule('../../lib/utils/api-helpers.mjs', () => ({
    makeAuthenticatedRequest: mockMakeAuthenticatedRequest,
}));

const { getVehicleDetails } = await import('../../lib/api/get-vehicle-details.mjs');

const authToken = testCredentials.password;
const { vehicleRegistrationNumber } = getBaseRequestPayload();

describe('check vehicle insurance status', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('should reject if registrationNumber is not provided', async () => {
        await expect(getVehicleDetails(authToken, {})).rejects.toThrow(
            'Vehicle registration number is required!'
        );
    });

    it('should call makeAuthenticatedRequest with correct payload', async () => {
        await getVehicleDetails(authToken, { registrationNumber: vehicleRegistrationNumber });

        const payload = {
            VehicleRegistrationNumber: vehicleRegistrationNumber,
        };

        expect(mockMakeAuthenticatedRequest).toHaveBeenCalledTimes(1);

        const {
            endpoint,
            requestPayload,
            authToken: tkn,
        } = mockMakeAuthenticatedRequest.mock.calls[0][0];

        expect(endpoint).toBe(apiConfig.general.getVehicleDetails);
        expect(tkn).toBe(authToken);
        expect(requestPayload).toStrictEqual(payload);
        expect(mockMakeAuthenticatedRequest).toHaveBeenCalledWith({
            endpoint: apiConfig.general.getVehicleDetails,
            requestPayload: payload,
            authToken,
        });
    });

    it('should throw if makeAuthenticatedRequest() throws', async () => {
        mockMakeAuthenticatedRequest.mockImplementationOnce(() => {
            throw new Error('network error');
        });
        await expect(
            getVehicleDetails(authToken, { registrationNumber: vehicleRegistrationNumber })
        ).rejects.toThrow(/network error/);
    });
});

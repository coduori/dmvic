import { apiConfig } from '../config/api-configs.mjs';
import { makeAuthenticatedRequest } from '../utils/api-helpers.mjs';
import { getSecret } from '../utils/secrets-handler.mjs';

const confirmCoverIssuance = async (authToken, issuanceRequestId) => {
    const requestBody = {
        IssuanceRequestID: issuanceRequestId,
        IsApproved: true,
        IsLogBookVerified: true,
        IsVehicleInspected: true,
        AdditionalComments: '',
        UserName: getSecret('username'),
    };
    return makeAuthenticatedRequest({
        endpoint: apiConfig.general.confirmIssuance,
        requestPayload: requestBody,
        authToken,
    });
};

export { confirmCoverIssuance };

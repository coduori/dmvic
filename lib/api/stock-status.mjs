import { apiConfig } from '../config/api-configs.mjs';
import { makeAuthenticatedRequest, validateSupportedValues } from '../utils/api-helpers.mjs';
import { INSURERS } from '../utils/insurers.mjs';

const checkStockStatus = async (authToken, insurer) => {
    validateSupportedValues(insurer, Object.keys(INSURERS), 'insurer');

    const requestBody = {
        MemberCompanyId: INSURERS[insurer],
    };

    return makeAuthenticatedRequest({
        endpoint: apiConfig.general.memberCompanyStock,
        requestPayload: requestBody,
        authToken,
    });
};

export { checkStockStatus };

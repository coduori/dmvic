import { apiConfig } from '../config/api-configs.mjs';
import { makeAuthenticatedRequest, validateSupportedValues } from '../utils/api-helpers.mjs';
import { INSURERS } from '../utils/insurers.mjs';

const checkStockStatus = async (authToken, insurer) => {
    validateSupportedValues(insurer, Object.keys(INSURERS), 'insurer');

    const requestBody = {
        MemberCompanyId: INSURERS[insurer],
    };

    const response = await makeAuthenticatedRequest(
        apiConfig.general.memberCompanyStock,
        requestBody,
        authToken
    );

    return response;
};

export { checkStockStatus };

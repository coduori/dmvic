import { apiConfig } from '../config/api-configs.mjs';
import { makeAuthenticatedRequest, validateSupportedValues } from '../utils/api-helpers.mjs';
import { INSURERS } from '../utils/insurers.mjs';

const checkStockStatus = async (authToken, insurer) => {
    validateSupportedValues(insurer, Object.keys(INSURERS), 'insurer');

    const requestBody = {
        MemberCompanyId: INSURERS[insurer],
    };

    let response;
    try {
        response = await makeAuthenticatedRequest(
            apiConfig.general.memberCompanyStock,
            requestBody,
            authToken
        );
    } catch (error) {
        throw new Error(`Stock Status Check Failed: ${error.message}`);
    }

    return response;
};

export { checkStockStatus };

import { apiConfig, getAPIBaseURL } from '../config/api-configs.mjs';
import { invoke } from '../utils/request-handler.mjs';
import { getSecret } from '../utils/secrets-manager.mjs';

const checkStockStatus = async (authToken, insuranceCompanyId) => {
    if (!authToken) {
        throw new Error('Authentication token is required!');
    }
    let response;
    try {
        const body = {
            MemberCompanyId: insuranceCompanyId,
        };
        const APIBaseURL = getAPIBaseURL(getSecret('environment'));
        response = await invoke(
            'POST',
            `${APIBaseURL}${apiConfig.general.memberCompanyStock}`,
            body,
            authToken
        );
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
    return response;
};

export { checkStockStatus };

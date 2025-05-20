import { apiConfig, getAPIBaseURL } from '../config/api-configs.mjs';
import { invoke } from '../utils/request-handler.mjs';
import { getSecret } from '../utils/secrets-manager.mjs';

const getCertificatePdf = async (authToken, certificateNumber) => {
    if (!authToken) {
        throw new Error('Authentication token is required!');
    }
    let response;
    try {
        const body = {
            CertificateNumber: certificateNumber,
        };
        const APIBaseURL = getAPIBaseURL(getSecret('environment'));
        response = await invoke('POST', `${APIBaseURL}${apiConfig.general.getCertificatePDF}`, body, authToken);
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
    return response;
};

export {
    // eslint-disable-next-line import/prefer-default-export
    getCertificatePdf,
};

const API_BASE_URLS = {
    production: 'https://api.dmvic.com',
    uat: 'https://uat-api.dmvic.com',
};

function getAPIBaseURL(env = 'uat') {
    const normalizedEnv = env?.toLowerCase();

    if (normalizedEnv !== 'production') {
        return API_BASE_URLS.uat;
    }

    return API_BASE_URLS[normalizedEnv];
}

const types = ['A', 'B', 'C', 'D'];
const buildEndpoints = (action) => Object.fromEntries(types.map((type) => [`type${type}`, `/api/V5/IntermediaryIntegration/${action}Type${type}Certificate`]));

const apiConfig = {
    issuance: buildEndpoints('Issuance'),
    preview: buildEndpoints('Preview'),
    validation: buildEndpoints('Validate'),
    general: {
        memberCompanyStock: '/api/V5/IntermediaryIntegration/MemberCompanyStock',
        login: '/api/V1/Account/Login',
        confirmIssuance: '/api/v5/Integration/ConfirmCertificateIssuance',
        getCertificatePDF: '/api/v5/Integration/GetCertificate',
        validateInsurance: '/api/v5/Integration/ValidateInsurance',
        cancelCertificate: '/api/v5/Integration/CancelCertificate',
        validateDoubleInsurance: '/api/v5/Integration/ValidateDoubleInsurance',
    },
};

export {
    apiConfig,
    getAPIBaseURL,
};

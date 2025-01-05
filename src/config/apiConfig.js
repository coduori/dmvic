const secretsManager = require('../secretsManager');

const APIBaseURL = process.env.ENVIRONMENT === 'production' ? 'https://api.dmvic.com/api' : 'https://uat-api.dmvic.com/api';

const types = ['A', 'B', 'C', 'D'];
const buildEndpoints = (action) =>
  Object.fromEntries(types.map((type) => [`type${type}`, `${APIBaseURL}/V5/IntermediaryIntegration/${action}Type${type}Certificate`]));

const apiConfig = {
  issuance: buildEndpoints('Issuance'),
  preview: buildEndpoints('Preview'),
  validation: buildEndpoints('Validate'),
  general: {
    memberCompanyStock: `${APIBaseURL}/V5/IntermediaryIntegration/MemberCompanyStock`,
    login: `${APIBaseURL.replace('/api', '/api/V1/Account/Login')}`,
    confirmIssuance: `${APIBaseURL}/v5/Integration/ConfirmCertificateIssuance`,
    getCertificatePDF: `${APIBaseURL}/v5/Integration/GetCertificate`,
    validateInsurance: `${APIBaseURL}/v5/Integration/ValidateInsurance`,
    cancelCertificate: `${APIBaseURL}/v5/Integration/CancelCertificate`,
    validateDoubleInsurance: `${APIBaseURL}/v5/Integration/ValidateDoubleInsurance`,
  },
};

module.exports = apiConfig;

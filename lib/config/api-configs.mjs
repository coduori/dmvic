const API_BASE_URLS = {
  production: 'https://api.dmvic.com',
  sandbox:    'https://uat-api.dmvic.com',
};

function getApiBaseUrl(env = 'sandbox') {
  const error = msg => new Error(`[getApiBaseUrl] ${msg}`);

  if(env && typeof env !== 'string') {
    throw error('Argument for env must be a string');
  }

  const envName = env.toLowerCase()
    .replace(/[^a-z]/, '');

  const url = API_BASE_URLS[envName];
  if(!url) {
    throw error(`Unknown environment ${envName}. No API urls exist for it.`);
  }

  return url;
}

const types = ['A', 'B', 'C', 'D'];
const buildEndpoints = action =>
  Object.fromEntries(
      types.map((type) => [
          `type${type}`,
          `/api/V5/IntermediaryIntegration/${action}Type${type}Certificate`,
      ])
  );

const apiConfig = {
  issuance: buildEndpoints('Issuance'),
  preview: buildEndpoints('Preview'),
  validation: buildEndpoints('Validate'),
  general: {
    memberCompanyStock: '/api/V5/IntermediaryIntegration/MemberCompanyStock',
    login: '/api/V1/Account/Login',
    confirmIssuance: '/api/v5/Integration/ConfirmCertificateIssuance',
    getCertificatePDF: '/api/v5/Integration/GetCertificate',
    validateInsuranceCertificate: '/api/v5/Integration/ValidateInsurance',
    cancelCertificate: '/api/v5/Integration/CancelCertificate',
    validateDoubleInsurance: '/api/v5/Integration/ValidateDoubleInsurance',
    getVehicleDetails: '/api/v5/Integration/VehicleSearch',
  },
};

export { apiConfig, getApiBaseUrl };

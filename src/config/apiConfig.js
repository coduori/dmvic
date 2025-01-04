const secretsManager = require('../secretsManager');

const APIBaseURL = secretsManager.getSecret('dmvicBaseURL');


const apiConfig = {
  issuance: {
    typeA: `${APIBaseURL}/V5/IntermediaryIntegration/IssuanceTypeACertificate`,
    typeB: `${APIBaseURL}/V5/IntermediaryIntegration/IssuanceTypeBCertificate`,
    typeC: `${APIBaseURL}/V5/IntermediaryIntegration/IssuanceTypeCCertificate`,
    typeD: `${APIBaseURL}/V5/IntermediaryIntegration/IssuanceTypeDCertificate`,
  },
  preview: {
    typeA: `${APIBaseURL}/V5/IntermediaryIntegration/PreviewTypeACertificate`,
    typeB: `${APIBaseURL}/V5/IntermediaryIntegration/PreviewTypeBCertificate`,
    typeC: `${APIBaseURL}/V5/IntermediaryIntegration/PreviewTypeCCertificate`,
    typeD: `${APIBaseURL}/V5/IntermediaryIntegration/PreviewTypeDCertificate`,
  },
  validation: {
    typeA: `${APIBaseURL}/V5/IntermediaryIntegration/ValidateTypeACertificate`,
    typeB: `${APIBaseURL}/V5/IntermediaryIntegration/ValidateTypeBCertificate`,
    typeC: `${APIBaseURL}/V5/IntermediaryIntegration/ValidateTypeCCertificate`,
    typeD: `${APIBaseURL}/V5/IntermediaryIntegration/ValidateTypeDCertificate`,
  },
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

module.exports = {
  apiConfig,
};
import { jest } from '@jest/globals';

import { mockSetConfigurationProperty } from '../mocks/mocks.mjs';
import { apiConfig, getAPIBaseURL } from '../../lib/config/apiConfig.mjs';

describe('API Base URL', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return DMVIC UAT URL if the environment is not set', async () => {
        // then
        expect(getAPIBaseURL()).toBe('https://uat-api.dmvic.com');
    });

    it('should return the production URL if the environment is set to production', async () => {
        // when
        jest.resetModules();
        mockSetConfigurationProperty('secrets', 'environment', 'production');

        // then
        expect(getAPIBaseURL('production')).toBe('https://api.dmvic.com');
    });
});

describe('API Endpoints Configuration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should validate the apiConfig object structure', () => {
    // when
        const generalEndpoints = apiConfig?.general;

        // then
        expect(apiConfig).toHaveProperty('issuance');
        expect(apiConfig).toHaveProperty('preview');
        expect(apiConfig).toHaveProperty('validation');
        expect(apiConfig).toHaveProperty('general');

        expect(generalEndpoints).toHaveProperty('memberCompanyStock');
        expect(generalEndpoints).toHaveProperty('login');
        expect(generalEndpoints).toHaveProperty('confirmIssuance');
        expect(generalEndpoints).toHaveProperty('getCertificatePDF');
        expect(generalEndpoints).toHaveProperty('validateInsurance');
        expect(generalEndpoints).toHaveProperty('cancelCertificate');
        expect(generalEndpoints).toHaveProperty('validateDoubleInsurance');
    });

    it('should return the correct endpoints for issuance', () => {
    // when
        const endpoints = apiConfig.issuance;

        // then
        expect(endpoints).toEqual({
            typeA: '/api/V5/IntermediaryIntegration/IssuanceTypeACertificate',
            typeB: '/api/V5/IntermediaryIntegration/IssuanceTypeBCertificate',
            typeC: '/api/V5/IntermediaryIntegration/IssuanceTypeCCertificate',
            typeD: '/api/V5/IntermediaryIntegration/IssuanceTypeDCertificate',
        });
    });

    it('should return the correct endpoints for preview', () => {
    // when
        const endpoints = apiConfig.preview;

        // then
        expect(endpoints).toEqual({
            typeA: '/api/V5/IntermediaryIntegration/PreviewTypeACertificate',
            typeB: '/api/V5/IntermediaryIntegration/PreviewTypeBCertificate',
            typeC: '/api/V5/IntermediaryIntegration/PreviewTypeCCertificate',
            typeD: '/api/V5/IntermediaryIntegration/PreviewTypeDCertificate',
        });
    });

    it('should return the correct endpoints for validation', () => {
    // when
        const endpoints = apiConfig.validation;

        // then
        expect(endpoints).toEqual({
            typeA: '/api/V5/IntermediaryIntegration/ValidateTypeACertificate',
            typeB: '/api/V5/IntermediaryIntegration/ValidateTypeBCertificate',
            typeC: '/api/V5/IntermediaryIntegration/ValidateTypeCCertificate',
            typeD: '/api/V5/IntermediaryIntegration/ValidateTypeDCertificate',
        });
    });

    it('should return the correct strings for general endpoints', () => {
    // when
        const generalEndpoints = apiConfig.general;

        expect(generalEndpoints).toEqual({
            memberCompanyStock: '/api/V5/IntermediaryIntegration/MemberCompanyStock',
            login: '/api/V1/Account/Login',
            confirmIssuance: '/api/v5/Integration/ConfirmCertificateIssuance',
            getCertificatePDF: '/api/v5/Integration/GetCertificate',
            validateInsurance: '/api/v5/Integration/ValidateInsurance',
            cancelCertificate: '/api/v5/Integration/CancelCertificate',
            validateDoubleInsurance: '/api/v5/Integration/ValidateDoubleInsurance',
        });
    });
});

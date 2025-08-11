import { jest } from '@jest/globals';

import { getEnvKey } from '../../lib/utils/secrets-manager.mjs';

const cleanUpEnv = (keys) => {
    for (const key of keys) {
        delete process.env[key];
    }
};

const mockSetConfigurationProperty = (prop, key, value = null) => {
    if (prop === 'secrets') {
        const envKey = getEnvKey(key);
        process.env[envKey] = value;
    }
    if (prop === 'certificate') {
        process.env[`dmvic_${key}`] = `/path/to/test/${key}`;
    } else {
        process.env[`dmvic_${key}`] = value;
    }
};

const mockRequest = jest.fn(() => ({
    statusCode: 200,
    body: {
        json: async () => ({ token: 'mocked-token' }),
    },
}));

const mockHttpClient = {
    getClient: jest.fn(() => ({
        request: mockRequest,
    })),
    __mockRequest: mockRequest,
};

const mockGetSecret = jest.fn((key) => {
    const mockSecrets = {
        username: 'testUser',
        password: 'testPass',
        clientId: 'testClient',
        environment: 'test',
        redis: JSON.stringify({ url: 'redis://localhost:6379' }),
    };
    return mockSecrets[key];
});

const mockSecretsManager = {
    getSecret: mockGetSecret,
    configureSecrets: jest.fn(),
};

const mockApiConfig = {
    apiConfig: {
        general: {
            login: '/api/T1/Account/Login',
            getCertificatePDF: '/api/t5/Integration/GetCertificate',
            memberCompanyStock: '/api/t5/Integration/MemberCompanyStock',
            cancelCertificate: '/api/t5/Integration/CancelCertificate',
            validateDoubleInsurance: '/api/t5/Integration/ValidateDoubleInsurance',
            validateInsuranceCertificate: '/api/t5/Integration/ValidateInsurance',
        },
    },
    getAPIBaseURL: jest.fn((environment) => `https://${environment}-api.example.com`),
};

const mockInvoke = jest.fn();
const mockRequestHandler = { invoke: mockInvoke };

export {
    cleanUpEnv,
    mockApiConfig,
    mockGetSecret,
    mockHttpClient,
    mockInvoke,
    mockRequest,
    mockRequestHandler,
    mockSetConfigurationProperty,
    mockSecretsManager,
};

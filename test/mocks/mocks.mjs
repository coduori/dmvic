import { jest } from '@jest/globals';

const mockInMemoryCache = {
    has: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
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
        clientid: 'testClient',
        environment: 'test',
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
    mockApiConfig,
    mockGetSecret,
    mockHttpClient,
    mockInvoke,
    mockRequest,
    mockRequestHandler,
    mockSecretsManager,
    mockInMemoryCache,
};

import { jest } from '@jest/globals';

const cleanUpEnv = (keys) => {
    keys.forEach((key) => {
        delete process.env[key];
    });
};

const mockSetConfigurationProperty = (prop, key, value = null) => {
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
            login: '/api/V1/Account/Login',
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

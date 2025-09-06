import { jest } from '@jest/globals';
import crypto from 'crypto';

const generateCredential = (prefix, seed = 'dmvic-test') => {
    const hash = crypto
        .createHash('sha256')
        .update(`${prefix}-${seed}`)
        .digest('hex')
        .substring(0, 12);
    return `${prefix}_${hash}`;
};

export const createMockSecretsManager = (customCredentials = {}) => {
    const defaultCredentials = {
        username: generateCredential('user'),
        password: generateCredential('pass'),
        clientid: generateCredential('client'),
        environment: 'test',
    };

    const credentials = { ...defaultCredentials, ...customCredentials };

    const mockGetSecret = jest.fn((key) => credentials[key]);

    return {
        getSecret: mockGetSecret,
        configureSecrets: jest.fn(),
        __mockCredentials: credentials,
    };
};

export const createMockHttpClient = () => {
    const mockRequest = jest.fn(() => ({
        statusCode: 200,
        body: {
            json: async () => ({ token: 'mocked-token' }),
        },
    }));

    return {
        getClient: jest.fn(() => ({
            request: mockRequest,
        })),
        __mockRequest: mockRequest,
    };
};

export const createMockInMemoryCache = () => ({
    has: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
});

export const createMockRequestHandler = () => {
    const mockInvoke = jest.fn();
    return {
        invoke: mockInvoke,
        __mockInvoke: mockInvoke,
    };
};

export const createMockApiConfig = () => ({
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
});

import {
    createMockApiConfig,
    createMockHttpClient,
    createMockInMemoryCache,
    createMockPayloadSchema,
    createMockRequestHandler,
    createMockSecretsHandler,
} from '../factories/mock-factory.mjs';

const mockInMemoryCache = createMockInMemoryCache();
const mockHttpClient = createMockHttpClient();
const mockSecretsHandler = createMockSecretsHandler();
const mockGetSecret = mockSecretsHandler.getSecret;
const mockRequestHandler = createMockRequestHandler();
const mockSendHttpRequest = mockRequestHandler.sendHttpRequest;
const mockApiConfig = createMockApiConfig();
const mockRequest = mockHttpClient.__mockRequest;
const mockPayloadSchema = createMockPayloadSchema();

export {
    mockApiConfig,
    mockGetSecret,
    mockHttpClient,
    mockInMemoryCache,
    mockPayloadSchema,
    mockRequest,
    mockRequestHandler,
    mockSecretsHandler,
    mockSendHttpRequest,
};

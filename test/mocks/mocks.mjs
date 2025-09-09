import {
    createMockInMemoryCache,
    createMockHttpClient,
    createMockSecretsHandler,
    createMockRequestHandler,
    createMockApiConfig,
} from '../factories/mock-factory.mjs';

const mockInMemoryCache = createMockInMemoryCache();
const mockHttpClient = createMockHttpClient();
const mockSecretsHandler = createMockSecretsHandler();
const mockGetSecret = mockSecretsHandler.getSecret;
const mockRequestHandler = createMockRequestHandler();
const mockInvoke = mockRequestHandler.invoke;
const mockApiConfig = createMockApiConfig();
const mockRequest = mockHttpClient.__mockRequest;

export {
    mockApiConfig,
    mockGetSecret,
    mockHttpClient,
    mockInvoke,
    mockRequest,
    mockRequestHandler,
    mockSecretsHandler,
    mockInMemoryCache,
};

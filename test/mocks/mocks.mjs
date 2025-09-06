import {
    createMockInMemoryCache,
    createMockHttpClient,
    createMockSecretsManager,
    createMockRequestHandler,
    createMockApiConfig,
} from '../factories/mock-factory.mjs';

const mockInMemoryCache = createMockInMemoryCache();
const mockHttpClient = createMockHttpClient();
const mockSecretsManager = createMockSecretsManager();
const mockGetSecret = mockSecretsManager.getSecret;
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
    mockSecretsManager,
    mockInMemoryCache,
};

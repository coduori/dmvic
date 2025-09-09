import { createMockSecretsHandler } from '../factories/mock-factory.mjs';

describe('Mock Factory', () => {
    it('should create a mock secrets handler with generated credentials', () => {
        const mockSecretsHandler = createMockSecretsHandler();

        expect(mockSecretsHandler).toHaveProperty('getSecret');
        expect(mockSecretsHandler).toHaveProperty('configureSecrets');
        expect(mockSecretsHandler).toHaveProperty('__mockCredentials');

        const username = mockSecretsHandler.getSecret('username');
        const password = mockSecretsHandler.getSecret('password');
        const clientid = mockSecretsHandler.getSecret('clientid');
        const environment = mockSecretsHandler.getSecret('environment');

        expect(username).toMatch(/^user_[a-f0-9]{12}$/);
        expect(password).toMatch(/^pass_[a-f0-9]{12}$/);
        expect(clientid).toMatch(/^client_[a-f0-9]{12}$/);
        expect(environment).toBe('test');

        const mockSecretsHandler2 = createMockSecretsHandler();
        expect(mockSecretsHandler2.getSecret('username')).toBe(username);
        expect(mockSecretsHandler2.getSecret('password')).toBe(password);
        expect(mockSecretsHandler2.getSecret('clientid')).toBe(clientid);
    });

    it('should allow overriding specific credentials', () => {
        const customEnvironment = 'sandbox';
        const mockSecretsHandler = createMockSecretsHandler({
            environment: customEnvironment,
        });

        expect(mockSecretsHandler.getSecret('environment')).toBe(customEnvironment);

        expect(mockSecretsHandler.getSecret('username')).toMatch(/^user_[a-f0-9]{12}$/);
    });
});

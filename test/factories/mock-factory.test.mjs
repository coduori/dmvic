import { createMockSecretsManager } from '../factories/mock-factory.mjs';

describe('Mock Factory', () => {
    it('should create a mock secrets manager with generated credentials', () => {
        const mockSecretsManager = createMockSecretsManager();

        expect(mockSecretsManager).toHaveProperty('getSecret');
        expect(mockSecretsManager).toHaveProperty('configureSecrets');
        expect(mockSecretsManager).toHaveProperty('__mockCredentials');

        const username = mockSecretsManager.getSecret('username');
        const password = mockSecretsManager.getSecret('password');
        const clientid = mockSecretsManager.getSecret('clientid');
        const environment = mockSecretsManager.getSecret('environment');

        expect(username).toMatch(/^user_[a-f0-9]{12}$/);
        expect(password).toMatch(/^pass_[a-f0-9]{12}$/);
        expect(clientid).toMatch(/^client_[a-f0-9]{12}$/);
        expect(environment).toBe('test');

        const mockSecretsManager2 = createMockSecretsManager();
        expect(mockSecretsManager2.getSecret('username')).toBe(username);
        expect(mockSecretsManager2.getSecret('password')).toBe(password);
        expect(mockSecretsManager2.getSecret('clientid')).toBe(clientid);
    });

    it('should allow overriding specific credentials', () => {
        const customEnvironment = 'sandbox';
        const mockSecretsManager = createMockSecretsManager({
            environment: customEnvironment,
        });

        expect(mockSecretsManager.getSecret('environment')).toBe(customEnvironment);

        expect(mockSecretsManager.getSecret('username')).toMatch(/^user_[a-f0-9]{12}$/);
    });
});

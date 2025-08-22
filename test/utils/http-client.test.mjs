import { jest } from '@jest/globals';

// Mocking the modules
const mockClientInstance = {};
const mockClientConstructor = jest.fn(() => mockClientInstance);
const mockReadFileSync = jest.fn((path, _encoding) => `mocked-${path}`);
const mockExistsSync = jest.fn(
    (filePath) => filePath === '/path/to/key.pem' || filePath === '/path/to/cert.crt'
);
const mockAccessSync = jest.fn();

const mockGetAPIBaseURL = jest.fn(() => 'https://mocked-api');

// Mocking the modules used in the code
jest.unstable_mockModule('undici', () => ({
    Client: mockClientConstructor,
}));

jest.unstable_mockModule('fs', () => ({
    readFileSync: mockReadFileSync,
    existsSync: mockExistsSync,
    accessSync: mockAccessSync,
    constants: {
        R_OK: 4,
    },
}));

jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => ({
    getAPIBaseURL: mockGetAPIBaseURL,
}));

let {
    getClient,
    isValidFileExtension,
    ensureSslFilesExist,
    checkFilePermissions,
    loadSslFiles,
    cachedKey,
    cachedCert,
} = await import('../../lib/utils/http-client.mjs');

describe('Get HTTP Client', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        jest.resetModules();
        ({ getClient } = await import('../../lib/utils/http-client.mjs'));
    });

    it('creates a new Client with correct options on first call', () => {
        process.env.dmvic_sslKey = '/path/to/key.pem';
        process.env.dmvic_sslCert = '/path/to/cert.crt';

        const client = getClient();

        expect(mockGetAPIBaseURL).toHaveBeenCalled();
        expect(mockReadFileSync).toHaveBeenCalledWith('/path/to/key.pem', 'utf8');
        expect(mockReadFileSync).toHaveBeenCalledWith('/path/to/cert.crt', 'utf8');
        expect(mockReadFileSync).toHaveBeenCalledTimes(2);
        expect(mockClientConstructor).toHaveBeenCalledWith('https://mocked-api', {
            connect: {
                key: 'mocked-/path/to/key.pem',
                cert: 'mocked-/path/to/cert.crt',
                requestCert: true,
                rejectUnauthorized: true,
            },
        });
        expect(client).toBe(mockClientInstance);
    });

    it('returns the same client instance on subsequent calls', () => {
        process.env.dmvic_sslKey = '/path/to/key.pem';
        process.env.dmvic_sslCert = '/path/to/cert.crt';

        const client1 = getClient();
        const client2 = getClient();

        expect(client1).toBe(client2);
        expect(mockClientConstructor).toHaveBeenCalledTimes(1);
    });

    it('throws an error if the SSL key or cert file does not exist', () => {
        process.env.dmvic_sslKey = '/invalid/path/key.pem';
        process.env.dmvic_sslCert = '/invalid/path/cert.crt';

        expect(() => getClient()).toThrow('SSL key file not found at: /invalid/path/key.pem');
    });

    it('throws an error if the SSL key or cert file has an invalid extension', () => {
        process.env.dmvic_sslKey = '/path/to/key.pem';
        process.env.dmvic_sslCert = '/path/to/cert.pdf'; // Invalid extension

        expect(() => getClient()).toThrow(
            'Invalid file format. Only .pem or .crt files are allowed.'
        );
    });

    it('throws an error if the SSL files are not readable', () => {
        process.env.dmvic_sslKey = '/path/to/key.pem';
        process.env.dmvic_sslCert = '/path/to/cert.crt';

        mockAccessSync.mockImplementationOnce(() => {
            throw new Error();
        }); // Simulating access failure

        expect(() => getClient()).toThrow('The following files are not readable: /path/to/key.pem');
    });
});

describe('File Extension Validation', () => {
    it('should allow pem and crt file extensions only', () => {
        expect(isValidFileExtension('/test/directory/file.pem')).toBe(true);
        expect(isValidFileExtension('../test/directory/file.pdf')).toBe(false);
        expect(isValidFileExtension('../../directory/file.docs')).toBe(false);
    });
});

describe('SSL File Validation', () => {
    it('should ensure SSL files exist and have correct extensions', () => {
        const sslKeyPath = '/path/to/key.pem';
        const sslCertPath = '/path/to/cert.crt';

        mockExistsSync.mockImplementation((filePath) => {
            return filePath === sslKeyPath || filePath === sslCertPath;
        });

        expect(() => ensureSslFilesExist(sslKeyPath, sslCertPath)).not.toThrow();
    });

    it('should throw error if SSL key file does not exist', () => {
        const sslKeyPath = '/invalid/path/key.pem';
        const sslCertPath = '/path/to/cert.crt';

        mockExistsSync.mockImplementationOnce(() => false);

        expect(() => ensureSslFilesExist(sslKeyPath, sslCertPath)).toThrow(
            `SSL key file not found at: ${sslKeyPath}. Please ensure the path is correct.`
        );
    });

    it('should throw error if SSL cert file does not exist', () => {
        const sslKeyPath = '/path/to/key.pem';
        const sslCertPath = '/invalid/path/cert.crt';

        mockExistsSync.mockImplementationOnce(() => true).mockImplementationOnce(() => false);

        expect(() => ensureSslFilesExist(sslKeyPath, sslCertPath)).toThrow(
            `SSL cert file not found at: ${sslCertPath}. Please ensure the path is correct.`
        );
    });

    it('should throw error if files have invalid extensions', () => {
        const sslKeyPath = '/path/to/key.txt'; // Invalid file extension
        const sslCertPath = '/path/to/cert.pdf'; // Invalid file extension

        expect(() => ensureSslFilesExist(sslKeyPath, sslCertPath)).toThrow(
            'Invalid file format. Only .pem or .crt files are allowed.'
        );
    });

    it('should check file permissions for SSL files', () => {
        const sslKeyPath = '/path/to/key.pem';
        const sslCertPath = '/path/to/cert.crt';

        mockAccessSync.mockImplementation(() => {}); // Mocking successful permission check
        mockAccessSync.mockImplementation((filePath, _mode) => {
            const failedPaths = [];
            if (filePath === '/path/to/key.pem' || filePath === '/path/to/cert.crt') {
                return;
            } else {
                throw new Error(`The following files are not readable: ${failedPaths.join(', ')}`);
            }
        });

        expect(() => checkFilePermissions([sslKeyPath, sslCertPath])).not.toThrow();
    });

    it('should throw an error if SSL file permissions are not granted', () => {
        const sslKeyPath = '/path/to/key.pem';
        const sslCertPath = '/path/to/cert.crt';

        mockAccessSync.mockImplementationOnce(() => {
            throw new Error();
        });

        expect(() => checkFilePermissions([sslKeyPath, sslCertPath])).toThrow(
            'The following files are not readable: /path/to/key.pem'
        );
    });
});

describe('Load SSL Files', () => {
    it('should load SSL files into cache', () => {
        const sslKeyPath = '/path/to/key.pem';
        const sslCertPath = '/path/to/cert.crt';

        mockExistsSync.mockImplementationOnce(() => true).mockImplementationOnce(() => true);
        mockReadFileSync
            .mockImplementationOnce(() => 'mocked-key-content')
            .mockImplementationOnce(() => 'mocked-cert-content');

        loadSslFiles(sslKeyPath, sslCertPath);

        // Ensure files are cached
        expect(mockReadFileSync).toHaveBeenCalledWith(sslKeyPath, 'utf8');
        expect(mockReadFileSync).toHaveBeenCalledWith(sslCertPath, 'utf8');
    });

    it('should not reload SSL files if already cached', () => {
        // Initially set cached key and cert (simulating they're already cached)
        cachedKey = 'mocked-key-content';
        cachedCert = 'mocked-cert-content';

        const sslKeyPath = '/path/to/key.pem';
        const sslCertPath = '/path/to/cert.crt';

        loadSslFiles(sslKeyPath, sslCertPath);

        // Ensure that the files are not re-read from the file system
        expect(mockReadFileSync).not.toHaveBeenCalled();

        // Assert that cached values are not altered (since they were already cached)
        expect(cachedKey).toBe('mocked-key-content');
        expect(cachedCert).toBe('mocked-cert-content');
    });
});

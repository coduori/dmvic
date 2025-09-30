import { createPrivateKey, X509Certificate } from 'node:crypto';
import * as fs from 'node:fs';
import path from 'node:path';

const { existsSync, accessSync, constants } = fs;

const getExpectedSubject = (environment) => {
    const subjectMappings = {
        sandbox: 'CN=uat-api.dmvic.com',
        production: 'CN=api.dmvic.com',
    };
    const envKey = environment.toLowerCase();
    const expectedSubject = subjectMappings[envKey];
    if (!expectedSubject) {
        throw new Error(
            `No expected certificate subject defined for environment: "${environment}"`
        );
    }
    return expectedSubject;
};

export function validateCertConfig(config) {
    if (typeof config !== 'object' || config === null || Array.isArray(config)) {
        throw new Error('Invalid certificate configuration. Expected a plain object.');
    }

    const allowedKeys = ['sslKey', 'sslCert'];
    const configKeys = Object.keys(config);
    const extraKeys = configKeys.filter((key) => !allowedKeys.includes(key));
    if (extraKeys.length > 0) {
        throw new Error(
            `Configuration errors: Invalid certificate configuration. Unexpected key(s): ${extraKeys.join(', ')}`
        );
    }

    const errors = [];

    const sslKey = typeof config.sslKey === 'string' ? config.sslKey.trim() : '';
    const sslCert = typeof config.sslCert === 'string' ? config.sslCert.trim() : '';

    if (!sslKey) {
        errors.push('sslKey is required');
    }
    if (!sslCert) {
        errors.push('sslCert is required');
    }

    if (sslKey && sslCert && sslKey === sslCert) {
        errors.push('SSL key and SSL cert paths cannot be identical');
    }

    if (errors.length > 0) {
        throw new Error(`Configuration errors: ${errors.join('; ')}`);
    }

    return config;
}

const validateFilePaths = (resolvedCertConfig) => {
    const errors = [];

    for (const [key, certPath] of Object.entries(resolvedCertConfig)) {
        if (typeof certPath !== 'string') {
            errors.push(`Invalid path for "${key}". Path must be a string.`);
            continue;
        }

        const sanitizedPath = path.normalize(certPath);

        if (!['.pem', '.crt'].includes(path.extname(sanitizedPath))) {
            errors.push(`Invalid file format for "${key}". Only .pem or .crt files are allowed.`);
        }

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        if (!existsSync(sanitizedPath)) {
            errors.push(
                `Certificate file not found at: ${sanitizedPath}. Please ensure the path is correct.`
            );
        }

        try {
            accessSync(sanitizedPath, constants.R_OK);
        } catch {
            errors.push(`The certificate file at "${sanitizedPath}" is not readable.`);
        }
    }

    if (errors.length > 0) {
        throw new Error(`Multiple validation errors found:\n- ${errors.join('\n- ')}`);
    }
};

const validateCertContents = (fileContents, environment) => {
    try {
        const cert = new X509Certificate(fileContents.sslCert);

        if (environment) {
            const expectedSubject = getExpectedSubject(environment);
            if (cert.subject !== expectedSubject) {
                throw new Error(
                    `Certificate subject "${cert.subject}" does not match the expected subject for environment "${environment}": "${expectedSubject}".`
                );
            }
        }

        const privateKeyObject = createPrivateKey(fileContents.sslKey);
        if (!cert.checkPrivateKey(privateKeyObject)) {
            throw new Error("Private key does not match the certificate's public key.");
        }
    } catch (error) {
        throw new Error(`Invalid certificate or key content: ${error.message}`);
    }
};

export { validateCertContents,validateFilePaths };

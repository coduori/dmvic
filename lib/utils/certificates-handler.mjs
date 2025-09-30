import path from 'node:path';
import { readFileSync } from 'node:fs';

import { inMemoryCache } from './cache.mjs';
import {
    validateCertConfig,
    validateFilePaths,
    validateCertContents,
} from './config-validation/certificates-validator.mjs';

const readCertFiles = (resolvedCertConfig) => {
    const fileContents = {};
    for (const [key, certPath] of Object.entries(resolvedCertConfig)) {
        try {
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fileContents[key] = readFileSync(certPath, 'utf8');
        } catch (error) {
            throw new Error(
                `Error reading certificate "${key}" from path: ${certPath}. ${error.message}`
            );
        }
    }
    return fileContents;
};

const configureCertificates = (certConfig, environment, cache = inMemoryCache) => {
    validateCertConfig(certConfig);

    const resolvedCertConfig = {
        sslKey: path.resolve(certConfig.sslKey),
        sslCert: path.resolve(certConfig.sslCert),
    };

    validateFilePaths(resolvedCertConfig);
    const fileContents = readCertFiles(resolvedCertConfig);
    validateCertContents(fileContents, environment);

    cache.set('sslKey', fileContents.sslKey);
    cache.set('sslCert', fileContents.sslCert);
};

const getCertificate = (key, cache = inMemoryCache) => {
    if (!cache.has(key)) {
        throw new Error(`Certificate "${key}" is not configured or loaded.`);
    }
    return cache.get(key);
};

export { configureCertificates, getCertificate };

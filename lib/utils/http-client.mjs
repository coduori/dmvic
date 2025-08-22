import { Client } from 'undici';
import { readFileSync, existsSync, accessSync, constants } from 'fs';
import path from 'path';
import { getAPIBaseURL } from '../config/api-configs.mjs';

let apiClient;
let cachedKey;
let cachedCert;

const getClient = () => {
    if (apiClient) return apiClient;

    const APIBaseURL = getAPIBaseURL();
    const sslKeyFilePath = path.resolve(process.env.dmvic_sslKey);
    const sslCertFilePath = path.resolve(process.env.dmvic_sslCert);

    ensureSslFilesExist(sslKeyFilePath, sslCertFilePath);
    checkFilePermissions([sslKeyFilePath, sslCertFilePath]);
    loadSslFiles(sslKeyFilePath, sslCertFilePath);

    if (!apiClient) {
        apiClient = new Client(APIBaseURL, {
            connect: {
                key: cachedKey,
                cert: cachedCert,
                requestCert: true,
                rejectUnauthorized: true,
            },
        });
    }
    return apiClient;
};

function isValidFileExtension(filePath) {
    return path.extname(filePath) === '.pem' || path.extname(filePath) === '.crt';
}

function ensureSslFilesExist(resolvedSslKeyPath, resolvedSslCertPath) {
    if (!isValidFileExtension(resolvedSslKeyPath) || !isValidFileExtension(resolvedSslCertPath)) {
        throw new Error('Invalid file format. Only .pem or .crt files are allowed.');
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (!existsSync(resolvedSslKeyPath)) {
        throw new Error(
            `SSL key file not found at: ${resolvedSslKeyPath}. Please ensure the path is correct.`
        );
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (!existsSync(resolvedSslCertPath)) {
        throw new Error(
            `SSL cert file not found at: ${resolvedSslCertPath}. Please ensure the path is correct.`
        );
    }
}

function checkFilePermissions(filePaths) {
    const failedPaths = [];
    for (const filePath of filePaths) {
        try {
            accessSync(filePath, constants.R_OK);
        } catch {
            failedPaths.push(filePath);
        }
    }

    if (failedPaths.length > 0) {
        throw new Error(`The following files are not readable: ${failedPaths.join(', ')}`);
    }
}

function loadSslFiles(keyPath, certPath) {
    const resolvedKeyPath = path.resolve(keyPath);
    const resolvedCertPath = path.resolve(certPath);

    ensureSslFilesExist(resolvedKeyPath, resolvedCertPath);
    if (!cachedKey) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        cachedKey = readFileSync(resolvedKeyPath, 'utf8');
    }
    if (!cachedCert) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        cachedCert = readFileSync(resolvedCertPath, 'utf8');
    }
}

export {
    getClient,

    // these are imported for testing purposes only
    isValidFileExtension,
    ensureSslFilesExist,
    checkFilePermissions,
    loadSslFiles,
    cachedKey,
    cachedCert,
};

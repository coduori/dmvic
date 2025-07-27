import path from 'path';

const configureCertificatePath = (certConfig) => {
    if (!certConfig || typeof certConfig !== 'object') {
        throw new Error('Invalid certificate configuration. Expected an object.');
    }

    ['sslKey', 'sslCert'].forEach((key) => {
        if (!(key in certConfig)) {
            throw new Error(`Missing required key: "${key}" in certificate configuration.`);
        }
    });

    Object.entries(certConfig).forEach(([key, certPath]) => {
        try {
            process.env[`dmvic_${key}`] = path.resolve(certPath);
        } catch (error) {
            throw new Error(`Error reading certificate "${key}" from path: ${certPath}`);
        }
    });
};

const getCertificate = (key) => {
    if (!process.env[`dmvic_${key}`]) {
        throw new Error(`Certificate "${key}" is not configured.`);
    }

    return process.env[`dmvic_${key}`];
};

export {
    configureCertificatePath,
    getCertificate,
};

import path from 'path';

const configureCertificatePath = (certConfig) => {
    if (!certConfig || typeof certConfig !== 'object') {
        throw new Error('Invalid certificate configuration. Expected an object.');
    }

    for (const key of ['sslKey', 'sslCert']) {
        if (!(key in certConfig)) {
            throw new Error(`Missing required key: "${key}" in certificate configuration.`);
        }
    }

    for (const [key, certPath] of Object.entries(certConfig)) {
        try {
            process.env[`dmvic_${key}`] = path.resolve(certPath);
        } catch {
            throw new Error(`Error reading certificate "${key}" from path: ${certPath}`);
        }
    }
};

const getCertificate = (key) => {
    if (!process.env[`dmvic_${key}`]) {
        throw new Error(`Certificate "${key}" is not configured.`);
    }

    return process.env[`dmvic_${key}`];
};

export { configureCertificatePath, getCertificate };

/*
TODO:
1. Add a function to clear the certificate paths from the environment variables.
*/

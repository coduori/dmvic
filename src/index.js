import { Client } from 'undici';
import path from 'path';
import { readFileSync } from 'fs';

import { authenticate } from './APIs/authentication.js';
import { getCertificate, configureCertificatePath } from './certManager.js';
import { getSecret, configureSecrets } from './secretsManager.js';
import { APIBaseURL } from './config/apiConfig.js';

let client;
const getClient = () => {
  if (!client) {
    client = new Client(APIBaseURL, {
      connect: {
        key: readFileSync(path.resolve(getCertificate('sslKey')), 'utf8'),
        cert: readFileSync(path.resolve(getCertificate('sslCert')), 'utf8'),
        requestCert: true,
        rejectUnauthorized: false,
      },
    });
    console.log("Client initialized.");
  }
  return client;
};

const initialize = async (config) => {
  if (!config || typeof config !== 'object') {
    throw new Error("Invalid configuration. Expected an object.");
  }

  const { secrets, certificates } = config;

  if (secrets) {
    configureSecrets(secrets);
  }
  if (certificates) {
    configureCertificatePath(certificates);
  }

  console.log("Service initialized with provided secrets and certificates.");
};

export {
  getClient,
  initialize,
  getSecret,
  getCertificate,
  authenticate
};
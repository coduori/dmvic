const { Client } = require('undici');
const path = require('path');
const { readFileSync } = require('fs');

const secretsManager = require('./secretsManager');
const authentication = require('./APIs/authentication');
const { APIBaseURL } = require('./config/apiConfig');
const certificateManager = require('./certManager');

let client;
const getClient = () => {
  if (!client) {
    client = new Client(APIBaseURL, {
      connect: {
        key: readFileSync(path.resolve(certificateManager.getCertificate('sslKey')), 'utf8'),
        cert: readFileSync(path.resolve(certificateManager.getCertificate('sslCert')), 'utf8'),
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
    secretsManager.configureSecrets(secrets);
  }
  if (certificates) {
    certificateManager.configureCertificatePath(certificates);
  }

  console.log("Service initialized with provided secrets and certificates.");
};

module.exports = {
  getClient,
  initialize,
  getSecret: secretsManager.getSecret,
  sendRequest: certificateManager.getCertificate,
  authenticate: authentication.authenticate
};
const redis = require('redis');

const secretsManager = require('./secretsManager');
const certManager = require('./certManager');
const authentication = require('./APIs/authentication');

const initialize = async (config) => {
    if (!config || typeof config !== 'object') {
      throw new Error("Invalid configuration. Expected an object.");
    }
  
    const { secrets, certificates } = config;
  
    if (secrets) {
      secretsManager.configureSecrets(secrets);
    }
    if (certificates) {
      certManager.configureCertificatePath(certificates);
    }
  
    console.log("Service initialized with provided secrets and certificates.");
  };

  module.exports = {
    initialize,
    getSecret: secretsManager.getSecret,
    sendRequest: certManager.getCertificate,
    authenticate: authentication.authenticate
  };
const redis = require('redis');

const secretsManager = require('./secretsManager');
const certManager = require('./certManager');
const authentication = require('./APIs/authentication')

const initialize = (config) => {
    if (!config || typeof config !== 'object') {
      throw new Error("Invalid configuration. Expected an object.");
    }
  
    const { secrets, certificates } = config;
  
    if (secrets) {
      secretsManager.configureSecrets(secrets);
    }
    if (certificates) {
      certManager.configureCertificates(certificates);
    }

    const redisClient = redis.createClient(secretsManager.getSecret('redis'));

    redisClient.connect()
        .then(() => console.log('Connected to Redis'))
        .catch((err) => console.error('Redis connection error:', err));
  
    console.log("Service initialized with provided secrets and certificates.");
  };
  
  module.exports = {
    initialize,
    redisClient,
    getSecret: secretsManager.getSecret,
    getCertificate: certManager.getCertificate,
    authenticate: authentication.authenticate
  };
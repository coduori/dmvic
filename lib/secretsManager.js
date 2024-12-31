const secrets = {};

const configureSecrets = (config) => {
  if (!config || typeof config !== 'object') {
    throw new Error("Invalid configuration. Expected an object.");
  }
  Object.assign(secrets, config);
};

const getSecret = (key) => {
  if (!secrets[key]) {
    throw new Error(`Secret "${key}" is not configured.`);
  }
  return secrets[key];
};

module.exports = {
  configureSecrets,
  getSecret,
};

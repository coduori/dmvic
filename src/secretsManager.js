const secrets = {};

const configureSecrets = (config) => {
  if (!config || typeof config !== 'object') {
    throw new Error("Invalid configuration. Expected an object.");
  }

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'object') {
      process.env[`DMVIC_${key}`] = JSON.stringify(value);

    } else {
      process.env[`DMVIC_${key}`] = value;
    }
  }

};

const getSecret = (key) => {
  if (!process.env[`DMVIC_${key}`]) {
    throw new Error(`Secret "${key}" is not configured.`);
  }

  let result = process.env[`DMVIC_${key}`];
  if (['redis', 'postgres'].includes(key)) {
    result = JSON.parse(value);
  }
  return result;
};

module.exports = {
  configureSecrets,
  getSecret,
};

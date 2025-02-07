const configureSecrets = (secretConfig) => {
  if (!secretConfig || typeof secretConfig !== 'object') {
    throw new Error("Invalid configuration. Expected an object.");
  }

  for (const [key, secretPath] of Object.entries(secretConfig)) {
    try {
      if (typeof secretPath === 'object') {
        process.env[`DMVIC_${key}`] = JSON.stringify(secretPath);
      } else {
        process.env[`DMVIC_${key}`] = secretPath;
      }
    } catch (error) {
      throw new Error(`Error reading certificate "${key}" from path: ${secretPath}`);
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

export {
  configureSecrets,
  getSecret,
};

const fs = require('fs');
const path = require('path');

const configureCertificatePath = (certConfig) => {
  if (!certConfig || typeof certConfig !== 'object') {
    throw new Error("Invalid certificate configuration. Expected an object.");
  }

  for (const [key, certPath] of Object.entries(certConfig)) {
    try {
      process.env[`DMVIC_${key}`] = path.resolve(certPath);
    } catch (error) {
      throw new Error(`Error reading certificate "${key}" from path: ${certPath}`);
    }
  }
};

const getCertificate = (key) => {
  if (!process.env[`DMVIC_${key}`]) {
    throw new Error(`Certificate "${key}" is not configured.`);
  }

  return process.env[`DMVIC_${key}`];
};

module.exports = {
  configureCertificatePath,
  getCertificate,
};
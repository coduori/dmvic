const fs = require('fs');
const path = require('path');

let certificates = {};

const configureCertificates = (certConfig) => {
  if (!certConfig || typeof certConfig !== 'object') {
    throw new Error("Invalid certificate configuration. Expected an object.");
  }
  certificates = {};
  for (const [key, certPath] of Object.entries(certConfig)) {
    try {
      certificates[key] = fs.readFileSync(path.resolve(certPath), 'utf8');
    } catch (error) {
      throw new Error(`Error reading certificate "${key}" from path: ${certPath}`);
    }
  }
};

const getCertificate = (key) => {
  if (!certificates[key]) {
    throw new Error(`Certificate "${key}" is not configured.`);
  }
  return certificates[key];
};

module.exports = {
  configureCertificates,
  getCertificate,
};
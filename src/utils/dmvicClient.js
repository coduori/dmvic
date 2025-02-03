const { Client } = require('undici');
const { readFileSync } = require('fs');

const { APIBaseURL } = require('../config/apiConfig');

let client;
const getClient = () => {
  if (!client) {
    client = new Client(APIBaseURL, {
      connect: {
        key: readFileSync(process.env['DMVIC_sslKey'], 'utf8'),
        cert: readFileSync(process.env['DMVIC_sslCert'], 'utf8'),
        requestCert: true,
        rejectUnauthorized: false,
      },
    });
  }
  return client;
};

module.exports = {
  getClient,
};
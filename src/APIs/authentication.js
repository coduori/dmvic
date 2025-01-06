const redis = require('redis');

const { apiConfig } = require('../config/apiConfig');
const secretsManager = require('../secretsManager');
const invoke = require('../utils/http');

const authenticate = async () => {
  let response;

    try {
      const body = {
        username: secretsManager.getSecret('username'),
        password: secretsManager.getSecret('password')
      };

      response = await invoke('POST', apiConfig.general.login, body, false);

      if (!response.statusCode === 200) {
        return response.error;
      }

      const redisClient = redis.createClient(JSON.parse(process.env.DMVIC_redis));
      await redisClient.connect();
      await redisClient.set('DMVIC_AUTH_TOKEN', response.token, { EX: 604800 });
    
      } catch (error) {
        throw new Error('Error fetching data:', error);
      }
};

module.exports = {
    authenticate,
};
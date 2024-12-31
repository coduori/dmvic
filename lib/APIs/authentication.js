
const apiConfig = require('../config/apiConfig');
const fetchData = require('../utils/fetch');
const { redisClient } = require('../index');
const secretsManager = require('../secretsManager');

const authenticate = async () => {
    try {
        const body = {
          username: secretsManager.getSecret(username),
          password: secretsManager.getSecret(password)
        };
        const response = await fetchData('POST', apiConfig.general.login, body);
    
        if (!response.statusCode === 200) {
          return response.error;
        }
        await redisClient.set(`dmvic_auth_token`, response.token, { EX: 604800 });
    
      } catch (error) {
        throw new Error('Error fetching data:', error);
      }
    
      return response.token;
};

module.exports = {
    authenticate,
};
import redis from 'redis';

import { apiConfig, APIBaseURL } from '../config/apiConfig.mjs';
import { getSecret } from '../secretsManager.mjs';
import { getClient } from '../utils/dmvicClient.mjs';

const authenticate = async () => {
  let response;

  try {
    const body = {
      username: getSecret('username'),
      password: getSecret('password')
    };

    const headers = {
      accept: 'application/json',
      'Content-Type': 'application/json',
      clientId: getSecret('clientId')
    };

    const rezponse = await getClient().request({
      path: `${APIBaseURL}/${apiConfig.general.login}`,
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    });
    response = await rezponse.body.json();

    if (!rezponse.statusCode === 200) {
      return response.message;
    }

    const redisClient = redis.createClient(JSON.parse(process.env.DMVIC_redis));
    await redisClient.connect();
    await redisClient.set('DMVIC_AUTH_TOKEN', response.token, { EX: 604800 });

  } catch (error) {
    throw new Error('Error fetching data:', error);
  }
};

export {
  authenticate,
};

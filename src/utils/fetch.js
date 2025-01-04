const axios = require('axios');

export async function fetchData(method, path, data) {
    const headers = {
        'Content-Type': 'application/json',
        'clientId': secretsManager.getSecret(clientId),
    }
    const response = await axios({
        url: path,
        method,
        headers,
        data
    });

  return response;
}
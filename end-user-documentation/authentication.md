
### Authentication

To authenticate your requests to DMVIC, use the `authenticate()` function. This function takes no parameters. You will need to call the function immediately after initialization, when the token expires (after 7 days or when an auth request was made outside of your system), or when you get a 401 response status code. When this function is called, it sends an authentication request to DMVIC and returns an authentication token which should be cached in your service and used to make subsequent requests to DMVIC.

> **Note:** DMVIC requires that you cache your authentication token for 7 days. Make sure your authentication logic stores the token you receive in the response, preferably in a Redis Cache.
>
> If you do not cache your token, your application will call the authentication API on every request. This can quickly lead to rate limiting and may result in your DMVIC account being locked.


```javascript
import { authenticate } from 'dmvic';
import redis from 'redis';

const redisClient = redis.createClient({
    url: 'redis://localhost:6379',
});
await redisClient.connect();

async function authenticateDMVICRequests() {
    const dmvicAuthToken = await authenticate();

    // store the token in a redis cache
    await redisClient.set('dmvic:auth:token', dmvicAuthToken, { EX: 604800 });
}
authenticateDMVICRequests();
```

All subsequent requests to DMVIC will require you to pass the token along when making a request.

[Back to home page](../README.md)

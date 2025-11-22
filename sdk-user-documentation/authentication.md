### Authentication

To authenticate your requests to DMVIC, use the `authenticate()` function. This function takes no parameters. You will need to call the function immediately after initialization, when the token expires (after 7 days or when an auth request was made outside of your system), or when you get a 401 response status code. When this function is called, it sends an authentication request to DMVIC and returns an authentication token which should be cached in your service and used to make subsequent requests to DMVIC.

> **Note:** DMVIC requires that you cache your authentication token for 7 days. Make sure your authentication logic stores the token you receive in the response, preferably in a Redis Cache.
>
> If you do not cache your token, your application will call the authentication API on every request. This can quickly lead to rate limiting and may result in your DMVIC account being locked.

```javascript
import { authenticate } from 'dmvic';

import { redisClient } from './redis/client.mjs';

async function authenticateOnDMVIC() {
    const response = await authenticate();
    if (response.responseData?.token) {
        await redisClient.set('dmvic:auth:token', response.responseData.token, {
            expiration: { type: 'EX', value: 604800 },
        });
    }
    return response;
}
const response = await authenticateOnDMVIC();
```

#### Responses

**Successful authentication response**

```javascript
{
  success: true,
  responseData: {
    token: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IjVCQjRFNjE4NzdGNTMxRUJDQUZCOEIwMEFGRjkzMkU5QkI2Qjc0NjQiLCJ0eXAiOiJKV1QifQ.eyJyb2xlIjoiWU9VUl9VU0VSX1JPTEUiLCJ1bmlxdWVJRCI6IllPVVJfVU5JUVVFX0lEIiwibmJmIjoxNzYzODIyNDAwLCJleHAiOjE3NjQ0MjcxOTksImlhdCI6MTc2MzgyMjQwMCwiaXNzIjoiaHR0cHM6Ly91YXQtYXBpLmRtdmljLmNvbSIsImF1ZCI6Imh0dHBzOi8vdWF0LWFwaS5kbXZpYy5jb20ifQ.wYPJ8fkFzhiM2e9IAJS_IDHdLwVAOllzR4lm97uImuE',
    loginUserId: '6080HJED-C5EC-4005-8B30-140EE8786YYA',
    issueAt: '2025-11-22T14:34:59.4472082Z',
    expires: '2025-11-29T14:39:59.4254222Z',
    code: 1,
    LoginHistoryId: 2068797,
    firstName: 'User',
    lastName: 'Name',
    loggedinEntityId: 19950,
    ApimSubscriptionKey: null,
    IndustryTypeId: 4
  },
  httpStatusCode: 200
}
```

**Invalid Username response**

```javascript
{
  error: [
    {
      errorCode: -6,
      errorText: 'Username is Invalid.please enter correct username',
      sdkErrorCode: 'INVLD_USR'
    }
  ],
  httpStatusCode: 200
}
```

**Invalid Password response**

```javascript
{
  error: [
    {
      errorCode: -3,
      errorText: 'Incorrect Username or Password entered. -2 Attempts Remaining..!',
      sdkErrorCode: 'INVLD_CRD'
    }
  ],
  httpStatusCode: 200
}
```

**Locked Account Response**

```javascript
{
  error: [
    {
      errorCode: -4,
      errorText: 'Your account has been locked, Please contact your administrator.',
      sdkErrorCode: 'LCKD_ACC'
    }
  ],
  httpStatusCode: 200
}
```

All subsequent requests to DMVIC will require you to pass the token along when making a request.

[Back to home page](../README.md)

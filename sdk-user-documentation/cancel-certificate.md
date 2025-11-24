### Cancel Certificate Issuance

This feature facilitates cancellation of a motor vehicle certificate. DMVIC allows cancellation of a policy certificate if it is done within 6 hours of cover issuance. Beyond 6 hours intemediaries have to request cover cancellation directly from the insurer.

#### Example

```javascript
import { cancelCertificate } from 'dmvic';

import { redisClient } from './redis/client.mjs';

async function cancelMotorVehicleCertificate(certificateNumber, cancellationReason) {
    // retrieve the token from your cache
    const authToken = await redisClient.get('dmvic:auth:token');

    return cancelCertificate(authToken, certificateNumber, cancellationReason);
}
const cancelledCertificate = await cancelMotorVehicleCertificate('C27400610', 'INSURED_REQUESTED');
```

#### Cancellation Reasons

```
  INSURED_REQUESTED, AMEND_PASSENGER_COUNT, CHANGE_SCOPE_OF_COVER, POLICY_NOT_TAKEN_UP, VEHICLE_SOLD,
  AMEND_INSURED_DETAILS, AMEND_VEHICLE_DETAILS, SUSPECTED_FRAUD, NON_PAYMENT, MISSING_KYC, GOVERNMENT_REQUEST,
  SUBJECT_MATTER_CEASED, CHANGE_PERIOD_OF_INSURANCE, INSURER_DECLINED_COVER, WRITTEN_OFF, STOLEN,
```

#### Invalid Auth Token response
For an invalid token response, always re-authenticate using the `authentication()` method to get a new token and use it to re-send the request

```javascript
{
    apiRequestNumber: 'UAT-OJM5688',
    error: [
        {
            errorCode: 'ER001',
            errorText: 'Token is expired or invalid',
            sdkErrorCode: 'INVLD_TKN',
        },
    ],
    httpStatusCode: 200
}
```

#### More than 6 hours cancellation

Policies cancelled after 6 hours of issuing will have the following error response:

```javascript
{
  error: [
    {
      errorCode: 'ER0010',
      errorText: 'Sorry! you can not cancel the certificate since issuance time exceeded 6 hours.'
      sdkErrorCode: 'CXL_TTL_EXCD'
    }
  ],
  httpStatusCode: 200
}
```

#### Invalid certificate number cancellation

Cancelling a certificate that was not issued by the cancelling intermediary will receive the following error:

```javascript
{
  error: [
    {
      errorCode: 'ER004',
      errorText: 'Certificate Number is not valid'
      sdkErrorCode: 'INVLD_CERT'
    }
  ],
  httpStatusCode: 200
}

```

#### Successful certificate cancellation response

```javascript
{
  responseBody: {
      Inputs: '{"certificatenumber":"C27384993","cancelreasonid":18}',
      callbackObj: { TransactionReferenceNumber: 'UAT-XAK0552' },
      success: true,
      Error: [],
      APIRequestNumber: 'UAT-OIH7618',
      DMVICRefNo: null,
  },
  statusCode: 200,
}
```

[Back to home page](../README.md)

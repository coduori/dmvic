### Check insurance status

This feature checks whether a vehicle has han active cover. IRA prohibits double insurance for a single vehicle. For this reason, it is important to check whether a vehicle has an active cover before requesting for an insurance certificate from DMVIC. It is not possible to request for more than one insurance cover for a single vehicle.

#### Example

```javascript
import { checkInsuranceStatus } from 'dmvic';

import { redisClient } from './redis/client.mjs';

async function preIssuanceCheck(registrationNumber, chassisNumber) {
    // retrieve the token from your cache
    const authToken = await redisClient.get('dmvic:auth:token');

    const insuranceStatus = await checkInsuranceStatus(authToken, {
        // vehicle registration must be passed if the chassis number is not passed
        registrationNumber,
        // you can optionally pass the chassis number
        chassisNumber,
    });
    return insuranceStatus;
}
const insuranceStatus = await preIssuanceCheck('KKA12A', 'AT211-7689809');
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

#### Vehicle not covered by insurance response

This means you are free to request for an insurance cover for this vehicle because it doesn't have an active cover.

```javascript
{
  apiRequestNumber: 'UAT-OJM5542',
  error: [
    {
      errorCode: 'ER0016',
      errorText: 'No Records Found'
      sdkErrorCode: 'NOT_FOUND'
    }
  ],
  httpStatusCode: 200
}
```

#### Vehicle covered by insurance

This means the vehicle already has an active cover and you should not request for an insurance cover for the vehicle.

```javascript
{
  result: {
    apiRequestNumber: 'UAT-OJM5468',
    success: true,
    responseData: {
      DoubleInsurance: [
        {
          CoverEndDate: '13/12/2025 23:59',
          InsuranceCertificateNo: 'C27400604',
          MemberCompanyName: 'DEFINITE ASSURANCE CO. LTD',
          RegistrationNumber: 'KKK111Q',
          ChassisNumber: 'AT-11-VEH015871'
        }
      ],
    },
    requestData: '{"vehicleregistrationnumber":"KKK111Q","policystartdate":"24/11/2025","policyenddate":"23/11/2026"}',
    httpStatusCode: 200
  }
}
```

[Back to home page](../README.md)

### Check Insurance Company Stock Status

Before requesting for a motor vehicle insurance certificate as an intermediary, the target insurance company should have allocated stock to your DMVIC account.
This feature enables checking the stock count that has been provided by the insurance company. When the stock is 0, you cannot succesfully request for a motor vehicle certificate and thus you need to request for stock replenishment from the insurance company.

```javascript
import { checkStockStatus } from 'dmvic';

import { redisClient } from './redis/client.mjs';

async function checkInsuranceCompanyStockCount(insurer) {
    // retrieve the token from your cache
    const authToken = await redisClient.get('dmvic:auth:token');

    const stockStatus = await checkStockStatus(authToken, partnerName);
    return stockStatus;
}
const result = await checkInsuranceCompanyStockCount('DEFINITE_INSURANCE');
```

The options used for the insurer property can be found in the [supported insurers](./request-insurance-certificate.md/#supported-insurers-supported-insurers) section.
The stock count response is organised according to the types of motor vehicle insurance certificates.

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

#### Empty Stock

```javascript
{
  apiRequestNumber: 'UAT-OJM5667',
  success: true,
  responseData: { MemberCompanyStock: [] },
  httpStatusCode: 200
}
```

```javascript
{
  apiRequestNumber: 'UAT-OJM5667',
  success: true,
  responseData: {
    MemberCompanyStock: [
        {
            CertificateClassificationID: 1,
            ClassificationTitle: 'Class A - PSV Unmarked',
            Stock: 0
        },
        {
            CertificateClassificationID: 2,
            ClassificationTitle: 'Type B - Commercial Vehicle',
            Stock: 100
        },
        {
            CertificateClassificationID: 3,
            ClassificationTitle: 'Type C - Private Car',
            Stock: 88
        },
        {
            CertificateClassificationID: 4,
            ClassificationTitle: 'Type D - Motor Cycle',
            Stock: 200
        },
        {
            CertificateClassificationID: 5,
            ClassificationTitle: 'Aviation',
            Stock: 0
        },
        {
            CertificateClassificationID: 8,
            ClassificationTitle: 'Type A - Taxi',
            Stock: 0
        },
        {
            CertificateClassificationID: 9,
            ClassificationTitle: 'Type D - PSV',
            Stock: 0
        },
        {
            CertificateClassificationID: 10,
            ClassificationTitle: 'Type D – Motor Cycle Commercial',
            Stock: 0
        }
    ]
  },
  httpStatusCode: 200
}
```

[Back to home page](../README.md)

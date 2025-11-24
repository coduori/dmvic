### Get Certificate PDF document

This function will retrieve a certificate PDF document given a certificate number. Certificate PDFs are printed and stuck on a motor vehicle's windscreen or other easily visible location on the motor vehicle.
This document will contain the details of the insurance cover for the motor vehicle.

For a successful request, the API responds with a URL containing the link to a downloadable PDF file.
Opening the link on a browser automatically downloads the certificate PDF document.

#### Example

```javascript
import { getCertificatePdf } from 'dmvic';

import { redisClient } from './redis/client.mjs';

const downloadCertificatePdf = async (insuranceCertificateNumber) => {
    // retrieve the token from your cache
    const authToken = await redisClient.get('dmvic:auth:token');

    const result = await getCertificatePdf(authToken, insuranceCertificateNumber);
    return result;
};
const certificateResponse = await downloadCertificatePdf('C27400610');
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

#### Invalid certificate number

This means the certificate is invalid. Likely happens if you use a certificate number from an expired certificate.

```javascript
{
    apiRequestNumber: 'UAT-OJM5552',
    error: [
        Error: [
            {
                errorCode: 'ER009',
                errorText: 'Invalid CertificateNo',
                sdkErrorCode: 'INVLD_CERT_PDF'
            }
        ]
    ],
    httpStatusCode: 200
}
```

#### Successful request for insurance certificate PDF

The link provided by the `URL` property is the link to download the certificate PDF document. The link is only valid for a short while.
You may need to download it in case you need to store the actual copy.

```javascript
{
  apiRequestNumber: 'UAT-OJM5557',
  success: true,
  responseData: {
    URL: 'https://insurancedevelopment.blob.core.windows.net/immutable-dmvic-cert/67850_E7FD5850E904921B4E9844B81B96E3EDF620ED38.pdf?sv=2021-08-06&st=2025-11-24T06%3A33%3A47Z&se=2025-11-24T19%3A33%3A47Z&sr=b&sp=r&sig=TH8X4nAD57vDhLGctsODZmFYzmsGAup1Yc%2Fb5xumu5A%3D'
  },
  requestData: { CertificateNumber: 'C27400612' },
  httpStatusCode: 200
}
```

[Back to home page](../README.md)

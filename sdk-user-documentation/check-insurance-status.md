### Check insurance status

This feature checks whether a vehicle has han active cover. IRA prohibits double insurance for a single vehicle. For this reason, it is important to check whether a vehicle has an active cover before requesting for an insurance certificate from DMVIC. It is not possible to request for more than one insurance cover for a single vehicle.

#### Example

```javascript
import { checkInsuranceStatus } from 'dmvic';

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
preIssuanceCheck('KKA12A', 'AT211-7689809');
```

#### Vehicle not covered by insurance response

```javascript
{
  {
    Inputs: '{"vehicleregistrationnumber":"VVD300J","policystartdate":"24/07/2025","policyenddate":"24/07/2026"}',
    callbackObj: {},
    success: false,
    Error:  [ { errorCode: 'ER0016', errorText: 'No Records Found' } ],
    APIRequestNumber: 'UAT-OIC7914',
    DMVICRefNo: null
  },
  statusCode: 200
}
```

#### Vehicle covered by insurance

```json
{
    "Inputs": "",
    "callbackObj": {
        "DoubleInsurance": [
            {
                "CoverEndDate": "22/02/2026",
                "InsuranceCertificateNo": "C31309821",
                "MemberCompanyName": "Trident Insurance Company Ltd.",
                "InsurancePolicyNo": "G/HQ/0700/099829",
                "RegistrationNumber": "KBO705N",
                "ChassisNumber": "ABH11-00NHJ71",
                "MemberCompanyID": 44,
                "CertificateStatus": "Active"
            }
        ]
    },
    "success": true,
    "Error": [],
    "APIRequestNumber": "OA-YZ7858",
    "DMVICRefNo": null
}
```

[Back to home page](../README.md)

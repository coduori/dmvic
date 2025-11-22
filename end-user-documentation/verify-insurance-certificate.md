

### Verify Insurance Certificate

This feature helps in verifying the validity of a motor vehicle insurance certificate.
Vehicle insurance certificate verification is important in preventing and minimizing insurance fraud.
It is recommended to pass either one of registration or chassis number because if both are provided and the chasis does not match the provided vehicle registration, the response returned by DMVIC will not be accurate.

#### Example

```javascript
import { verifyInsuranceCertificate } from 'dmvic';

async function checkInsuranceCertificateValidity(
    registrationNumber,
    chassisNumber,
    certificateNumber
) {
    // retrieve the token from your cache
    const authToken = await redisClient.get('dmvic:auth:token');

    const insuranceStatus = await verifyInsuranceCertificate(authToken, {
        // vehicle registration must be passed if the chassis number is not passed
        registrationNumber,
        certifcateNumber,
        // you can optionally pass the chassis number
        chassisNumber,
    });
    return insuranceStatus;
}
checkInsuranceCertificateValidity('KKA12A', 'AT211-7689809', 'B12984443');
```

#### Valid and Active insurance certificate response

```json
{
    "Inputs": {
        "VehicleRegistrationnumber": "KSY777Y",
        "Chassisnumber": "D45678K",
        "CertificateNumber": "B12984443"
    },
    "callbackObj": {
        "ValidateInsurance": {
            "CertificateNumber": "B12984443",
            "InsurancePolicyNumber": "definite/commercial/4",
            "ValidFrom": "12/07/2025 00:00",
            "ValidTill": "11/06/2026 23:59",
            "Registrationnumber": "KSY777Y",
            "InsuredBy": "DEFINITE ASSURANCE CO. LTD",
            "Chassisnumber": "D45678K",
            "sInsuredName": "JANE DOE",
            "Intermediary": "COMPANY INSURANCE LIMITED",
            "IntermediaryIRA": "IRA/05/22222/2022",
            "CertificateStatus": "Active",
            "IsDigitalCertificate": true,
            "CertificateClassificationName": null,
            "CarryingCapacity": 0,
            "Tonnage": 0,
            "make": null,
            "model": null
        }
    },
    "success": true,
    "Error": [],
    "APIRequestNumber": "UAT-OIC9579",
    "DMVICRefNo": null
}
```

#### Valid but cancelled insurance certificate response

```json
{
    "Inputs": {
        "VehicleRegistrationnumber": "KEL011C",
        "Chassisnumber": null,
        "CertificateNumber": "C27384993"
    },
    "callbackObj": {
        "ValidateInsurance": {
            "CertificateNumber": "C27384993",
            "InsurancePolicyNumber": "MTEST32481",
            "ValidFrom": "22/07/2025 00:00",
            "ValidTill": "22/07/2025 09:50",
            "Registrationnumber": "KEL011C",
            "InsuredBy": "DEFINITE ASSURANCE CO. LTD",
            "Chassisnumber": "JALFRRXCLF06881790",
            "sInsuredName": "JAMES BOND",
            "Intermediary": "COMPANY INSURANCE LIMITED",
            "IntermediaryIRA": "IRA/05/22222/2022",
            "CertificateStatus": "Cancelled",
            "IsDigitalCertificate": true,
            "CertificateClassificationName": null,
            "CarryingCapacity": 0,
            "Tonnage": 0,
            "make": null,
            "model": null
        }
    },
    "success": true,
    "Error": [],
    "APIRequestNumber": "UAT-OIC9581",
    "DMVICRefNo": null
}
```

#### Invalid certificate or vehicle registration and chassis number combination

```json
{
    "Inputs": {
        "VehicleRegistrationnumber": "KELds011C",
        "Chassisnumber": null,
        "CertificateNumber": "C27384993"
    },
    "callbackObj": {},
    "success": false,
    "Error": [
        {
            "errorCode": "ER004",
            "errorText": "Certificate Number is not valid"
        }
    ],
    "APIRequestNumber": "UAT-OIC9582",
    "DMVICRefNo": null
}
```
[Back to home page](../README.md)

# DMVIC - Digital Motor Vehicle Insurance Certificates

## Features

- [Initialization](#initialization)
- [Authentication](#authentication)
- [Request Insurance Certificate](#request-insurance-certificate)
- [Check Insurance Company Stock Status](#check-insurance-company-stock-status)
- [Get certificate PDF document](#get-certificate-pdf-document)
- [Cancel Certificate Issuance](#cancel-certificate-issuance)
- [Check Insurance Status](#check-insurance-status)
- [Verify Insurance Certificate](#verify-insurance-certificate)
- [Confirm Cover Issuance](#confirm-cover-issuance)

### Initialization

`includeoptionaldata` specifies whether optional data in the API request sent to DMVIC API should be included in the payload.
`coveragegappolicy` specifies how duration gaps between insurance covers should be handled; `strict` means not to issue the cover if a duration gap exists, `bypass` means issue the certificate even if a period gap exists between insurance covers.

```javascript
import { initialize } from 'dmvic';

async function initializeDmvic() {
    await initialize({
        secrets: {
            username: 'your_dmvic_username',
            password: 'your_dmvic_password',
            clientid: 'your_dmvic_client_id',
            environment: 'sandbox', // sandbox || production
            includeoptionaldata: false, // true || false
            coveragegappolicy: 'bypass', // strict || bypass
        },
        certificates: {
            sslCert: './path/to/your/dmvic/cert.pem',
            sslKey: './path/to/your/dmvic/key.pem',
        },
    });
}

initializeDmvic();
```

### Authentication

> **Note:** It is recommended that you cache your authentication token for 7 days.

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
const authResponse = await authenticateOnDMVIC();
```

### Request Insurance Certificate

#### Example

```javascript
import { requestInsuranceCertificate } from 'dmvic';

import { redisClient } from './redis/client.mjs';

async function main() {
    // retrieve the token from your cache
    const authToken = await redisClient.get('dmvic:auth:token');

    const response = await requestInsuranceCertificate(authToken, {
        insurer: 'MONARCH',
        coverType: 'COMP'
        policyHolderFullName: 'John Doe',
        policyNumber: 'MON/TEST/COMP/001',
        commencingDate: '01/01/2026',
        expiringDate: '31/12/2026',
        vehicleChassisNumber: '1G6SD5P98FV489725',
        vehicleEngineNumber: 'C8N-725-H8J-9842',
        vehicleValue: 1500000,
        vehicleYearOfManufacture: 2020,
        vehicleBodyType: 'SUV',
        certificateType: 1,
        passengerCount: 5000,
        recipientPhoneNumber: '[RECIPIENT_PHONE_NUMBER]', // 9 Digit phone number in string format
        recipientEmail: 'your-email@dmomain.tld',
        vehicleMake: 'BMW',
        vehicleModel: 'X1',
        policyHolderKRAPIN: '[POLICY_HOLDER_KRA_PIN]',
        vehicleRegistrationNumber: 'K7YY9CKELC',
    }, 'A');
}

main();
```

**Motor vehicle class** – `A`, `B`, `C`, or `D`

The payload structure varies depending on the motor vehicle class. Some fields are mandatory across all classes, while others are class-specific or optional.

> **Note:** If `includeoptionaldata` was set to `false` during initialization, optional fields will be omitted before sending the request to DMVIC. If set to `true`, optional fields will be included.

#### Required Fields (All Vehicle Classes)

- `insurer`
- `coverType`
- `policyHolderFullName`
- `policyNumber`
- `commencingDate`
- `expiringDate`
- `recipientEmail`
- `vehicleChassisNumber`
- `recipientPhoneNumber`
- `vehicleBodyType`

#### Dynamic Requirements

**Vehicle Identification:**

- Provide either `vehicleRegistrationNumber` OR `vehicleEngineNumber` (not both)

**Sum Insured:**

- `vehicleValue` is required only when `coverType` is `COMP` or `TPTF`
- Do not provide `vehicleValue` for `TPO` covers

#### Field Values and Options

##### Supported Insurers {#supported-insurers}

```
AIG, AMACO, APA, BRITAM_INSURANCE, CANNON, CIC, DEFINITE_INSURANCE,
DIRECTLINE, FIDELITY_INSURANCE, FIRST_ASSURANCE, GA_INSURANCE, GEMINIA,
HERITAGE, ICEA_LION, KENINDIA, INTRAAFRICA, JUBILEE_ALLIANZ, KENYA_ALLIANCE,
KENYA_ORIENT, MADISON, MAYFAIR, MUA, MONARCH, OLD_MUTUAL, OCCIDENTAL,
PACIS, PIONEER, SANLAM, STAR_DISCOVER, TAKAFUL, TRIDENT
```

##### Cover Types

- `COMP` - Comprehensive
- `TPO` - Third Party Only
- `TPTF` - Third Party, Theft & Fire

##### Vehicle Types (Class B Only)

- `OWN_GOODS`
- `GENERAL_CARTAGE`
- `INSTITUTIONAL_VEHICLE`
- `SPECIAL_VEHICLE`
- `LIQUID_CARRYING_TANKERS`
- `ROAD_RISK_MOTOR_TRADE`

##### Certificate Types

**Class A (PSV):**

- `PSV_UNMARKED`
- `TAXI`

**Class D (Motorcycles):**

- `PRIVATE_MOTOR_CYCLE`
- `PSV_MOTOR_CYCLE`
- `COMMERCIAL_MOTOR_CYCLE`

#### Class-Specific Requirements

##### Tonnage

Required for commercial vehicles:

- All Class B vehicles
- Class D vehicles with `COMMERCIAL_MOTOR_CYCLE` certificate type

##### Passenger Count

Required for Classes A, B, and D:

- Class D: Only required for `PRIVATE_MOTOR_CYCLE` or `PSV_MOTOR_CYCLE`
- Maximum value: 200 passengers

##### Certificate Type

- **Class A and D:** `TypeOfCertificate` is mandatory
- **Class B and C:** Not applicable

#### Optional Fields (All Classes)

- `policyHolderHudumaNumber`
- `vehicleYearOfManufacture`
- `policyHolderKRAPIN`
- `vehicleMake`
- `vehicleModel`

### Confirm Cover Issuance

#### Example

```javascript
import { getCertificatePdf } from 'dmvic';

import { redisClient } from './redis/client.mjs';

const issueCertificateWithDurationGaps = async (issuanceRequestId) => {
    // retrieve the token from your cache
    const authToken = await redisClient.get('dmvic:auth:token');

    // get the issuanceRequestId from the COVERAGE_GAP error response payload returned after calling requestInsuranceCertificate
    const result = await confirmCoverIssuance(authToken, issuanceRequestId);
    return result;
};
const certificateResponse = await issueCertificateWithDurationGaps('UAT-OJQ0842');
```

### Cancel Certificate Issuance

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

### Check insurance status

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

### Get Certificate PDF document

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

### Check Insurance Company Stock Status

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

The options used for the insurer property can be found in the [supported insurers section](#supported-insurers-supported-insurers).

### Verify Insurance Certificate

#### Example

```javascript
import { verifyInsuranceCertificate } from 'dmvic';

import { redisClient } from './redis/client.mjs';

async function checkInsuranceCertificateValidity(
    registrationNumber,
    chassisNumber,
    certificateNumber // optional
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
const result = await checkInsuranceCertificateValidity({
    vehicleRegistration: 'KKA12A',
    certificateNumber: 'B12984443',
});
```

## License

This library is licensed under the [GNU](https://www.gnu.org/licenses/lgpl-3.0.md/) License.

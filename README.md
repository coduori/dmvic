# DMVIC - Digital Motor Vehicle Insurance Certificates

<div align="justify">
This library provides a simple and intuitive way to interact with the DMVIC API endpoints directly from your Node.js applications. Whether you're issuing certificates, validating insurance, managing member company stock, or performing other operations, this library abstracts the complexity and makes integration seamless.
</div>

<div align="justify">
With support for all key functionalities — such as certificate issuance, preview, validation, cancellation, and more — this library is your one-stop solution for integrating with the DMVIC system.
</div>

## Installation

To install dmvic

using npm:

```bash
npm install dmvic
```

using yarn:

```bash
yarn install dmvic
```

## Features

- Initialization
- Authentication
- Check Insurance Company Stock Status
- Get certificate PDF document
- Cancel Certificate Issuance
- Check Insurance Status
- Verify Insurance Certificate
- Request Insurance Certificate

## Usage

<div align="justify">
To send a request to a protected DMVIC endpoint, you need to be authenticated using the credentials provided to you by DMVIC. All DMVIC endpoints apart from the login endpoint are protected. This documentation assumes that you have already decoded the certificates provided to you by DMVIC.
</div>

### Initialization

<div align="justify">
Before making any requests, you need to initialize the library with your credentials and configuration. Use the `initialize()` function to set up the library. For the environment config, specify `production` to connect to DMVIC's live environment; `sandbox` will connect to DMVIC's UAT environment.
</div>

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
        },
        certificates: {
            sslCert: './path/to/your/dmvic/cert.pem',
            sslKey: './path/to/your/dmvic/key.pem',
        },
    });
}

initializeDmvic();
```

<div align="justify">
Calling the `initialize()` function stores the configurations in your service environment variables. The configs will be used by the library to make requests to DMVIC.
</div>

### Authentication

<div align="justify">
To authenticate your requests to DMVIC, use the `authenticate()` function. This function takes no parameters. You only need to call it once throughout your project. You can call the function immediately after initialization. When this function is called, it sends an authentication request to DMVIC and returns an authentication token which should be cached in your service and used to make subsequent requests to DMVIC.

> **Note:** DMVIC requires that you cache your authentication token for 7 days. Make sure your authentication logic stores the token you receive in the response.
>
> If you do not cache your token, your application will call the authentication API on every request. This can quickly lead to rate limiting and may result in your DMVIC account being locked.

</div>

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

<div align="justify">
All subsequent requests to DMVIC will require you to pass the token along when making a request.
</div>

### Check Insurance Company Stock Status

<div align="justify">
Before requesting for a motor vehicle insurance certificate as an intermediary, the target insurance company
should have allocated stock to your DMVIC account. This feature enables checking the stock count that has been provided by the insurance company. When the stock is 0, you cannot succesfully request for a motor vehicle certificate and thus you need to request for stock replenishment from the insurance company.

<div>

```javascript
import { checkStockStatus } from 'dmvic';
import redis from 'redis';

const redisClient = redis.createClient({
    url: 'redis://localhost:6379',
});
await redisClient.connect();

async function checkInsuranceCompanyStockCount(insurer) {
    // retrieve the token from your cache
    const authToken = await redisClient.get('dmvic:auth:token');

    return checkStockStatus(authToken, insurer);
}
checkInsuranceCompanyStockCount();
```

The options used for the insurer property can be found in the [supported insurers](#supported-insurers) section.
The stock count response is organised according to the types of motor vehicle insurance certificates.

```
{
    "CertificateClassificationID": 1,
    "ClassificationTitle": "Class A - PSV Unmarked",
    "Stock": 100
},
```

### Get Certificate PDF document

This function will retrieve a certificate PDF document given a certificate number. Certificate PDFs are printed and stuck on a motor vehicle's windscreen or other easily visible location on the motor vehicle.
This document will contain the details of the insurance cover for the motor vehicle.

For a successful request, the API responds with a URL containing the link to a downloadable PDF file.
Opening the link on a browser automatically downloads the certificate PDF document.

#### Example

```
{
    "URL": "https://insurancedevelopment.blob.core.windows.net/immutable-cancelled-cert/49935_0137372C3723135FD26E3A643C99C5F54FF811A8.pdf?sv=2021-08-06&st=2025-05-20T05%3A53%3A32Z&se=2025-05-20T18%3A53%3A32Z&sr=b&sp=r&sig=WnfcVyCLMLPcggpTimvDQEILUt%2FZYPm4XhzsOde5VDk%3D"
}
```

### Cancel Certificate Issuance

<div align="justify">
This feature facilitates cancellation of a motor vehicle certificate. DMVIC allows cancellation of a policy certificate if it is done within 6 hours of cover issuance. Beyond 6 hours intemediaries have to request cover cancellation directly from the insurer.
</div>

#### Example

```javascript
import { cancelCertificate } from 'dmvic';

async function cancelMotorVehicleCertificate(
    certificateNumber,
    cancellationReason = 'INSURED_REQUESTED'
) {
    // retrieve the token from your cache
    const authToken = await redisClient.get('dmvic:auth:token');

    return cancelCertificate(authToken, certificateNumber, cancellationReason);
}
cancelMotorVehicleCertificate();
```

#### Cancellation Reasons

```
    INSURED_REQUESTED, AMEND_PASSENGER_COUNT, CHANGE_SCOPE_OF_COVER, POLICY_NOT_TAKEN_UP, VEHICLE_SOLD,
    AMEND_INSURED_DETAILS, AMEND_VEHICLE_DETAILS, SUSPECTED_FRAUD, NON_PAYMENT, MISSING_KYC, GOVERNMENT_REQUEST,
    SUBJECT_MATTER_CEASED, CHANGE_PERIOD_OF_INSURANCE, INSURER_DECLINED_COVER, WRITTEN_OFF, STOLEN,
```

#### More than 6 hours cancellation

Policies cancelled after 6 hours of issuing will have the following error response:

```javascript
{
    errorCode: 'ER0010',
    errorText: 'Sorry! you can not cancel the certificate since issuance time exceeded 6 hours.'
}

```

#### Invalid certificate number cancellation

Cancelling a certificate that was not issued by the cancelling intermediary will receive the following error:

```javascript
{
  errorCode: 'ER004',
  errorText: 'Certificate Number is not valid'
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

### Check insurance status

<div align="justify">
This feature checks whether a vehicle has han active cover. IRA prohibits double insurance for a single vehicle, for this reason, it is important to check whether a vehicle has an active cover before requesting for an insurance coverage certificate from DMVIC. It is not possible to request for more than one insurance cover for a single vehicle.
</div>

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

### Verify Insurance Certificate

This feature helps in verifying the validity of a motor vehicle insurance certificate.
Vehicle insurance certificate verification is important in preventing and minimizing insurance fraud.
It is recommended to pass either one of the registration or chassis number because if both are provided and the chasis does not match the provided vehicle registration, the response returned by DMVIC will not be accurate.

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
            "InsurancePolicyNumber": "first_assurance/commercial/4",
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

### Request Insurance Certificate

This is the core feature for DMVIC. It requests for a motor vehicle certificate from the DMVIC System. When calling this endpoint in production, ensure the provided data is accurate and necessary payments have been made to avoid legal complications. Ensure the insurer has accorded the necessary stock to request for the certificate. You can check your stock levels using the check stock feature.

#### Example

```javascript
import { requestInsuranceCertificate } from 'dmvic';

import { getDMVICAuthToken } from './authenticate.mjs';
import { initializeDMVIC } from './initialize.mjs';

async function main() {
    await initializeDMVIC();

    const authToken = await getDMVICAuthToken();
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
        recipientPhoneNumber: '712345678',
        recipientEmail: 'iconcept24@gmail.com',
        vehicleMake: 'BMW',
        vehicleModel: 'X1',
        policyHolderKRAPIN: 'P123456789A',
        vehicleRegistrationNumber: 'K7YY9CKELC',
    }, 'A');
}

main();
```

The `requestInsuranceCertificate` function accepts three parameters:

1. **Authentication token** – A valid token that should be cached and reused for up to 7 days
2. **Payload data** – The request body containing insurance details
3. **Motor vehicle class** – Determines the structure and required fields of the payload (`A`, `B`, `C`, or `D`)

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
- `vehicleBodyType`

## License

This library is licensed under the [GNU](https://www.gnu.org/licenses/lgpl-3.0.md/) License.

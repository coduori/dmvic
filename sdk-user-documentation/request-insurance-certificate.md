### Request Insurance Certificate

This is the core feature for DMVIC. It requests for a motor vehicle certificate from the DMVIC System. When calling this endpoint in production, ensure the provided data is accurate and necessary payments have been made. Ensure the insurer has accorded the necessary stock to request for the certificate. You can check your stock levels using the check stock feature.

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
        recipientEmail: 'your-email@dmomain.tld',
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

[Back to home page](../README.md)

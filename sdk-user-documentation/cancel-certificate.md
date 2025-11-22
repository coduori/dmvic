### Cancel Certificate Issuance

This feature facilitates cancellation of a motor vehicle certificate. DMVIC allows cancellation of a policy certificate if it is done within 6 hours of cover issuance. Beyond 6 hours intemediaries have to request cover cancellation directly from the insurer.

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

[Back to home page](../README.md)

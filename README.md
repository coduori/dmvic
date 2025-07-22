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


## Usage

<div align="justify">
To send a request to a protected DMVIC endpoint, you need to be authenticated using the credentials provided to you by DMVIC. All DMVIC endpoints apart from the login endpoint are protected. This documentation assumes that you have already decoded the certificates provided to you by DMVIC.
</div>

### Initialization

<div align="justify">
Before making any requests, you need to initialize the library with your credentials and configuration. Use the `initialize()` function to set up the library:
</div>


```javascript
import { initialize } from 'dmvic';

async function initializeDmvic() {
  await initialize({
    secrets: {
      username: "your_dmvic_username",
      password: "your_dmvic_password",
      clientId: "your_dmvic_client_id",
      environment: "staging",
    },
    certificates: {
      sslCert: "./path/to/your/dmvic/cert.pem",
      sslKey: "./path/to/your/dmvic/key.pem",
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
})
await redisClient.connect()

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

> **Note:** The insurance company ID required as input in the `checkStockStatus()` function is provided by DMVIC and is not an arbitrary number. See below the list of supported companies and their matching DMVIC IDs. 
> 
>
<div>

```javascript
import { checkStockStatus } from 'dmvic';
import redis from 'redis';

const redisClient = redis.createClient({
  url: 'redis://localhost:6379',
})
await redisClient.connect()

async function checkInsuranceCompanyStockCount(insuranceCompanyId) {
  // retrieve the token from your cache
  const authToken = await redisClient.get('dmvic:auth:token');

  return checkStockStatus(authToken, insuranceCompanyId);
}
checkInsuranceCompanyStockCount();
```

The stock count response is organised according to the types of motor vehicle insurance certificates.
```
  {
      "CertificateClassificationID": 1,
      "ClassificationTitle": "Class A - PSV Unmarked",
      "Stock": 100
  },
```

#### Member Company IDs

| Company Name                | DMVIC Member Company ID |
|-----------------------------|:----------------------:|
| AIG                         | 12                     |
| AMACO                       | 11                     |
| APA                         | 14                     |
| Britam Insurance            | 15                     |
| Cannon                      | 32                     |
| CIC                         | 16                     |
| Definite Insurance          | 49                     |
| Directline                  | 18                     |
| Fidelity Insurance          | 19                     |
| First Assurance             | 20                     |
| GA Insurance                | 21                     |
| Geminia                     | 22                     |
| Heritage                    | 42                     |
| ICEA Lion                   | 23                     |
| Kenindia                    | 27                     |
| Intraafrica                 | 24                     |
| Invesco                     | 29                     |
| Jubilee Allianz             | 26                     |
| Kenya Alliance              | 29                     |
| Kenya Orient                | 28                     |
| Madison                     | 30                     |
| Mayfair                     | 31                     |
| MUA                         | 35                     |
| Monarch                     | 43                     |
| Old Mutual                  | 45                     |
| Occidental                  | 33                     |
| Pacis                       | 34                     |
| Pioneer                     | 36                     |
| Sanlam                      | 39                     |
| Star Discover               | 47                     |
| Takaful                     | 40                     |
| Trident                     | 44                     |
| Xplico                      | 46                     |

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

async function cancelMotorVehicleCertificate(certificateNumber, cancellationReasonId) {
  // retrieve the token from your cache
  const authToken = await redisClient.get('dmvic:auth:token');

  return cancelCertificate(authToken, certificateNumber, cancellationReasonId);
}
cancelMotorVehicleCertificate();
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

## License

This library is licensed under the [GNU](https://www.gnu.org/licenses/lgpl-3.0.md/) License.


# DMVIC - Digital Motor Vehicle Insurance Certificates

This library provides a simple and intuitive way to interact with the DMVIC API endpoints directly from your Node.js applications. Whether you're issuing certificates, validating insurance, managing member company stock, or performing other operations, this library abstracts the complexity and makes integration seamless.

With support for all key functionalities — such as certificate issuance, preview, validation, cancellation, and more — this library is your one-stop solution for integrating with the DMVIC system.

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
- [Authentication](./sdk-user-documentation/authentication.md)
- [Check Insurance Company Stock Status](./sdk-user-documentation/check-insurance-status.md)
- [Get certificate PDF document](./sdk-user-documentation/get-certificate-pdf.md)
- [Cancel Certificate Issuance](./sdk-user-documentation/cancel-certificate.md)
- [Check Insurance Status](./sdk-user-documentation/check-insurance-status.md)
- [Verify Insurance Certificate](./sdk-user-documentation/verify-insurance-certificate.md)
- [Request Insurance Certificate](./sdk-user-documentation/request-insurance-certificate.md)

## TypeScript Support

This library is fully typed and provides excellent IntelliSense support for TypeScript projects. All interfaces, enums, and function signatures are available as type definitions.

## Usage

To send a request to a protected DMVIC endpoint, you need to be authenticated using the credentials provided to you by DMVIC. All DMVIC endpoints apart from the login endpoint are protected. This documentation assumes that you have already decoded the certificates provided to you by DMVIC.

### Initialization

Before making any requests, you need to initialize the library with your credentials and security certificates in order to prepare the library for usage. The library stores these configurations in memory. For the environment property, specify `production` to connect to DMVIC's live environment; `sandbox` will connect to DMVIC's UAT environment.
`includeoptionaldata` specifies whether optional data in the API request sent to DMVIC API should be included in the payload.

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

Feature Documentation
For specific feature documentation on implementation see

## License

This library is licensed under the [GNU](https://www.gnu.org/licenses/lgpl-3.0.md/) License.

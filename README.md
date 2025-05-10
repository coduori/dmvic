# DMVIC - Digital Motor Vehicle Insurance Certificates

This library provides a simple and intuitive way to interact with the DMVIC API endpoints directly from your Node.js applications. Whether you're issuing certificates, validating insurance, managing member company stock, or performing other operations, this library abstracts the complexity and makes integration seamless.

With support for all key functionalities—such as certificate issuance, preview, validation, cancellation, and more—this library is your one-stop solution for integrating with the DMVIC system.

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

## Usage

To send a request to a protected DMVIC endpoint, you need to be authenticated using the credentials provided to you by DMVIC. All DMVIC endpoints apart from the login endpoint are protected. This documentation assumes that you have already decoded the certificates provided to you by DMVIC.

### Initialization

Before making any requests, you need to initialize the library with your credentials and configuration. Use the `initialize()` function to set up the library:


```javascript
import dmvic from 'dmvic';

async function initializeDmvic() {
  await dmvic.initialize({
    secrets: {
      username: "your_dmvic_username",
      password: "your_dmvic_password",
      clientId: "your_dmvic_client_id",
      environment: "staging",
      redis: {
        url: 'redis://localhost:6379',
      }
    },
    certificates: {
      sslCert: "./path/to/your/dmvic/cert.pem",
      sslKey: "./path/to/your/dmvic/key.pem",
    },
  });
}

main();
```

Calling the initialize() function stores the configurations in your service environment variables. The configs will be used by the library to make requests to DMVIC.

### Authentication
To authenticate your requests to DMVIC, use the `authenticate()` function. This function takes no parameters. You only need to call it once throughout your project. You can call the function immediately after initialization. When this function is called, it sends an authentication request to DMVIC and stores the resulting token on redis using the redis credentials provided in the init function.

```javascript
import dmvic from 'dmvic';

async function authenticateAndRequest() {
  await dmvic.authenticate();

  // logic to handle your business process
}
authenticateAndRequest();
```

Once authenticated, the package with handle token management by storing it on redis and using it to make subsequent requests to DMVIC.

## License

This library is licensed under the [GNU](https://www.gnu.org/licenses/lgpl-3.0.md/) License.

## Features

- Initialization
- Authentication

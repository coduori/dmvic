
### Get Certificate PDF document

This function will retrieve a certificate PDF document given a certificate number. Certificate PDFs are printed and stuck on a motor vehicle's windscreen or other easily visible location on the motor vehicle.
This document will contain the details of the insurance cover for the motor vehicle.

For a successful request, the API responds with a URL containing the link to a downloadable PDF file.
Opening the link on a browser automatically downloads the certificate PDF document.

#### Example

```javascript
import { getCertificatePdf } from "dmvic";

import { initializeDMVIC } from "./initialize.mjs";
import { getDMVICAuthToken } from "./authenticate.mjs";

const downloadCertificatePdf = async (insuranceCertificateNumber) => {
    await initializeDMVIC();
    const authToken = await getDMVICAuthToken();
    const result = await getCertificatePdf(authToken, insuranceCertificateNumber);
    return result;
}
```

```
{
    "URL": "https://insurancedevelopment.blob.core.windows.net/immutable-cancelled-cert/49935_0137372C3723135FD26E3A643C99C5F54FF811A8.pdf?sv=2021-08-06&st=2025-05-20T05%3A53%3A32Z&se=2025-05-20T18%3A53%3A32Z&sr=b&sp=r&sig=WnfcVyCLMLPcggpTimvDQEILUt%2FZYPm4XhzsOde5VDk%3D"
}
```
[Back to home page](../README.md)

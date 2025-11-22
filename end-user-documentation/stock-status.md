### Check Insurance Company Stock Status

Before requesting for a motor vehicle insurance certificate as an intermediary, the target insurance company
should have allocated stock to your DMVIC account. This feature enables checking the stock count that has been provided by the insurance company. When the stock is 0, you cannot succesfully request for a motor vehicle certificate and thus you need to request for stock replenishment from the insurance company.

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
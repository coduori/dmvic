import redis from 'redis';
import { getSecret } from '../secretsManager.mjs';

let redisClient;

function getRedisClient() {
    if (!redisClient) {
        const redisConfig = JSON.parse(getSecret('redis'));
        redisClient = redis.createClient(redisConfig);
    }
    return redisClient;
}

async function connectToCache() {
    try {
        const client = getRedisClient();
        await client.connect();
    } catch (error) {
        throw new Error(`Error connecting to cache db: ${error.code}`);
    }
}

async function setCacheKey(key, value, options = {}) {
    try {
        const client = getRedisClient();
        await client.set(key, value, options);
    } catch (error) {
        throw new Error(`Error setting key ${key} in cache db: ${error.message}`);
    }
}

async function getCacheKey(key) {
    try {
        const client = getRedisClient();
        const value = await client.get(key);
        return value === null ? null : value;
    } catch (error) {
        throw new Error(`Error getting key ${key} from cache db: ${error.message}`);
    }
}

async function disconnectFromCache() {
    try {
        const client = getRedisClient();
        await client.quit(); // use `quit()` instead of `close()` for redis
    } catch (error) {
        throw new Error(`Error disconnecting from cache db: ${error.message}`);
    }
}

export {
    connectToCache,
    setCacheKey,
    getCacheKey,
    disconnectFromCache,
};

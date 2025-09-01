import { inMemoryCache } from '../../lib/utils/cache.mjs';

describe('inMemoryCache', () => {
    beforeEach(() => {
        inMemoryCache.clear();
    });

    it('should be an object with get, set, and has methods', () => {
        expect(typeof inMemoryCache).toBe('object');
        expect(typeof inMemoryCache.get).toBe('function');
        expect(typeof inMemoryCache.set).toBe('function');
        expect(typeof inMemoryCache.has).toBe('function');
    });

    describe('set()', () => {
        it('should correctly set a key-value pair in the cache', () => {
            const testKey = 'username';
            const testValue = 'testuser1';

            inMemoryCache.set(testKey, testValue);

            expect(inMemoryCache.has(testKey)).toBe(true);
            expect(inMemoryCache.get(testKey)).toBe(testValue);
        });

        it('should overwrite a value if the key already exists', () => {
            const testKey = 'username';

            inMemoryCache.set(testKey, 'old_value');
            inMemoryCache.set(testKey, 'new_value');

            expect(inMemoryCache.get(testKey)).toBe('new_value');
        });
    });

    describe('get()', () => {
        it('should return the correct value for an existing key', () => {
            inMemoryCache.set('password', 'secret123');
            expect(inMemoryCache.get('password')).toBe('secret123');
        });

        it('should return undefined for a non-existent key', () => {
            expect(inMemoryCache.get('nonexistent_key')).toBeUndefined();
        });
    });

    describe('has()', () => {
        it('should return true if a key exists in the cache', () => {
            inMemoryCache.set('clientid', '123-abc');
            expect(inMemoryCache.has('clientid')).toBe(true);
        });

        it('should return false if a key does not exist in the cache', () => {
            expect(inMemoryCache.has('missing_key')).toBe(false);
        });
    });
});

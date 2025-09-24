import crypto from 'crypto';

function cryptoPickOne(arr) {
    if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error('cryptoPickone: Non-empty array required');
    }
    const idx = crypto.randomInt(arr.length);
    return arr[idx];
}

export { cryptoPickOne };

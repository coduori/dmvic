import crypto from 'crypto';

export const generateTestCredentials = (seed = 'dmvic-test') => {
    const generateValue = (prefix) => {
        const hash = crypto
            .createHash('sha256')
            .update(`${prefix}-${seed}`)
            .digest('hex')
            .substring(0, 8);
        return `generated_${prefix}_${hash}`;
    };

    return {
        username: generateValue('username'),
        password: generateValue('password'),
        clientid: generateValue('clientid'),
        environment: 'sandbox',
        includeoptionaldata: false,
    };
};

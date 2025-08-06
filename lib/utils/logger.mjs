function logger(...args) {
    const output = args.map((arg) => {
        if (typeof arg === 'object' && arg !== null) {
            try {
                return JSON.stringify(arg);
            } catch {
                return '[Unserializable Object]';
            }
        }
        return String(arg);
    }).join(' ');

    const time = new Date().toISOString();
    if (typeof process === 'undefined' || !process.stdout || typeof process.stdout.write !== 'function') {
        throw new Error('This library requires Node.js with process.stdout.write support.');
    }

    process.stdout.write(`[${time}] ${output}\n`);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    logger,
};

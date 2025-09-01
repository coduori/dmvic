const inMemoryCache = (() => {
    const configs = {};
    return {
        get: (key) => configs[key],
        set: (key, value) => {
            configs[key] = value;
        },
        has: (key) => key in configs,
        clear: () => {
            for (const key of Object.keys(configs)) delete configs[key];
        },
    };
})();

export { inMemoryCache };

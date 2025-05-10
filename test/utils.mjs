const cleanUpEnv = (keys) => {
    keys.forEach((key) => {
        delete process.env[key];
    });
};

const mockSetConfigurationProperty = (prop, key, value = null) => {
    if (prop === 'certificate') {
        process.env[`DMVIC_${key}`] = `/path/to/test/${key}`;
    } else {
        process.env[`DMVIC_${key}`] = value;
    }
};

export {
    cleanUpEnv,
    mockSetConfigurationProperty,
};

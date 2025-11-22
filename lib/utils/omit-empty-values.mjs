const omitEmptyValues = (obj) => {
    if (obj == null || typeof obj !== 'object' || Array.isArray(obj)) {
        throw new Error('omitEmptyValues expects a non-array object');
    }
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => Boolean(v)));
};

export { omitEmptyValues };

const omitEmptyValues = (obj) => {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => Boolean(v)));
};

export { omitEmptyValues };

function isRequiredField(rules, payload) {
    if (typeof rules?.conditionalRequired === 'function') {
        return rules.conditionalRequired(payload);
    }
    return !!rules?.required;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    isRequiredField,
};

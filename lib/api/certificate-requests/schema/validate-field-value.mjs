import { validateDateFormat } from './validate-date-format.mjs';
import { validateEnum } from './validate-enum.mjs';
import { validateNumberRange } from './validate-number-range.mjs';
import { validateStringLength } from './validate-string-length.mjs';

function validateFieldValues(key, value, rules) {
    const errors = [];

    if (rules.oneOf) {
        const enumError = validateEnum(key, value, rules.oneOf);
        if (enumError) errors.push(enumError);
    }

    if (rules.type === 'number') {
        errors.push(...validateNumberRange(key, value, rules));
    }

    if (rules.type === 'string') {
        errors.push(...validateStringLength(key, value, rules));
    }

    if (rules.format === 'date') {
        const dateError = validateDateFormat(key, value);
        if (dateError) errors.push(dateError);
    }

    return errors;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    validateFieldValues,
};

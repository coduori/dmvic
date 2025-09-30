import Chance from 'chance';

import { MOTOR_CLASS_OPTIONS, VALUATION_COVER_TYPES_OPTION } from '../../lib/utils/constants.mjs';
import { getBaseRequestPayload } from './base-payload.mjs';

const chance = new Chance();

const basePayload = getBaseRequestPayload({ motorClass: MOTOR_CLASS_OPTIONS.CLASS_C });

const getClassCCertificateRequestPayload = (overrides = {}) => {
    const coverType = overrides.coverType || basePayload.coverType;
    if (Object.keys(VALUATION_COVER_TYPES_OPTION).includes(coverType)) {
        overrides.vehicleValue = chance.integer({ min: 100000, max: 10000000 });
    } else {
        delete overrides.vehicleValue;
    }

    return {
        ...basePayload,
        ...overrides,
    };
};

export { getClassCCertificateRequestPayload };

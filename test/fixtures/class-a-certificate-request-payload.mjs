import Chance from 'chance';
import {
    CLASS_A_CERTIFICATE_TYPE_OPTIONS,
    VALUATION_COVER_TYPES_OPTION,
    MOTOR_CLASS_OPTIONS,
} from '../../lib/utils/constants.mjs';
import { getBaseRequestPayload } from './base-payload.mjs';
import { cryptoPickOne } from '../random-pick.mjs';

const chance = new Chance();

const basePayload = getBaseRequestPayload({ motorClass: MOTOR_CLASS_OPTIONS.CLASS_A });

const getClassACertificateRequestPayload = (overrides = {}) => {
    const {
        certificateType = cryptoPickOne(Object.keys(CLASS_A_CERTIFICATE_TYPE_OPTIONS)),
        passengerCount = chance.integer({ min: 1, max: 200 }),
    } = overrides;
    const coverType = overrides.coverType || basePayload.coverType;
    if (Object.keys(VALUATION_COVER_TYPES_OPTION).includes(coverType)) {
        overrides.vehicleValue = chance.integer({ min: 100000, max: 10000000 });
    } else {
        delete overrides.vehicleValue;
    }

    return {
        ...basePayload,
        ...overrides,
        certificateType,
        passengerCount,
    };
};

export { getClassACertificateRequestPayload };

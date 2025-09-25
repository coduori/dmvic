import Chance from 'chance';
import {
    VALUATION_COVER_TYPES_OPTION,
    MOTOR_CLASS_OPTIONS,
    VEHICLE_TYPE_OPTIONS,
} from '../../lib/utils/constants.mjs';
import { getBaseRequestPayload } from './base-payload.mjs';
import { cryptoPickOne } from '../random-pick.mjs';

const chance = new Chance();

const basePayload = getBaseRequestPayload({ motorClass: MOTOR_CLASS_OPTIONS.CLASS_B });

const getClassBCertificateRequestPayload = (overrides = {}) => {
    const {
        passengerCount = chance.integer({ min: 1, max: 200 }),
        vehicleTonnage = chance.integer({ min: 1, max: 31 }),
        vehicleType = cryptoPickOne(Object.keys(VEHICLE_TYPE_OPTIONS)),
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
        passengerCount,
        vehicleTonnage,
        vehicleType,
    };
};

export { getClassBCertificateRequestPayload };

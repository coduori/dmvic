import Chance from 'chance';
import {
    VALUATION_COVER_TYPES_OPTION,
    MOTOR_CLASS_OPTIONS,
    CLASS_D_CERTIFICATE_TYPE_OPTIONS_COMMERCIAL,
    CLASS_D_CERTIFICATE_TYPE_OPTIONS_WITH_PASSENGERS,
    CERTIFICATE_TYPE_OPTIONS,
} from '../../lib/utils/constants.mjs';
import { getBaseRequestPayload } from './base-payload.mjs';

const chance = new Chance();

const basePayload = getBaseRequestPayload({ motorClass: MOTOR_CLASS_OPTIONS.CLASS_D });

const getClassDCertificateRequestPayload = (overrides = {}) => {
    if (!('certificateType' in overrides)) {
        overrides.certificateType = chance.pickone(Object.keys(CERTIFICATE_TYPE_OPTIONS));
    }

    const coverType = overrides.coverType || basePayload.coverType;
    if (Object.keys(VALUATION_COVER_TYPES_OPTION).includes(coverType)) {
        overrides.vehicleValue = chance.integer({ min: 100000, max: 10000000 });
    } else {
        delete overrides.vehicleValue;
    }

    const selectedCertificateType = overrides.certificateType;
    if (
        Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS_WITH_PASSENGERS).includes(
            selectedCertificateType
        )
    ) {
        overrides.passengerCount = chance.integer({ min: 1, max: 200 });
    } else {
        delete overrides.passengerCount;
    }

    if (
        Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS_COMMERCIAL).includes(selectedCertificateType)
    ) {
        overrides.vehicleTonnage = chance.integer({ min: 1, max: 31 });
    } else {
        delete overrides.vehicleTonnage;
    }

    return {
        ...basePayload,
        ...overrides,
    };
};

export { getClassDCertificateRequestPayload };

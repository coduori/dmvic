import { MOTOR_CLASS_OPTIONS } from '../../lib/utils/constants.mjs';
import { cryptoPickOne } from '../random-pick.mjs';
import { getClassACertificateRequestPayload } from './class-a-certificate-request-payload.mjs';
import { getClassBCertificateRequestPayload } from './class-b-certificate-request-payload.mjs';
import { getClassCCertificateRequestPayload } from './class-c-certificate-request-payload.mjs';
import { getClassDCertificateRequestPayload } from './class-d-certificate-request-payload.mjs';

const PAYLOAD_GENERATORS = {
    A: getClassACertificateRequestPayload,
    B: getClassBCertificateRequestPayload,
    C: getClassCCertificateRequestPayload,
    D: getClassDCertificateRequestPayload,
};

const getCertificateRequestPayload = (overrides = {}) => {
    const motorClass = overrides.motorClass || cryptoPickOne(Object.values(MOTOR_CLASS_OPTIONS));
    const payloadGenerator = PAYLOAD_GENERATORS[motorClass];
    const generatedPayload = payloadGenerator({ ...overrides, motorClass });
    return {
        ...generatedPayload,
        ...overrides,
    };
};

export { getCertificateRequestPayload };

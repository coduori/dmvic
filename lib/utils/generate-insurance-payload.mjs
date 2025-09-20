import {
    COVER_TYPE_OPTIONS,
    INSURERS,
    CERTIFICATE_TYPE_OPTIONS,
    VEHICLE_TYPE_OPTIONS,
} from './constants.mjs';
import { getSecret } from './secrets-handler.mjs';
import { standardizeDateFormat } from './standard-date-format.mjs';

const removeNullishValues = (obj) => {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
};

function optionalData(payload) {
    return {
        HudumaNumber: payload.policyHolderHudumaNumber,
        Yearofmanufacture: payload.vehicleYearOfManufacture,
        InsuredPIN: payload.policyHolderKRAPIN,
        Vehiclemake: payload.vehicleMake,
        Vehiclemodel: payload.vehicleModel,
        Bodytype: payload.vehicleBodyType,
    };
}

const generateIssuancePayload = (payload) => {
    const cleanedPayload = removeNullishValues({
        Membercompanyid: INSURERS[payload.insurer],
        Typeofcover: COVER_TYPE_OPTIONS[payload.coverType],
        Policyholder: payload.policyHolderFullName,
        policynumber: payload.policyNumber,
        Commencingdate: standardizeDateFormat(payload.commencingDate),
        Expiringdate: standardizeDateFormat(payload.expiringDate),
        Email: payload.recipientEmail,
        Chassisnumber: payload.vehicleChassisNumber,
        Phonenumber: payload.recipientPhoneNumber,
        Registrationnumber: payload.vehicleRegistrationNumber,
        SumInsured: payload.vehicleValue,
        VehicleType: VEHICLE_TYPE_OPTIONS[payload.vehicleType],
        TypeOfCertificate: CERTIFICATE_TYPE_OPTIONS[payload.certificateType],
        Tonnage: payload.vehicleTonnage,
    });
    if (getSecret('includeoptionaldata')) {
        Object.assign(cleanedPayload, optionalData(payload));
    }
    return cleanedPayload;
};

export { generateIssuancePayload };

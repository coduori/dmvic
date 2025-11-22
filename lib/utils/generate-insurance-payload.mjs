import {
    CERTIFICATE_TYPE_OPTIONS,
    COVER_TYPE_OPTIONS,
    INSURERS,
    VEHICLE_TYPE_OPTIONS,
} from './constants.mjs';
import { getSecret } from './secrets-handler.mjs';
import { standardizeDateFormat } from './standard-date-format.mjs';

function optionalData(payload) {
    return {
        HudumaNumber: payload.policyHolderHudumaNumber,
        Yearofmanufacture: payload.vehicleYearOfManufacture,
        InsuredPIN: payload.policyHolderKRAPIN,
        Vehiclemake: payload.vehicleMake,
        Vehiclemodel: payload.vehicleModel,
    };
}

const generateInsurancePayload = (payload) => {
    const cleanedPayload = {
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
        Enginenumber: payload.vehicleEngineNumber,
        SumInsured: payload.vehicleValue,
        VehicleType: VEHICLE_TYPE_OPTIONS[payload.vehicleType],
        TypeOfCertificate: CERTIFICATE_TYPE_OPTIONS[payload.certificateType],
        Tonnage: payload.vehicleTonnage,
        Licensedtocarry: payload.passengerCount,
        Bodytype: payload.vehicleBodyType,
    };
    if (getSecret('includeoptionaldata')) {
        Object.assign(cleanedPayload, optionalData(payload));
    }
    return cleanedPayload;
};

export { generateInsurancePayload };

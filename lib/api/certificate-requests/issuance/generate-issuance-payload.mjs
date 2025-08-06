function addClassSpecificData(vehicleClass, certificateRequestPayload) {
    if (vehicleClass === 'A') {
    // if its a comprehensive ensure sum insured is present otherwise its optional
        return {
            TypeOfCertificate: certificateRequestPayload.certificateType,
            Registrationnumber: certificateRequestPayload.vehicleRegistrationNumber,
            Licensedtocarry: certificateRequestPayload.passengerCount,
            Enginenumber: certificateRequestPayload.vehicleEngineNumber,
            SumInsured: certificateRequestPayload.vehicleValue,
        };
    }
    return {};
}

function addOptionalData(certificateRequestPayload) {
    return {
        HudumaNumber: certificateRequestPayload.policyHolderHudumaNumber,
        Yearofmanufacture: certificateRequestPayload.vehicleYearOfManufacture,
        InsuredPIN: certificateRequestPayload.policyHolderKRAPIN,
        Vehiclemake: certificateRequestPayload.vehicleMake,
        Vehiclemodel: certificateRequestPayload.vehicleModel,
        Bodytype: certificateRequestPayload.vehicleBodyType,
    };
}

function generateIssuancePayload(vehicleClass, certificateRequestPayload) {
    const payload = {
        Membercompanyid: certificateRequestPayload.insurerId,
        Typeofcover: certificateRequestPayload.coverType,
        Policyholder: certificateRequestPayload.policyHolderFullName,
        policynumber: certificateRequestPayload.policyNumber,
        Commencingdate: certificateRequestPayload.commencingDate,
        Expiringdate: certificateRequestPayload.expiringDate,
        Chassisnumber: certificateRequestPayload.vehicleChassisNumber,
        Phonenumber: certificateRequestPayload.recipientPhoneNumber,
        Email: certificateRequestPayload.recipientEmail,
    };

    return {
        ...payload,
        ...addClassSpecificData(vehicleClass, certificateRequestPayload),
        // specific items here should be determined from the configs @ initialization
        ...addOptionalData(certificateRequestPayload),
    };
}

export {
    // eslint-disable-next-line import/prefer-default-export
    generateIssuancePayload,
};

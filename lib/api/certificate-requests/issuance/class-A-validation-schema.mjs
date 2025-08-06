const currentYear = new Date().getFullYear();

const classACertificateIssuanceSchema = {
    insurerId: {
        type: 'number',
        required: true,
        min: 10,
        max: 99,
    },
    certificateType: {
        type: 'number',
        required: true,
        oneOf: [1, 8],
    },
    coverType: {
        type: 'string',
        required: true,
        oneOf: ['COMP', 'TPO', 'TPTF'],
    },
    policyHolderFullName: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 50,
    },
    policyNumber: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 50,
    },
    commencingDate: {
        type: 'string',
        required: true,
        format: 'date', // or custom validator if supported
        customValidator: (value) => {
            const today = new Date();
            const date = new Date(value);
            return date <= today;
        },
    },
    expiringDate: {
        type: 'string',
        required: true,
        format: 'date',
        customValidator: (value, payload) => {
            const start = new Date(payload.commencingDate);
            const end = new Date(value);
            const maxEnd = new Date(start);
            maxEnd.setFullYear(maxEnd.getFullYear() + 1);
            return end > start && end <= maxEnd;
        },
    },
    passengerCount: {
        type: 'number',
        required: true,
        min: 1,
        max: 200,
    },
    recipientEmail: { type: 'string', required: true },

    vehicleYearOfManufacture: {
        type: 'number',
        required: false,
        min: 1950,
        max: currentYear,
    },
    vehicleRegistrationNumber: {
        type: 'string',
        required: false,
        minLength: 4,
        maxLength: 15,
        conditionalRequired: (payload) => !payload.chassisNumber && !payload.engineNumber,
    },
    vehicleMake: { type: 'string', required: false },
    vehicleModel: { type: 'string', required: false },
    vehicleEngineNumber: { type: 'string', required: false },
    vehicleValue: { type: 'number', required: false },
    vehicleChassisNumber: {
        type: 'string',
        required: false,
        minLength: 4,
        maxLength: 20,
    },
    recipientPhoneNumber: {
        type: 'string',
        required: false,
        minLength: 9,
        maxLength: 9,
    },
    vehicleBodyType: { type: 'string', required: false, maxLength: 50 },
    policyHolderKRAPIN: {
        type: 'string',
        required: false,
        customValidator: (value) => /^A\d{9}[A-Z]$/.test(value),
        errorMessage: 'Invalid KRA PIN format. Expected format: A123456789B',
    },
    policyHolderHudumaNumber: { type: 'string', required: false },
};

export {
    // eslint-disable-next-line import/prefer-default-export
    classACertificateIssuanceSchema,
};

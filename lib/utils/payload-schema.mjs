import { object, string, number, date } from 'yup';

import { INSURERS } from './constants.mjs';
import { getDateToday, getAnnualExpiry } from './standard-date-format.mjs';

const passengerCountRules = {
    A: true,
    B: true,
    D: ['PRIVATE_MOTOR_CYCLE', 'PSV_MOTOR_CYCLE'],
};

const certificateIssuanceSchema = object({
    insurer: string().required().oneOf(Object.keys(INSURERS)),
    certificateType: string()
        .oneOf([
            'PSV_UNMARKED',
            'PRIVATE_MOTOR_CYCLE',
            'TAXI',
            'PSV_MOTOR_CYCLE',
            'COMMERCIAL_MOTOR_CYCLE',
        ])
        .when('motorClass', {
            is: (motorClass) => motorClass === 'A',
            then: (certificateTypeSchema) =>
                certificateTypeSchema.required().oneOf(['PSV_UNMARKED', 'TAXI']),
            otherwise: (certificateTypeSchema) =>
                certificateTypeSchema.when('motorClass', {
                    is: (motorClass) => motorClass === 'D',
                    then: (certificateTypeSchema) =>
                        certificateTypeSchema
                            .required()
                            .oneOf([
                                'PRIVATE_MOTOR_CYCLE',
                                'PSV_MOTOR_CYCLE',
                                'COMMERCIAL_MOTOR_CYCLE',
                            ]),
                    otherwise: (certificateTypeSchema) => certificateTypeSchema.notRequired(),
                }),
        }),
    coverType: string().oneOf([
        'PSV_UNMARKED',
        'PRIVATE_MOTOR_CYCLE',
        'TAXI',
        'PSV_MOTOR_CYCLE',
        'COMMERCIAL_MOTOR_CYCLE',
    ]),
    policyHolderFullName: string().required().trim().min(1).max(50),
    policyNumber: string().required().trim().min(1).max(50),
    commencingDate: date().required().min(getDateToday(), 'commencingDate cannot be in the past!'),
    expiringDate: date()
        .required('expiringDate is required')
        .test(
            'is-after-commencing',
            'expiringDate must be strictly after commencingDate!',
            function (value) {
                return value > this.parent.commencingDate;
            }
        )
        .max(getAnnualExpiry(), 'expiringDate must be within one year from today!'),
    passengerCount: number().when(['motorClass', 'certificateType'], {
        is: (motorClass, certificateType) => {
            const rule = passengerCountRules[motorClass];
            if (rule === true) return true;
            if (Array.isArray(rule)) return rule.includes(certificateType);
            return false;
        },
        then: (schema) => schema.required().min(1).max(200),
        otherwise: (schema) => schema.notRequired(),
    }),
    recipientEmail: string()
        .email('recipientEmail must be a valid email address')
        .required()
        .trim()
        .min(1)
        .max(100),
    vehicleYearOfManufacture: number()
        .min(1900, 'vehicleYearOfManufacture must be 1900 or later')
        .max(new Date().getFullYear(), 'vehicleYearOfManufacture cannot be in the future'),
    vehicleRegistrationNumber: string().trim().min(4).max(15),
    vehicleEngineNumber: string().trim().min(4).max(15),
    vehicleChassisNumber: string().trim().min(4).max(15).required(),
    vehicleMake: string().min(1).max(50).optional(),
    vehicleModel: string().min(1).max(50).optional(),
    vehicleValue: number().min(1).optional(),
    recipientPhoneNumber: number()
        .test(
            'is-9-digit-phone',
            'recipientPhoneNumber must be exactly 9 digits and not start with 0',
            (value) => {
                if (value === undefined || value === null) return true;
                const str = String(value);
                return /^[1-9][0-9]{8}$/.test(str);
            }
        )
        .required(),
    vehicleBodyType: string().max(50).min(1).optional(),
    policyHolderKRAPIN: string()
        .matches(/^A\d{9}[A-Z]$/, 'policyHolderKRAPIN must match format: A123456789B')
        .optional(),
    policyHolderHudumaNumber: string().optional().min(4).max(50),
    tonnage: number().when(['motorClass', 'certificateType'], {
        is: (motorClass, certificateType) => {
            if (motorClass === 'B') return true;
            if (motorClass === 'D') {
                return certificateType === 'COMMERCIAL_MOTOR_CYCLE';
            }
            return false;
        },
        then: (schema) => schema.required().min(1).max(31),
        otherwise: (schema) =>
            schema.test(
                'must-be-absent',
                'tonnage must not be provided for this motorClass/certificateType',
                (value) => value === undefined
            ),
    }),
    vehicleType: string().when('motorClass', {
        is: (motorClass) => motorClass === 'B',
        then: (schema) => schema.required(),
        otherwise: (schema) =>
            schema.test(
                'must-be-absent',
                'vehicleType must not be provided unless motorClass is B',
                (value) => value === undefined
            ),
    }),
}).test(
    'engine-or-registration-exclusive',
    'Provide either vehicleEngineNumber or vehicleRegistrationNumber, not both',
    function (obj) {
        const engine = obj.vehicleEngineNumber;
        const reg = obj.vehicleRegistrationNumber;
        const validEngine = engine && typeof engine === 'string' && engine.trim().length >= 4;
        const validReg = reg && typeof reg === 'string' && reg.trim().length >= 4;
        return validEngine ^ validReg;
    }
);

export { certificateIssuanceSchema };

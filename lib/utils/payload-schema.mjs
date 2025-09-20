import { object, string, number } from 'yup';

import {
    CLASS_A_CERTIFICATE_TYPE_OPTIONS,
    CLASS_D_CERTIFICATE_TYPE_OPTIONS,
    CLASS_D_CERTIFICATE_TYPE_OPTIONS_COMMERCIAL,
    CLASS_D_CERTIFICATE_TYPE_OPTIONS_WITH_PASSENGERS,
    COVER_TYPE_OPTIONS,
    INSURERS,
    MOTOR_CLASS_OPTIONS,
    VALUATION_COVER_TYPES_OPTION,
    VEHICLE_TYPE_OPTIONS,
} from './constants.mjs';
import { getISOAnnualExpiry } from './standard-date-format.mjs';

const passengerCountRules = {
    A: true,
    B: true,
    D: Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS_WITH_PASSENGERS),
};

const vehicleTonnageRules = {
    B: true,
    D: Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS_COMMERCIAL),
};

const checkRule = (rules, motorClass, certificateType) =>
    rules[motorClass] === true || rules[motorClass]?.includes(certificateType);

const certificateIssuanceSchema = object({
    insurer: string().required().oneOf(Object.keys(INSURERS)),
    motorClass: string().required().oneOf(Object.values(MOTOR_CLASS_OPTIONS)),
    certificateType: string().when('motorClass', {
        is: (motorClass) => motorClass === MOTOR_CLASS_OPTIONS.CLASS_A,
        then: (certificateTypeSchema) =>
            certificateTypeSchema.required().oneOf(Object.keys(CLASS_A_CERTIFICATE_TYPE_OPTIONS)),
        otherwise: (certificateTypeSchema) =>
            certificateTypeSchema.when('motorClass', {
                is: (motorClass) => motorClass === MOTOR_CLASS_OPTIONS.CLASS_D,
                then: (certificateTypeSchema) =>
                    certificateTypeSchema
                        .required()
                        .oneOf(Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS)),
                otherwise: (certificateTypeSchema) =>
                    certificateTypeSchema.test(
                        'must-be-absent',
                        'certificateType must not be provided for this motorClass',
                        (value) => value === undefined
                    ),
            }),
    }),
    coverType: string().oneOf(Object.keys(COVER_TYPE_OPTIONS)).required(),
    policyHolderFullName: string().required().trim().min(1).max(50),
    policyNumber: string().required().trim().min(1).max(50),
    commencingDate: string()
        .required()
        .test('is-valid-date', 'commencingDate must be a valid date', function (value) {
            if (!value) return false;
            const parsed = new Date(value);
            return !isNaN(parsed.getTime());
        })
        .test('is-not-in-past', 'commencingDate cannot be in the past!', function (value) {
            if (!value) return false;

            const parsed = new Date(value);
            if (isNaN(parsed.getTime())) return false;

            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const valueStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());

            return valueStart >= todayStart;
        })
        .test(
            'is-within-one-year',
            'commencingDate cannot be a year from today!',
            function (value) {
                if (!value) return false;

                const parsed = new Date(value);
                if (isNaN(parsed.getTime())) return false;

                const maxDateTz = getISOAnnualExpiry();
                const maxDate = new Date(
                    maxDateTz.getFullYear(),
                    maxDateTz.getMonth(),
                    maxDateTz.getDate()
                );
                const targetDate = new Date(
                    parsed.getFullYear(),
                    parsed.getMonth(),
                    parsed.getDate()
                );
                return maxDate >= targetDate;
            }
        ),
    expiringDate: string()
        .required('expiringDate is required')
        .test('is-valid-date', 'expiringDate must be a valid date', function (value) {
            if (!value) return false;
            const parsed = new Date(value);
            return !isNaN(parsed.getTime());
        })
        .test(
            'is-after-commencing',
            'expiringDate must be after or equal to commencingDate!',
            function (value) {
                if (!value || !this.parent.commencingDate) return false;

                const expiringParsed = new Date(value);
                const commencingParsed = new Date(this.parent.commencingDate);

                if (isNaN(expiringParsed.getTime()) || isNaN(commencingParsed.getTime()))
                    return false;

                const commencingStart = new Date(
                    commencingParsed.getFullYear(),
                    commencingParsed.getMonth(),
                    commencingParsed.getDate()
                );
                const expiringStart = new Date(
                    expiringParsed.getFullYear(),
                    expiringParsed.getMonth(),
                    expiringParsed.getDate()
                );

                return expiringStart >= commencingStart;
            }
        )
        .test(
            'is-within-one-year',
            'expiringDate must be within one year from commencingDate!',
            function (value) {
                if (!value || !this.parent.commencingDate) return false;

                const commencingParsed = new Date(this.parent.commencingDate);
                if (isNaN(commencingParsed.getTime())) return false;

                const expiringParsed = new Date(value);
                if (isNaN(expiringParsed.getTime())) return false;

                const maxDate = getISOAnnualExpiry(commencingParsed);
                return expiringParsed <= maxDate;
            }
        ),
    passengerCount: number().when(['motorClass', 'certificateType'], {
        is: (motorClass, certificateType) =>
            checkRule(passengerCountRules, motorClass, certificateType),
        then: (schema) => schema.required().min(1).max(200),
        otherwise: (schema) =>
            schema.test(
                'must-be-absent',
                'passengerCount must not be provided for this motorClass/certificateType',
                (value) => value === undefined
            ),
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
    vehicleValue: number()
        .min(1)
        .when('coverType', {
            is: (coverType) => Object.keys(VALUATION_COVER_TYPES_OPTION).includes(coverType),
            then: (schema) => schema.required(),
            otherwise: (schema) =>
                schema.test(
                    'must-be-absent',
                    'vehicleValue must not be provided for this coverType',
                    (value) => value === undefined
                ),
        }),
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
    policyHolderHudumaNumber: string().min(4).max(50).optional(),
    vehicleTonnage: number().when(['motorClass', 'certificateType'], {
        is: (motorClass, certificateType) =>
            checkRule(vehicleTonnageRules, motorClass, certificateType),
        then: (schema) => schema.required().min(1).max(31),
        otherwise: (schema) =>
            schema.test(
                'must-be-absent',
                'tonnage must not be provided for this motorClass/certificateType',
                (value) => value === undefined
            ),
    }),
    vehicleType: string().when('motorClass', {
        is: (motorClass) => motorClass === MOTOR_CLASS_OPTIONS.CLASS_B,
        then: (schema) => schema.required().oneOf(Object.keys(VEHICLE_TYPE_OPTIONS)),
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

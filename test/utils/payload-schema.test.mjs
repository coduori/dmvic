import { describe } from '@jest/globals';

import { certificateIssuanceSchema } from '../../lib/utils/payload-schema.mjs';
import { INSURERS, MOTOR_CLASS_OPTIONS } from '../../lib/utils/constants.mjs';
import { getCertificateRequestPayload } from '../fixtures/certificate-request-payload.mjs';

const nullishValues = [
    ['missing (undefined)', undefined],
    ['null', null],
    ['empty string', ''],
    ['whitespace string', ' '],
    ['zero', 0],
    ['false', false],
];

// eslint-disable-next-line max-lines-per-function
describe('Certificate Issuance Payload Schema', () => {
    it('should not throw for a valid payload', () => {
        const validPayload = getCertificateRequestPayload();
        expect(() => certificateIssuanceSchema.validateSync(validPayload)).not.toThrow();
        // remember to add all possible combinations for all classes
    });

    describe('insurer field validation', () => {
        it.each(nullishValues)(
            'should throw ValidationError for invalid values: %s',
            (description, invalidValue) => {
                const validPayload = getCertificateRequestPayload();
                const invalidPayload = { ...validPayload, insurer: invalidValue };
                expect(() => certificateIssuanceSchema.validateSync(invalidPayload)).toThrow();
            }
        );
        it.each(Object.keys(INSURERS))(
            'should accept valid insurer enum value: %s',
            (validInsurer) => {
                const validPayload = getCertificateRequestPayload({ insurer: validInsurer });
                expect(() => certificateIssuanceSchema.validateSync(validPayload)).not.toThrow();
            }
        );

        it.each([
            'invalid_insurer',
            'UNKNOWN_COMPANY',
            'aig',
            'britam insurance',
            'AIG_KENYA_LIMITED',
            '',
            123,
            null,
        ])('should reject invalid insurer value: %s', (invalidInsurer) => {
            const invalidPayload = {
                ...getCertificateRequestPayload(),
                insurer: invalidInsurer,
            };
            expect(() => certificateIssuanceSchema.validateSync(invalidPayload)).toThrow();
        });
    });

    describe('motorClass field validation', () => {
        it.each(nullishValues)(
            'should throw ValidationError for invalid values: %s',
            (description, invalidValue) => {
                const payload = getCertificateRequestPayload();
                payload.motorClass = invalidValue;
                expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            }
        );
        it.each(Object.values(MOTOR_CLASS_OPTIONS))(
            'should accept valid motorClass enum value: %s',
            (validMotorClass) => {
                const payload = getCertificateRequestPayload({ motorClass: validMotorClass });
                expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
            }
        );
    });

    describe('certificateType field validation', () => {
        const nullishValuesWithoutUndefined = nullishValues.filter(
            ([_, nullishValue]) => nullishValue !== undefined
        );
        it.each(nullishValuesWithoutUndefined)(
            'should throw ValidationError for invalid values: %s',
            (description, invalidValue) => {
                const invalidPayload = {
                    ...getCertificateRequestPayload({
                        certificateType: invalidValue,
                    }),
                };
                expect(() => certificateIssuanceSchema.validateSync(invalidPayload)).toThrow();
            }
        );
        it('should throw ValidationError for missing certificateType if it is required', () => {
            const classAPayload = getCertificateRequestPayload();
            classAPayload.certificateType = undefined;

            expect(() => certificateIssuanceSchema.validateSync(classAPayload)).toThrow();
        });
        it('should accept only valid certificateType enum values', () => {});
        it('should be allowed for class A and D only', () => {});
        it(`should reject enum values that don't belong to class A`, () => {});
        it(`should reject enum values that don't belong to class D`, () => {});
        it('should be required when motorClass is A', () => {});
        it('should be required when motorClass is D', () => {});
        it('should not be required when motorClass is B', () => {});
        it('should not be required when motorClass is C', () => {});
    });

    describe('coverType field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should throw ValidationError when field is missing', () => {});
        it('should accept only valid coverType enum values', () => {});
    });

    describe('policyHolderFullName field validation', () => {
        it('should throw ValidationError when field is missing', () => {});
        it('should throw ValidationError for nullish values', () => {});
        it('should reject values longer than 50 characters', () => {});
    });

    describe('policyNumber field validation', () => {
        it('should throw ValidationError when field is missing', () => {});
        it('should throw ValidationError for nullish values', () => {});
        it('should reject values longer than 50 characters', () => {});
    });

    describe('commencingDate field validation', () => {
        it('should throw ValidationError when field is missing', () => {});
        it('should throw ValidationError for nullish values', () => {});
        it('should only accept dates in valid formats', () => {});
        it('should accept popular date formats', () => {});
        it('should reject dates before current date', () => {});
        it('should reject dates more than 1 year from current date', () => {});
    });

    describe('expiringDate field validation', () => {
        it('should throw ValidationError when field is missing', () => {});
        it('should throw ValidationError for nullish values', () => {});
        it('should only accept dates in valid formats', () => {});
        it('should accept popular date formats', () => {});
        it('should reject dates before commencing date', () => {});
        it('should reject dates more than 1 year from commencing date', () => {});
    });

    describe('passengerCount field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should only accept numbers between 1 and 200', () => {});
        it('should be required for class A, B and D only', () => {});
        it('should be required for PRIVATE_MOTOR_CYCLE and PSV_MOTOR_CYCLE vehicle types for class D vehicles', () => {});
        it('should not be required when motorClass is not A, B, or D', () => {});
        it('should be forbidden for certain certificateType combinations', () => {});
    });

    describe('recipientEmail field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should throw ValidationError when field is missing', () => {});
        it('should only accept only valid email address formats', () => {});
        it('should reject emails longer than 100 characters', () => {});
    });

    describe('vehicleYearOfManufacture field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should not throw ValidationError when field is missing', () => {});
        it('should only accept years from 1900 to current year inclusive', () => {});
    });

    describe('vehicleRegistrationNumber field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should be required only when vehicleEngineNumber is not provided', () => {});
        it('should only accept values between 4 and 15 characters', () => {});
        it('should throw ValidationError when both vehicleEngineNumber and vehicleRegistrationNumber are provided', () => {});
    });

    describe('vehicleEngineNumber field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should be required only when vehicleRegistrationNumber is not provided', () => {});
        it('should only accept values between 4 and 15 characters', () => {});
        it('should throw ValidationError when both vehicleEngineNumber and vehicleRegistrationNumber are provided', () => {});
    });

    describe('vehicleChassisNumber field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should throw ValidationError when field is missing', () => {});
        it('should only accept dashes, numbers and letters only', () => {});
    });

    describe('vehicleMake field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should not throw ValidationError when field is missing', () => {});
        it('should reject strings longer than 50 characters', () => {});
    });

    describe('vehicleModel field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should not throw ValidationError when field is missing', () => {});
        it('should reject strings longer than 50 characters', () => {});
    });

    describe('vehicleValue field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should only accept numbers greater than 0', () => {});
        it('should be required only when coverType is COMP or TPTF', () => {});
    });

    describe('recipientPhoneNumber field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should throw ValidationError when field is missing', () => {});
        it('should only accept values with exactly 9 digits', () => {});
        it('should reject phone numbers starting with 0', () => {});
        it('should reject phone numbers with less than 9 digits', () => {});
        it('should reject phone numbers with more than 9 digits', () => {});
        it('should reject phone numbers with non-numeric characters', () => {});
    });

    describe('vehicleBodyType field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should not throw ValidationError when field is missing', () => {});
        it('should reject values longer than 50 characters', () => {});
    });

    describe('policyHolderKRAPIN field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should not throw ValidationError when field is missing', () => {});
        it('should conform to KRA PIN format requirements', () => {});
        it('should accept valid KRA PIN format (A123456789B)', () => {});
        it('should reject KRA PIN without leading A', () => {});
        it('should reject KRA PIN without trailing letter', () => {});
        it('should reject KRA PIN with wrong number of digits', () => {});
    });

    describe('policyHolderHudumaNumber field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should not throw ValidationError when field is missing', () => {});
        it('should only accept values between 4 and 50 characters', () => {});
    });

    describe('vehicleTonnage field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should be required for class B and D only', () => {});
        it('should be required for COMMERCIAL_MOTOR_CYCLE vehicle type when certificateType is D', () => {});
        it('should reject values less than 1', () => {});
        it('should reject values greater than 31', () => {});
        it('should accept values between 1 and 31', () => {});
        it('should be forbidden when not required for motorClass/certificateType combination', () => {});
    });

    describe('vehicleType field validation', () => {
        it('should throw ValidationError for nullish values', () => {});
        it('should accept only valid vehicleType enum values', () => {});
        it('should be allowed for class B vehicles only', () => {});
        it('should be required when motorClass is B', () => {});
        it('should be forbidden when motorClass is A, C or D', () => {});
    });

    describe('cross-field validation', () => {
        it('should require either vehicleEngineNumber or vehicleRegistrationNumber', () => {});
        it('should reject when neither vehicleEngineNumber nor vehicleRegistrationNumber provided', () => {});
        it('should reject when both are provided but one is invalid length', () => {});
    });
});

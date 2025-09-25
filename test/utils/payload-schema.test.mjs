import { describe } from '@jest/globals';
import Chance from 'chance';

import { cryptoPickOne } from '../random-pick.mjs';
import { certificateIssuanceSchema } from '../../lib/utils/payload-schema.mjs';
import {
    CERTIFICATE_TYPE_OPTIONS,
    CLASS_A_CERTIFICATE_TYPE_OPTIONS,
    CLASS_D_CERTIFICATE_TYPE_OPTIONS,
    CLASS_D_CERTIFICATE_TYPE_OPTIONS_WITH_PASSENGERS,
    COVER_TYPE_OPTIONS,
    INSURERS,
    MOTOR_CLASS_OPTIONS,
    MOTOR_CLASS_OPTIONS_WITH_CERTIFICATE_TYPE,
    MOTOR_CLASS_OPTIONS_WITH_PASSENGERS,
    VALUATION_COVER_TYPES_OPTION,
    KRA_PIN_REGEX,
    VEHICLE_TYPE_OPTIONS,
} from '../../lib/utils/constants.mjs';
import { getCertificateRequestPayload } from '../fixtures/certificate-request-payload.mjs';
import { getClassBCertificateRequestPayload } from '../fixtures/class-b-certificate-request-payload.mjs';
import { getClassCCertificateRequestPayload } from '../fixtures/class-c-certificate-request-payload.mjs';
import { getClassACertificateRequestPayload } from '../fixtures/class-a-certificate-request-payload.mjs';
import { getClassDCertificateRequestPayload } from '../fixtures/class-d-certificate-request-payload.mjs';
import { getAnnualExpiry } from '../../lib/utils/standard-date-format.mjs';

const chance = new Chance();

chance.mixin({
    nonConformingKRAPIN: () => {
        let invalidKRAPIN;
        const regex = KRA_PIN_REGEX;

        do {
            invalidKRAPIN = chance.string({
                length: 11,
                pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            });
        } while (regex.test(invalidKRAPIN));

        return invalidKRAPIN;
    },
    policyHolderKRAPIN: (options = {}) => {
        const { head = 'A', digitLength = 9 } = options;

        const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            .split('')
            .filter((letter) => letter !== 'I' && letter !== 'O');

        const last = cryptoPickOne(allLetters);

        const digits = chance.string({ length: digitLength, pool: '0123456789' });

        return `${head}${digits}${last}`;
    },
});

const nullishValues = [
    ['missing (undefined)', undefined],
    ['null', null],
    ['empty string', ''],
    ['whitespace string', ' '],
    ['zero', 0],
    ['false', false],
];

const generateAphanumericString = (stringLength) =>
    chance.string({
        length: stringLength || chance.integer({ min: 4, max: 15 }),
        pool: 'ABCDEFGH12345678',
    });

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
            const payload = getCertificateRequestPayload({
                motorClass: cryptoPickOne(Object.values(MOTOR_CLASS_OPTIONS_WITH_CERTIFICATE_TYPE)),
            });
            payload.certificateType = undefined;

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });

        it.each(Object.keys(CLASS_A_CERTIFICATE_TYPE_OPTIONS))(
            'should accept valid class A certificateType enum values: %s',
            (validCertificateType) => {
                const payload = getClassACertificateRequestPayload({
                    certificateType: validCertificateType,
                });
                expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
            }
        );

        it.each(Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS))(
            'should accept valid class D certificateType enum values: %s',
            (validCertificateType) => {
                const payload = getClassDCertificateRequestPayload({
                    certificateType: validCertificateType,
                });
                expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
            }
        );

        it('should be allowed for class A and D only', () => {
            const classBPayload = getClassBCertificateRequestPayload();
            const classCPayload = getClassCCertificateRequestPayload();
            const certificateType = cryptoPickOne(Object.keys(CERTIFICATE_TYPE_OPTIONS));

            expect(() =>
                certificateIssuanceSchema.validateSync({ ...classBPayload, certificateType })
            ).toThrow();
            expect(() =>
                certificateIssuanceSchema.validateSync({ ...classCPayload, certificateType })
            ).toThrow();
        });
        it.each(Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS))(
            `should reject enum values that don't belong to class A: %s`,
            (invalidCertificateType) => {
                const classAPayload = getClassACertificateRequestPayload();

                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...classAPayload,
                        certificateType: invalidCertificateType,
                    })
                ).toThrow();
            }
        );
        it.each(Object.keys(CLASS_A_CERTIFICATE_TYPE_OPTIONS))(
            `should reject enum values that don't belong to class D`,
            (invalidCertificateType) => {
                const classDPayload = getClassDCertificateRequestPayload();

                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...classDPayload,
                        certificateType: invalidCertificateType,
                    })
                ).toThrow();
            }
        );
        it('should be required when motorClass is A', () => {
            const classAPayload = getClassACertificateRequestPayload();
            delete classAPayload.certificateType;

            expect(() => certificateIssuanceSchema.validateSync(classAPayload)).toThrow();
        });
        it('should be required when motorClass is D', () => {
            const classDPayload = getClassDCertificateRequestPayload();
            delete classDPayload.certificateType;

            expect(() => certificateIssuanceSchema.validateSync(classDPayload)).toThrow();
        });
        it('should not be required when motorClass is B', () => {
            const classBPayload = getClassBCertificateRequestPayload();
            classBPayload.certificateType = cryptoPickOne(Object.keys(CERTIFICATE_TYPE_OPTIONS));

            expect(() => certificateIssuanceSchema.validateSync(classBPayload)).toThrow();
        });
        it('should not be required when motorClass is C', () => {
            const classCPayload = getClassCCertificateRequestPayload();
            classCPayload.certificateType = cryptoPickOne(Object.keys(CERTIFICATE_TYPE_OPTIONS));

            expect(() => certificateIssuanceSchema.validateSync(classCPayload)).toThrow();
        });
    });

    describe('coverType field validation', () => {
        it.each(nullishValues)(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();

                expect(() =>
                    certificateIssuanceSchema.validateSync({ ...payload, coverType: nullishValue })
                ).toThrow();
            }
        );
        it('should throw ValidationError when field is missing', () => {
            const payload = getCertificateRequestPayload();
            delete payload.coverType;

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it.each(Object.keys(COVER_TYPE_OPTIONS))(
            'should accept valid coverType enum values: %s',
            (coverType) => {
                const payload = getCertificateRequestPayload({ coverType });

                expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
            }
        );
        it.each(['comp', 'tpo', 'tptf', 'test', 12, new Date(), {}, []])(
            'should reject invalid enum values: %s',
            (invalidValue) => {
                const payload = getCertificateRequestPayload();
                payload.coverType = invalidValue;

                expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            }
        );
    });

    describe('policyHolderFullName field validation', () => {
        it('should throw ValidationError when field is missing', () => {});
        it.each(nullishValues)(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();
                payload.policyHolderFullName = nullishValue;

                expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            }
        );
        it('should reject values longer than 50 characters', () => {
            const payload = getCertificateRequestPayload();
            const stringLength = chance.integer({ min: 51, max: 1000 });

            payload.policyHolderFullName = chance.string({ length: stringLength });
            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
    });

    describe('policyNumber field validation', () => {
        it('should throw ValidationError when field is missing', () => {
            const payload = getCertificateRequestPayload();
            delete payload.policyNumber;

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it.each(nullishValues)(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();
                payload.policyNumber = nullishValue;

                expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            }
        );
        it('should reject values longer than 50 characters', () => {
            const stringLength = chance.integer({ min: 51, max: 1000 });
            const payload = getCertificateRequestPayload();
            payload.policyNumber = chance.string({ length: stringLength });

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
    });

    describe('commencingDate field validation', () => {
        it('should throw ValidationError when field is missing', () => {
            const payload = getCertificateRequestPayload();
            delete payload.commencingDate;

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it.each(nullishValues)(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();
                payload.commencingDate = nullishValue;

                expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            }
        );
        it('should accept ISO 8601 date format', () => {
            const payload = getCertificateRequestPayload();
            payload.commencingDate = new Date(payload.commencingDate).toISOString();
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });

        it('should accept RFC 1123 date format', () => {
            const payload = getCertificateRequestPayload();
            payload.commencingDate = new Date(payload.commencingDate).toUTCString();
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });

        it('should reject Unix Timestamp date format', () => {
            const payload = getCertificateRequestPayload();
            payload.commencingDate = new Date(payload.commencingDate).getTime();

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            expect(() =>
                certificateIssuanceSchema.validateSync({
                    ...payload,
                    commencingDate: new Date(payload.commencingDate).getTime().toString(),
                })
            ).toThrow();
        });

        it('should reject dates before current date', () => {
            const payload = getCertificateRequestPayload();
            const daysToSubtract = chance.integer({ min: 1 });
            const newCommencingDate = new Date();
            payload.commencingDate = newCommencingDate.setDate(
                newCommencingDate.getDate() - daysToSubtract
            );

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it('should reject dates more than 1 year from current date', () => {
            const currentDate = new Date();
            const daysToAdd = chance.integer({ min: 366, max: 1000 });
            const oneYearAfter = new Date(currentDate);
            const oneYearAfterCurrentDate = new Date(
                oneYearAfter.setDate(oneYearAfter.getDate() + daysToAdd)
            );

            const payload = getCertificateRequestPayload();
            payload.commencingDate = oneYearAfterCurrentDate;
            payload.expiringDate = getAnnualExpiry(oneYearAfterCurrentDate);

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
    });

    describe('expiringDate field validation', () => {
        it('should throw ValidationError when field is missing', () => {
            const payload = getCertificateRequestPayload();
            delete payload.expiringDate;

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it.each(nullishValues)(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();
                payload.expiringDate = nullishValue;

                expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            }
        );
        it('should accept ISO 8601 date format', () => {
            const payload = getCertificateRequestPayload();
            payload.expiringDate = new Date(payload.expiringDate).toISOString();
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });

        it('should accept RFC 1123 date format', () => {
            const payload = getCertificateRequestPayload();
            payload.expiringDate = new Date(payload.expiringDate).toUTCString();
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });

        it('should reject Unix Timestamp date format', () => {
            const payload = getCertificateRequestPayload();
            payload.expiringDate = new Date(payload.expiringDate).getTime();

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            expect(() =>
                certificateIssuanceSchema.validateSync({
                    ...payload,
                    expiringDate: new Date(payload.expiringDate).getTime().toString(),
                })
            ).toThrow();
        });
        it('should reject dates before commencing date', () => {
            const payload = getCertificateRequestPayload();
            const currentCommencingDate = new Date(payload.commencingDate);
            const daysToSubtract = chance.integer({ min: 1 });
            payload.expiringDate = currentCommencingDate.setDate(
                currentCommencingDate.getDate() - daysToSubtract
            );

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it('should reject dates more than 1 year from commencing date', () => {
            const payload = getCertificateRequestPayload();

            const currentCommencingDate = new Date(payload.commencingDate);
            const daysToAdd = chance.integer({ min: 366, max: 1000 });
            const oneYearAfter = new Date(currentCommencingDate);
            const oneYearAfterCommencingDate = new Date(
                oneYearAfter.setDate(oneYearAfter.getDate() + daysToAdd)
            );

            payload.commencingDate = oneYearAfterCommencingDate;
            payload.expiringDate = getAnnualExpiry(oneYearAfterCommencingDate);

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
    });

    describe('passengerCount field validation', () => {
        it.each(nullishValues)(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload({
                    motorClass: cryptoPickOne(MOTOR_CLASS_OPTIONS_WITH_PASSENGERS),
                });

                if (payload.motorClass === MOTOR_CLASS_OPTIONS.CLASS_D) {
                    payload.certificateType = cryptoPickOne(
                        Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS_WITH_PASSENGERS)
                    );
                }

                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...payload,
                        passengerCount: nullishValue,
                    })
                ).toThrow();
            }
        );
        it('should only accept numbers between 1 and 200', () => {
            const pick = chance.bool();
            const passengerCount = pick
                ? chance.integer({ min: -1000, max: 0 })
                : chance.integer({ min: 201, max: 1000 });
            const payload = getCertificateRequestPayload({
                motorClass: cryptoPickOne(MOTOR_CLASS_OPTIONS_WITH_PASSENGERS),
            });
            if (payload.motorClass === MOTOR_CLASS_OPTIONS.CLASS_D) {
                payload.certificateType = cryptoPickOne(
                    Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS_WITH_PASSENGERS)
                );
            }
            expect(() =>
                certificateIssuanceSchema.validateSync({ ...payload, passengerCount })
            ).toThrow();
        });
        it.each(MOTOR_CLASS_OPTIONS_WITH_PASSENGERS)(
            'should be required for class %s',
            (motorClassOption) => {
                const payload = getCertificateRequestPayload({ motorClass: motorClassOption });
                if (payload.motorClass === MOTOR_CLASS_OPTIONS.CLASS_D) {
                    payload.certificateType = cryptoPickOne(
                        Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS_WITH_PASSENGERS)
                    );
                }

                expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow(
                    `${motorClassOption}:::${payload.certificateType}`
                );

                delete payload.passengerCount;
                expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            }
        );
        it.each(Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS_WITH_PASSENGERS))(
            'should be required for %s certificate types for class D vehicles',
            (certificateType) => {
                const payload = getCertificateRequestPayload({
                    motorClass: MOTOR_CLASS_OPTIONS.CLASS_D,
                    certificateType,
                });
                expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();

                delete payload.certificateType;
                expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            }
        );
        it('should reject passengerCount for class C vehicles', () => {
            const payload = getCertificateRequestPayload({
                motorClass: MOTOR_CLASS_OPTIONS.CLASS_C,
            });
            payload.passengerCount = chance.integer({ min: 1, max: 200 });

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });

        it.each(
            Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS).filter(
                (certificateType) =>
                    !Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS_WITH_PASSENGERS).includes(
                        certificateType
                    )
            )
        )(
            'should reject passengerCount for class D vehicles with %s certificateType',
            (certificateType) => {
                const payload = getCertificateRequestPayload({
                    motorClass: MOTOR_CLASS_OPTIONS.CLASS_D,
                    certificateType,
                });
                payload.passengerCount = chance.integer({ min: 1, max: 200 });

                expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            }
        );
    });

    describe('recipientEmail field validation', () => {
        it.each(nullishValues)(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();

                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...payload,
                        recipientEmail: nullishValue,
                    })
                ).toThrow();
            }
        );
        it('should throw ValidationError when field is missing', () => {
            const payload = getCertificateRequestPayload();
            delete payload.recipientEmail;

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it.each([
            ['simple email', 'simple@example.com'],
            ['dot in username', 'john.doe@example.com'],
            ['subdomain in domain', 'user@sub.example.com'],
            ['multi-level domain', 'user123@example.co.uk'],
            ['numbers in username', 'user123@example.org'],
            ['numbers in domain', 'user@domain123.com'],
            ['underscore in username', 'first_last@example.io'],
            ['dash in username', 'user-name@example.com'],
            ['single character username', 'u@example.com'],
            ['mixed case letters', 'MixedCaseUser@Example.COM'],
            ['long tld', 'username@example.travel'],
            ['longer tld', 'user@example.museum'],
            ['username with multiple parts', 'user.name.test@example.net'],
            ['valid short domain', 'me@x.co'],
            ['valid 2-letter tld', 'user@example.de'],
        ])('should accept valid email address formats: %s', (description, validEmailFormat) => {
            const payload = getCertificateRequestPayload();
            payload.recipientEmail = validEmailFormat;

            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });
        it.each([
            ['Domains with invalid chars', 'user@exa%mple.com'],
            ['underscore not allowed in domain', 'user@exam_ple.com'],
            ['leading dot in username', '.username@example.com'],
            ['trailing dot in username', 'username.@example.com'],
            ['+ sign in username', 'username+dmvic@example.com'],
            ['leading dash in username', '-dmvic@example.com'],
            ['trailing dash in username', 'dmvic-@example.com'],
            ['consecutive dots in username', 'user..name@example.com'],
            ['consecutive dots in domain name', 'user.name@example..com'],
            ['invalid symbols in username', 'user!@example.com'],
            ['white space in username', 'user name@example.com'],
            ['white space in domain name', 'username@examp le.com'],
            ['missing top level domain', 'user@example'],
            ['incomplete top level domain', 'user@example.'],
            ['trailing dot in top level domain', 'user@example.com.'],
            ['missing domain', 'user@'],
            ['missing username', '@example.com'],
            ['consecutive @ symbols', 'email@@example.com'],
            ['multiple @ symbols', 'first@last@example.com'],
            ['missing @ symbol', 'email.example.com'],
            ['plain string', 'emailexamplecom'],
        ])('should reject invalid email address formats: %s', (description, invalidEmailFormat) => {
            const payload = getCertificateRequestPayload();
            payload.recipientEmail = invalidEmailFormat;

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it('should reject emails longer than 100 characters', () => {
            const characterLength = chance.integer({ min: 101, max: 200 });
            const recipientEmail = chance.email({ length: characterLength });
            const payload = getCertificateRequestPayload();

            expect(() =>
                certificateIssuanceSchema.validateSync({ ...payload, recipientEmail })
            ).toThrow();
        });
    });

    describe('vehicleYearOfManufacture field validation', () => {
        it.each(nullishValues.filter(([_, value]) => value !== undefined))(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();

                expect(payload).toHaveProperty('vehicleYearOfManufacture');
                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...payload,
                        vehicleYearOfManufacture: nullishValue,
                    })
                ).toThrow();
            }
        );
        it('should not throw ValidationError when field is missing', () => {
            const payload = getCertificateRequestPayload();
            delete payload.vehicleYearOfManufacture;

            expect(payload).not.toHaveProperty('vehicleYearOfManufacture');
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });
        it('should only accept years from 1900 to current year inclusive', () => {
            const pick = chance.bool();
            const currentYear = new Date().getFullYear();
            const yom = pick
                ? chance.integer({ min: 0, max: 1899 })
                : chance.integer({ min: currentYear + 1, max: currentYear + 30 });
            const payload = getCertificateRequestPayload();
            payload.vehicleYearOfManufacture = yom;

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
    });

    describe('vehicleRegistrationNumber field validation', () => {
        it.each(nullishValues)(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();

                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...payload,
                        vehicleRegistrationNumber: nullishValue,
                    })
                ).toThrow();
            }
        );
        it('should be required when vehicleEngineNumber is not provided', () => {
            const payload = getCertificateRequestPayload();
            delete payload.vehicleRegistrationNumber;
            delete payload.vehicleEngineNumber;

            expect(payload).not.toHaveProperty('vehicleRegistrationNumber');
            expect(payload).not.toHaveProperty('vehicleEngineNumber');

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it('should be rejected when vehicleEngineNumber is provided', () => {
            const payload = getCertificateRequestPayload();
            payload.vehicleEngineNumber = generateAphanumericString();
            payload.vehicleRegistrationNumber && delete payload.vehicleRegistrationNumber;

            expect(payload).toHaveProperty('vehicleEngineNumber');
            expect(payload).not.toHaveProperty('vehicleRegistrationNumber');
        });
        it.each([[], {}, 10, 0.3, false, new Date(), null, undefined])(
            'should accept string values only: %s',
            (nonStringValue) => {
                const payload = getCertificateRequestPayload();

                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...payload,
                        vehicleRegistrationNumber: nonStringValue,
                    })
                ).toThrow();
            }
        );
        it('should only accept values between 4 and 15 characters', () => {
            const pick = chance.bool();
            const characterCount = pick
                ? chance.integer({ min: 1, max: 3 })
                : chance.integer({ min: 16, max: 100 });
            const vehicleRegistrationNumber = chance.string({
                length: characterCount,
                pool: 'ABCDEFGHJKLMNOPQRSTUVWXYZ',
            });
            const payload = getCertificateRequestPayload();

            expect(() =>
                certificateIssuanceSchema.validateSync({ ...payload, vehicleRegistrationNumber })
            ).toThrow();
        });
    });

    describe('vehicleEngineNumber field validation', () => {
        it.each(nullishValues)(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();

                payload.vehicleRegistrationNumber && delete payload.vehicleRegistrationNumber;

                expect(payload).not.toHaveProperty('vehicleRegistrationNumber');
                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...payload,
                        vehicleEngineNumber: nullishValue,
                    })
                ).toThrow();
            }
        );
        it('should be required only when vehicleRegistrationNumber is not provided', () => {
            const payload = getCertificateRequestPayload();
            payload.vehicleRegistrationNumber && delete payload.vehicleRegistrationNumber;

            expect(payload).not.toHaveProperty('vehicleRegistrationNumber');
            expect(payload).not.toHaveProperty('vehicleEngineNumber');
            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();

            payload.vehicleEngineNumber = generateAphanumericString();
            expect(payload).toHaveProperty('vehicleEngineNumber');
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });
        it.each([
            ['less than 4 characters', chance.integer({ min: 1, max: 3 })],
            ['more than 15 characters', chance.integer({ min: 16, max: 100 })],
        ])(
            'should only accept values between 4 and 15 characters: %s',
            (description, characterLength) => {
                const vehicleEngineNumber = generateAphanumericString(characterLength);
                const payload = getCertificateRequestPayload();
                payload.vehicleRegistrationNumber && delete payload.vehicleRegistrationNumber;

                expect(payload).not.toHaveProperty('vehicleRegistrationNumber');
                expect(() =>
                    certificateIssuanceSchema.validateSync({ ...payload, vehicleEngineNumber })
                ).toThrow();
            }
        );
    });

    describe('vehicleChassisNumber field validation', () => {
        it.each(nullishValues)(
            'should throw ValidationError for nullish values',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();

                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...payload,
                        vehicleChassisNumber: nullishValue,
                    })
                ).toThrow();
            }
        );
        it('should throw ValidationError when field is missing', () => {
            const payload = getCertificateRequestPayload();
            payload.vehicleChassisNumber && delete payload.vehicleChassisNumber;

            expect(payload).not.toHaveProperty('vehicleChassisNumber');
            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it.each([
            'CHASSIS NUMBER',
            'CHASSIS_NUMBER',
            ' CHASSIS_NUMBER',
            'CHASSIS_NUMBER ',
            'CHASSIS--NUMBER',
            '---CHASSIS',
            'NUMBER---',
            '-CHASSIS',
            'CHASSIS-',
            'CHASSIS@123',
            'CHASSIS#123',
            '123%CHASSIS',
            '',
            ' ',
            '-',
            '--',
            'CHA$SIS-NUMBER',
            'NUM*BER-123',
        ])('should only accept dashes, numbers and letters: %s', (invalidChassisNumber) => {
            const payload = getCertificateRequestPayload();

            expect(() =>
                certificateIssuanceSchema.validateSync({
                    ...payload,
                    vehicleChassisNumber: invalidChassisNumber,
                })
            ).toThrow();
        });
    });

    describe('vehicleMake field validation', () => {
        it.each(nullishValues.filter(([_, value]) => value !== undefined))(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();

                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...payload,
                        vehicleMake: nullishValue,
                    })
                ).toThrow();
            }
        );
        it('should accept missing vehicleMake field', () => {
            const payload = getCertificateRequestPayload();
            payload.vehicleMake && delete payload.vehicleMake;

            expect(payload).not.toHaveProperty('vehicleMake');
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });
        it('should reject strings longer than 50 characters', () => {
            const payload = getCertificateRequestPayload();
            payload.vehicleMake = generateAphanumericString(chance.integer({ min: 51, max: 100 }));

            expect(payload.vehicleMake.length).toBeGreaterThan(50);
            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
    });

    describe('vehicleModel field validation', () => {
        it.each(nullishValues.filter(([_, value]) => value !== undefined))(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();

                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...payload,
                        vehicleModel: nullishValue,
                    })
                ).toThrow();
            }
        );
        it('should accept missing vehicleModel field', () => {
            const payload = getCertificateRequestPayload();
            payload.vehicleModel && delete payload.vehicleModel;

            expect(payload).not.toHaveProperty('vehicleModel');
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });
        it('should reject strings longer than 50 characters', () => {
            const payload = getCertificateRequestPayload();
            payload.vehicleModel = generateAphanumericString(chance.integer({ min: 51, max: 100 }));

            expect(payload.vehicleModel.length).toBeGreaterThan(50);
            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
    });

    describe('vehicleValue field validation', () => {
        it.each(nullishValues)(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload({
                    coverType: cryptoPickOne(Object.keys(VALUATION_COVER_TYPES_OPTION)),
                });

                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...payload,
                        vehicleValue: nullishValue,
                    })
                ).toThrow();
            }
        );
        it('should only accept numbers greater than 0', () => {
            const payload = getCertificateRequestPayload({
                coverType: cryptoPickOne(Object.keys(VALUATION_COVER_TYPES_OPTION)),
            });
            payload.vehicleValue = chance.integer({ min: -100, max: -1 });

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it.each(Object.keys(VALUATION_COVER_TYPES_OPTION))(
            'should be required when coverType is %s',
            (valuationCoverTypeOption) => {
                const payload = getCertificateRequestPayload({
                    coverType: valuationCoverTypeOption,
                });

                expect(payload).toHaveProperty('vehicleValue');
                expect(payload.coverType).toBe(valuationCoverTypeOption);

                delete payload.vehicleValue;
                expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            }
        );
        it('should be rejected when coverType is TPO', () => {
            const payload = getCertificateRequestPayload({
                coverType: 'TPO',
            });
            payload.vehicleValue = chance.integer({ min: 100000, max: 10000000 });

            expect(payload).toHaveProperty('vehicleValue');
            expect(payload).toHaveProperty('coverType');
            expect(payload.coverType).toBe('TPO');
            expect(payload.vehicleValue).toBeDefined();
            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
    });

    describe('recipientPhoneNumber field validation', () => {
        it.each(nullishValues)(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();

                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...payload,
                        recipientPhoneNumber: nullishValue,
                    })
                ).toThrow();
            }
        );
        it('should throw ValidationError when field is missing', () => {
            const payload = getCertificateRequestPayload();
            delete payload.recipientPhoneNumber;

            expect(payload).not.toHaveProperty('recipientPhoneNumber');
            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it.each([
            ['less than 9 digits', chance.integer({ min: 0, max: 99999999 })],
            ['more than 9 digits', chance.integer({ min: 900000000, max: 999999999999 })],
        ])(
            'should reject phone numbers with more than 9 digits: %s',
            (description, invalidPhoneNumber) => {
                const payload = getCertificateRequestPayload();
                payload.recipientPhoneNumber = invalidPhoneNumber;

                expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            }
        );

        it('should accept values with exactly 9 digits', () => {
            const payload = getCertificateRequestPayload();

            expect(payload).toHaveProperty('recipientPhoneNumber');
            expect(payload.recipientPhoneNumber.toString().length).toBe(9);
        });
        it('should reject phone numbers with non-numeric characters', () => {
            const payload = getCertificateRequestPayload();
            payload.recipientPhoneNumber = 123456.78;

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
    });

    describe('vehicleBodyType field validation', () => {
        it.each(nullishValues.filter(([_, value]) => value !== undefined))(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();

                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...payload,
                        vehicleBodyType: nullishValue,
                    })
                ).toThrow();
            }
        );
        it('should not throw ValidationError when field is missing', () => {
            const payload = getCertificateRequestPayload();
            delete payload.vehicleBodyType;

            expect(payload).not.toHaveProperty('vehicleBodyType');
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });
        it('should reject values longer than 50 characters', () => {
            const payload = getCertificateRequestPayload();
            payload.vehicleBodyType = chance.string({
                length: chance.integer({ min: 51, max: 100 }),
            });

            expect(payload).toHaveProperty('vehicleBodyType');
            expect(payload.vehicleBodyType.toString().length).toBeGreaterThan(50);
            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
    });

    describe('policyHolderKRAPIN field validation', () => {
        it.each(nullishValues.filter(([_, value]) => value !== undefined))(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();

                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...payload,
                        policyHolderKRAPIN: nullishValue,
                    })
                ).toThrow();
            }
        );

        it('should not throw ValidationError when field is missing', () => {
            const payload = getCertificateRequestPayload();
            delete payload.policyHolderKRAPIN;

            expect(payload).not.toHaveProperty('policyHolderKRAPIN');
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });

        it('should accept valid KRA PIN format (A123456789B)', () => {
            const payload = getCertificateRequestPayload();
            payload.policyHolderKRAPIN = chance.policyHolderKRAPIN();

            expect(payload).toHaveProperty('policyHolderKRAPIN');
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });

        it('should reject KRA PIN without leading A', () => {
            const payload = getCertificateRequestPayload();
            payload.policyHolderKRAPIN = chance.policyHolderKRAPIN({ head: 'B' });

            expect(payload).toHaveProperty('policyHolderKRAPIN');
            expect(payload.policyHolderKRAPIN.startsWith('B')).toBe(true);
            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it('should reject KRA PIN without trailing letter', () => {
            const payload = getCertificateRequestPayload();
            payload.policyHolderKRAPIN = chance.policyHolderKRAPIN().slice(0, -1);

            expect(payload).toHaveProperty('policyHolderKRAPIN');
            expect(payload.policyHolderKRAPIN.toString().length).toBe(10);
            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it('should reject KRA PIN with wrong number of digits', () => {
            const payload = getCertificateRequestPayload();
            payload.policyHolderKRAPIN = chance.nonConformingKRAPIN();
            expect(payload).toHaveProperty('policyHolderKRAPIN');

            expect(KRA_PIN_REGEX.test(payload.policyHolderKRAPIN)).toBe(false);
            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
    });

    describe('policyHolderHudumaNumber field validation', () => {
        it.each(nullishValues.filter(([_, value]) => value !== undefined))(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getCertificateRequestPayload();

                expect(() =>
                    certificateIssuanceSchema.validateSync({
                        ...payload,
                        policyHolderHudumaNumber: nullishValue,
                    })
                ).toThrow();
            }
        );
        it('should not throw ValidationError when field is missing', () => {
            const payload = getCertificateRequestPayload();
            delete payload.policyHolderHudumaNumber;

            expect(payload).not.toHaveProperty('policyHolderHudumaNumber');
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });
        it.each([
            ['less than 4 characters', chance.integer({ min: 1, max: 3 })],
            ['more than 50 characters', chance.integer({ min: 51, max: 100 })],
        ])(
            'should only accept values between 4 and 50 characters: %s',
            (description, characterLength) => {
                const payload = getCertificateRequestPayload();
                payload.policyHolderHudumaNumber = generateAphanumericString(characterLength);
                expect(payload).toHaveProperty('policyHolderHudumaNumber');
                expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            }
        );
    });

    describe('vehicleTonnage field validation', () => {
        it.each(nullishValues.filter(([_, value]) => value !== undefined))(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getClassBCertificateRequestPayload();
                payload.vehicleTonnage = nullishValue;

                expect(payload).toHaveProperty('vehicleTonnage');
                expect(payload.vehicleTonnage).toBe(nullishValue);
                expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            }
        );
        it('should be required for class B', () => {
            const payload = getClassBCertificateRequestPayload();
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();

            delete payload.vehicleTonnage;

            expect(payload).not.toHaveProperty('vehicleTonnage');
            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it('should be required for class D with COMMERCIAL_MOTOR_CYCLE certificateType', () => {
            const payload = getClassDCertificateRequestPayload({
                certificateType: 'COMMERCIAL_MOTOR_CYCLE',
            });

            expect(payload).toHaveProperty('certificateType');
            expect(payload.certificateType).toBe('COMMERCIAL_MOTOR_CYCLE');
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();

            delete payload.certificateType;

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
        it.each([
            ['less than 1', chance.integer({ min: -20, max: 0 })],
            ['more than 31', chance.integer({ min: 32, max: 100 })],
        ])('should reject values %s - %s', (description, invalidVehicleTonnage) => {
            const payload = getClassBCertificateRequestPayload();
            payload.vehicleTonnage = invalidVehicleTonnage;

            expect(payload).toHaveProperty('vehicleTonnage');
            expect(payload.vehicleTonnage).toBe(invalidVehicleTonnage);
            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });

        it('should accept values between 1 and 31', () => {
            const payload = getClassBCertificateRequestPayload({
                vehicleTonnage: chance.integer({ min: 1, max: 31 }),
            });
            expect(payload).toHaveProperty('vehicleTonnage');
            expect(payload.vehicleTonnage).toBeGreaterThanOrEqual(1);
            expect(payload.vehicleTonnage).toBeLessThanOrEqual(31);
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });
        it('should be forbidden when not required for motorClass/certificateType combination', () => {
            const classAPayload = getClassACertificateRequestPayload();
            classAPayload.vehicleTonnage = chance.integer({ min: 1, max: 31 });

            expect(classAPayload).toHaveProperty('vehicleTonnage');
            expect(classAPayload.vehicleTonnage).toBeGreaterThanOrEqual(1);
            expect(classAPayload.vehicleTonnage).toBeLessThanOrEqual(31);
            expect(() => certificateIssuanceSchema.validateSync(classAPayload)).toThrow();

            const classCPayload = getClassCCertificateRequestPayload();
            classCPayload.vehicleTonnage = chance.integer({ min: 1, max: 31 });

            expect(classCPayload).toHaveProperty('vehicleTonnage');
            expect(classCPayload.vehicleTonnage).toBeGreaterThanOrEqual(1);
            expect(classCPayload.vehicleTonnage).toBeLessThanOrEqual(31);
            expect(() => certificateIssuanceSchema.validateSync(classCPayload)).toThrow();

            const classDPayload = getClassDCertificateRequestPayload({
                certificateType: cryptoPickOne(
                    Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS).filter(
                        (value) => value !== 'COMMERCIAL_MOTOR_CYCLE'
                    )
                ),
            });
            classDPayload.vehicleTonnage = chance.integer({ min: 1, max: 31 });

            expect(classDPayload).toHaveProperty('vehicleTonnage');
            expect(classDPayload).toHaveProperty('certificateType');
            expect(classDPayload.certificateType).not.toBe('COMMERCIAL_MOTOR_CYCLE');
            expect(classDPayload.vehicleTonnage).toBeGreaterThanOrEqual(1);
            expect(classDPayload.vehicleTonnage).toBeLessThanOrEqual(31);
            expect(() => certificateIssuanceSchema.validateSync(classDPayload)).toThrow();
        });
    });

    describe('vehicleType field validation', () => {
        it.each(nullishValues.filter(([_, value]) => value !== undefined))(
            'should throw ValidationError for nullish values: %s',
            (description, nullishValue) => {
                const payload = getClassBCertificateRequestPayload();
                payload.vehicleType = nullishValue;

                expect(payload).toHaveProperty('vehicleType');
                expect(payload.vehicleType).toBe(nullishValue);
                expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
            }
        );
        it.each(Object.keys(VEHICLE_TYPE_OPTIONS))(
            'should accept valid vehicleType enum values: %s',
            (vehicleType) => {
                const classBPayload = getClassBCertificateRequestPayload({ vehicleType });
                expect(classBPayload).toHaveProperty('vehicleType');
                expect(classBPayload.vehicleType).toBe(vehicleType);
                expect(() => certificateIssuanceSchema.validateSync(classBPayload)).not.toThrow();
            }
        );
        it('should be allowed for class B vehicles', () => {
            const payload = getClassBCertificateRequestPayload();

            expect(payload).toHaveProperty('vehicleType');
            expect(Object.keys(VEHICLE_TYPE_OPTIONS)).toContain(payload.vehicleType);
            expect(() => certificateIssuanceSchema.validateSync(payload)).not.toThrow();
        });
        it('should be required when motorClass is B', () => {
            const classBPayload = getClassBCertificateRequestPayload();
            expect(classBPayload).toHaveProperty('vehicleType');

            delete classBPayload.vehicleType;

            expect(() => certificateIssuanceSchema.validateSync(classBPayload)).toThrow();
        });
        it.each(['A', 'C', 'D'])('should be forbidden when motorClass is %s', (motorClass) => {
            const payload = getCertificateRequestPayload({ motorClass });
            payload.vehicleType = cryptoPickOne(Object.keys(VEHICLE_TYPE_OPTIONS));

            expect(payload).toHaveProperty('vehicleType');
            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
    });

    describe('cross-field validation', () => {
        it('should reject when neither vehicleEngineNumber nor vehicleRegistrationNumber provided', () => {
            const payload = getCertificateRequestPayload();
            payload.vehicleRegistrationNumber && delete payload.vehicleRegistrationNumber;
            payload.vehicleEngineNumber && delete payload.vehicleEngineNumber;

            expect(payload).not.toHaveProperty('vehicleRegistrationNumber');
            expect(payload).not.toHaveProperty('vehicleEngineNumber');

            expect(() => certificateIssuanceSchema.validateSync(payload)).toThrow();
        });
    });
});

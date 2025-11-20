import { DMVIC_RESPONSE_ERRORS } from '../../lib/utils/dmvic-error-responses.mjs';
import { sampleDMVICErrorTexts } from '../fixtures/sample-dmvic-error-texts.mjs';

describe('DMVIC_RESPONSE_ERRORS', () => {
    describe('Array structure and validation', () => {
        it('should be an array', () => {
            expect(Array.isArray(DMVIC_RESPONSE_ERRORS)).toBe(true);
        });

        it('should have unique error codes', () => {
            const codes = DMVIC_RESPONSE_ERRORS.map((error) => error.code);
            const uniqueCodes = new Set(codes);

            expect(uniqueCodes.size).toBe(codes.length);
        });
    });

    describe('Error object structure', () => {
        it.each(DMVIC_RESPONSE_ERRORS)(
            'each error should have code and regex properties - $code',
            (errorObj) => {
                expect(errorObj).toHaveProperty('code');
                expect(errorObj).toHaveProperty('regex');
                expect(errorObj.code).toBeDefined();
                expect(errorObj.regex).toBeDefined();
                expect(errorObj.regex).toBeInstanceOf(RegExp);
            }
        );

        it.each(DMVIC_RESPONSE_ERRORS)(
            'each code should be in uppercase with underscores - $code',
            (errorObj) => {
                expect(errorObj.code).toMatch(/^[A-Z_]+$/);
            }
        );
    });

    describe('Regex uniqueness', () => {
        it('should not have similar regex patterns across different error codes', () => {
            const regexPatterns = DMVIC_RESPONSE_ERRORS.map((error) => error.regex.source);
            const uniquePatterns = new Set(regexPatterns);

            // If there are duplicates, the set size will be less than the array length
            expect(uniquePatterns.size).toBe(regexPatterns.length);
        });

        it('each regex pattern should be unique when normalized', () => {
            const normalizedPatterns = DMVIC_RESPONSE_ERRORS.map((error) =>
                error.regex.source.toLowerCase().replace(/\\/g, '').replace(/\s+/g, ' ')
            );
            const uniquePatterns = new Set(normalizedPatterns);

            expect(uniquePatterns.size).toBe(normalizedPatterns.length);
        });
    });

    describe('CHSS_REG_DIFF regex flexibility', () => {
        const { regex } = DMVIC_RESPONSE_ERRORS.find((e) => e.code === 'CHSS_REG_DIFF');
        it.each([
            'Registration number (ABC123) and chassis number (XYZ789) combination have been changed from the previously issued policy',
            'Registration number (TEST-001) and chassis number (CHS-456) combination have been changed from the previously issued policy',
            'Registration number (KA01AB1234) and chassis number (MAH123456789) combination have been changed from the previously issued policy',
            'Registration number (DL4CAF1234) and chassis number (MB123456789012) combination have been changed from the previously issued policy',
            'Registration number (Custom-Reg) and chassis number (Custom-Chassis) combination have been changed from the previously issued policy',
        ])('should accept different registration numbers in the pattern: %s', (testCase) => {
            expect(testCase).toMatch(regex);
        });
    });

    describe('DAY_GAP regex flexibility', () => {
        it.each([
            'There is a 1 day gap between the previous insurance and the proposed one',
            'There is a 5 days gap between the previous insurance and the proposed one',
            'There is a 30 days gap between the previous insurance and the proposed one',
            'There is a 365 days gap between the previous insurance and the proposed one',
            'there is a 999 days gap between the previous insurance and the proposed one',
        ])('should accept different day values in the pattern: %s', (testCase) => {
            const { regex } = DMVIC_RESPONSE_ERRORS.find((e) => e.code === 'DAY_GAP');
            expect(testCase).toMatch(regex);
        });

        it('should handle both singular and plural day forms', () => {
            const { regex } = DMVIC_RESPONSE_ERRORS.find((e) => e.code === 'DAY_GAP');

            expect(
                'There is a 1 day gap between the previous insurance and the proposed one'
            ).toMatch(regex);
            expect(
                'There is a 2 days gap between the previous insurance and the proposed one'
            ).toMatch(regex);
        });
    });

    describe('Regex pattern specificity', () => {
        it.each(sampleDMVICErrorTexts)(
            'should not have multiple regex patterns that match the same text: %s',
            (errorText) => {
                const matchingCodes = DMVIC_RESPONSE_ERRORS.filter((error) =>
                    error.regex.test(errorText)
                );
                expect(matchingCodes).toHaveLength(1);
            }
        );
    });
});

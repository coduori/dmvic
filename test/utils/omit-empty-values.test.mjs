import { omitEmptyValues } from '../../lib/utils/omit-empty-values.mjs';

describe('omitEmptyValues', () => {
    describe('should remove falsy values from objects', () => {
        const testCases = [
            {
                description: 'empty object',
                input: {},
                expected: {},
            },
            {
                description: 'object with no falsy values',
                input: { a: 1, b: 'hello', c: true, d: [], e: {} },
                expected: { a: 1, b: 'hello', c: true, d: [], e: {} },
            },
            {
                description: 'object with null values',
                input: { a: 1, b: null, c: 'hello' },
                expected: { a: 1, c: 'hello' },
            },
            {
                description: 'object with undefined values',
                input: { a: 1, b: undefined, c: 'world' },
                expected: { a: 1, c: 'world' },
            },
            {
                description: 'object with empty string',
                input: { a: '', b: 'text', c: 2 },
                expected: { b: 'text', c: 2 },
            },
            {
                description: 'object with zero',
                input: { a: 0, b: false, c: 'keep' },
                expected: { c: 'keep' },
            },
            {
                description: 'object with false',
                input: { a: false, b: '', c: 'value' },
                expected: { c: 'value' },
            },
            {
                description: 'object with NaN',
                input: { a: NaN, b: 'valid', c: null },
                expected: { b: 'valid' },
            },
            {
                description: 'mixed falsy values',
                input: {
                    a: null,
                    b: undefined,
                    c: '',
                    d: 0,
                    e: false,
                    f: 'valid',
                    g: 42,
                },
                expected: { f: 'valid', g: 42 },
            },
        ];

        testCases.forEach(({ description, input, expected }) => {
            it(`should handle ${description}`, () => {
                const result = omitEmptyValues(input);
                expect(result).toEqual(expected);
            });
        });
    });

    describe('should handle special values and edge cases', () => {
        it('should keep empty arrays', () => {
            const input = { arr: [], str: '', num: 42 };
            const expected = { arr: [], num: 42 };
            expect(omitEmptyValues(input)).toEqual(expected);
        });

        it('should keep empty objects', () => {
            const input = { obj: {}, nullVal: null, value: 'test' };
            const expected = { obj: {}, value: 'test' };
            expect(omitEmptyValues(input)).toEqual(expected);
        });

        it('should keep positive numbers', () => {
            const input = { positive: 42, negative: -1, zero: 0, empty: null };
            const expected = { positive: 42, negative: -1 };
            expect(omitEmptyValues(input)).toEqual(expected);
        });
    });

    describe('should not mutate original object', () => {
        it('should return a new object', () => {
            const original = { a: 1, b: null, c: 'hello' };
            const result = omitEmptyValues(original);

            expect(result).not.toBe(original);
            expect(original).toEqual({ a: 1, b: null, c: 'hello' });
        });

        it('should preserve original object structure', () => {
            const original = { a: '', b: 0, c: false, d: undefined };
            const originalCopy = { ...original };

            omitEmptyValues(original);

            expect(original).toEqual(originalCopy);
        });
    });

    describe('should handle nested objects and arrays carefully', () => {
        it('should not deeply filter nested objects', () => {
            const input = {
                a: 1,
                b: { nestedNull: null, nestedValue: 'keep' },
                c: null,
            };
            const expected = {
                a: 1,
                b: { nestedNull: null, nestedValue: 'keep' },
            };

            expect(omitEmptyValues(input)).toEqual(expected);
        });

        it('should handle arrays with falsy values (keeps entire array)', () => {
            const input = {
                arr: [null, '', 0, 'value'],
                empty: null,
            };
            const expected = {
                arr: [null, '', 0, 'value'],
            };

            expect(omitEmptyValues(input)).toEqual(expected);
        });
    });

    describe('error handling and edge cases', () => {
        it('should handle non-object inputs', () => {
            const rejectionString = 'omitEmptyValues expects a non-array object';
            expect(() => omitEmptyValues(undefined)).toThrow(rejectionString);
            expect(() => omitEmptyValues(null)).toThrow(rejectionString);
            expect(() => omitEmptyValues('string')).toThrow(rejectionString);
            expect(() => omitEmptyValues(123)).toThrow(rejectionString);
            expect(() => omitEmptyValues(true)).toThrow(rejectionString);
            expect(() => omitEmptyValues([0, '', 'value', null])).toThrow(rejectionString);
        });
    });
});

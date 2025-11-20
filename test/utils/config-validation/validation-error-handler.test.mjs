import { yupValidationError } from '../../../lib/utils/config-validation/validation-error-handler.mjs';

describe('yupValidationError', () => {
    describe('should return correct validation error structure', () => {
        it.each([
            {
                description: 'multiple validation errors',
                mockYupErrors: {
                    inner: [
                        {
                            path: 'email',
                            message: 'Email is required',
                            value: '',
                        },
                        {
                            path: 'password',
                            message: 'Password must be at least 8 characters',
                            value: '123',
                        },
                    ],
                },
                expectedErrors: [
                    {
                        field: 'email',
                        message: 'Email is required',
                        value: '',
                    },
                    {
                        field: 'password',
                        message: 'Password must be at least 8 characters',
                        value: '123',
                    },
                ],
            },
            {
                description: 'single validation error',
                mockYupErrors: {
                    inner: [
                        {
                            path: 'username',
                            message: 'Username is required',
                            value: null,
                        },
                    ],
                },
                expectedErrors: [
                    {
                        field: 'username',
                        message: 'Username is required',
                        value: null,
                    },
                ],
            },
            {
                description: 'error with missing value property',
                mockYupErrors: {
                    inner: [
                        {
                            path: 'email',
                            message: 'Email is required',
                            // value is missing
                        },
                    ],
                },
                expectedErrors: [
                    {
                        field: 'email',
                        message: 'Email is required',
                        value: undefined,
                    },
                ],
            },
        ])('for $description', ({ mockYupErrors, expectedErrors }) => {
            const result = yupValidationError(mockYupErrors);

            expect(result).toEqual({
                success: false,
                message: 'Validation failed!',
                errors: expectedErrors,
            });
        });
    });

    describe('should handle empty validation scenarios', () => {
        it.each([
            {
                description: 'empty errors array',
                mockYupErrors: { inner: [] },
                expectedErrorCount: 0,
            },
        ])('for $description', ({ mockYupErrors, expectedErrorCount }) => {
            const result = yupValidationError(mockYupErrors);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Validation failed!');
            expect(result.errors).toHaveLength(expectedErrorCount);
            expect(result.errors).toEqual([]);
        });
    });

    describe('should maintain consistent response structure', () => {
        it('always returns success: false', () => {
            const mockYupErrors = {
                inner: [
                    {
                        path: 'test',
                        message: 'Test error',
                        value: 'test',
                    },
                ],
            };

            const result = yupValidationError(mockYupErrors);

            expect(result.success).toBe(false);
        });

        it('always returns the same validation message', () => {
            const mockYupErrors = {
                inner: [
                    {
                        path: 'test',
                        message: 'Test error',
                        value: 'test',
                    },
                ],
            };

            const result = yupValidationError(mockYupErrors);

            expect(result.message).toBe('Validation failed!');
        });

        it('always includes errors array property', () => {
            const testCases = [
                {
                    mockYupErrors: { inner: [] },
                    expectedLength: 0,
                },
                {
                    mockYupErrors: {
                        inner: [
                            { path: 'field1', message: 'Error 1', value: 'val1' },
                            { path: 'field2', message: 'Error 2', value: 'val2' },
                        ],
                    },
                    expectedLength: 2,
                },
            ];

            testCases.forEach(({ mockYupErrors, expectedLength }) => {
                const result = yupValidationError(mockYupErrors);
                expect(Array.isArray(result.errors)).toBe(true);
                expect(result.errors).toHaveLength(expectedLength);
            });
        });
    });

    describe('should correctly map Yup error properties', () => {
        it.each([
            ['path', 'field'],
            ['message', 'message'],
            ['value', 'value'],
        ])('maps Yup %s to formatted error %s', (yupProp, formattedProp) => {
            const mockYupErrors = {
                inner: [
                    {
                        path: 'testField',
                        message: 'Test message',
                        value: 'testValue',
                    },
                ],
            };

            const result = yupValidationError(mockYupErrors);

            expect(result.errors[0][formattedProp]).toBe(mockYupErrors.inner[0][yupProp]);
        });
    });
});

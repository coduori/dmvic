import { jest } from '@jest/globals';

import { mockPayloadSchema } from '../../mocks/mocks.mjs';

jest.unstable_mockModule('../../../lib/utils/payload-schema.mjs', () => ({
    certificateIssuanceSchema: mockPayloadSchema,
}));

const { validatePayload } = await import(
    '../../../lib/utils/config-validation/request-certificate-validation.mjs'
);

describe('validate payload data', () => {
    const expectToThrowWith = (fn, expected) => {
        try {
            fn();
            throw new Error('Function did not throw');
        } catch (err) {
            expect(err).toMatchObject(expected);
        }
    };

    const validPayload = {
        insurer: 'AIG',
        passengerCount: 1,
        policyHolderFullName: 'John Doe',
        commencingDate: new Date(),
    };

    it('should pass validation with a valid payload', () => {
        expect(() => validatePayload(validPayload)).not.toThrow();
    });

    it('should throw validation error with an invalid payload', () => {
        const invalidInsurerPayload = {
            ...validPayload,
            insurer: 'InvalidInsurer',
        };
        expect(() => validatePayload(invalidInsurerPayload)).toThrow(
            'insurer must be one of the following values: AIG, Jubilee, Britam'
        );
    });

    it('should throw a single validation error with all multiple errors in payload', () => {
        const multipleErrorsInPayload = {
            ...validPayload,
            insurer: 'InvalidInsurer',
            passengerCount: 100,
        };
        expectToThrowWith(() => validatePayload(multipleErrorsInPayload), {
            message: '2 errors occurred',
            errors: [
                'insurer must be one of the following values: AIG, Jubilee, Britam',
                'passengerCount must be less than or equal to 50',
            ],
        });
    });
});

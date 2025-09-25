import { certificateIssuanceSchema } from '../payload-schema.mjs';

const validatePayload = (payload) => {
    certificateIssuanceSchema.validateSync(payload, { abortEarly: false });
};

export { validatePayload };

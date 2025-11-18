import { logger } from './logger.mjs';

const Success = (value) => ({ type: 'Success', value });
const Failure = (value) => ({ type: 'Failure', value });

const isSuccess = (result) => result.type === 'Success';

const processError = (error) => {
    logger('DMVIC ERROR RESPONSE::', error.message);
    return {
        message: error.message,
        code: error.code || 'UNCATEGORISED_ERROR',
    };
};

const tryCatchAsync = async (fn) => {
    try {
        const data = await fn();
        return Success(data);
    } catch (error) {
        return Failure(error);
    }
};

const processResult = (result, onSuccess, onFailure) =>
    isSuccess(result) ? onSuccess(result.value) : onFailure(result.value);

const withErrorHandling =
    (apiFn) =>
    async (...args) => {
        const result = await tryCatchAsync(() => apiFn(...args));

        return processResult(result, Success, (error) => Failure(processError(error)));
    };

export { withErrorHandling };

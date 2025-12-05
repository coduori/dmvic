import { authenticate } from '../../index.mjs';
import { logger } from '../logger.mjs';

const reauthenticateAndRetryAfterware = async (response, context) => {
    const isAuthError =
        response.status === 401 || response.error?.[0]?.sdkErrorCode === 'INVLD_TKN';
    if (!isAuthError) return response;
    if (context.retryCount >= 1) return response;
    logger('reauthenticatinsddfg...', context.retryCount);

    try {
        logger('reauthenticating...', context.retryCount);
        const authResult = await authenticate();
        logger('authResult...', authResult);
        if (!authResult.success) return response;

        const newToken = authResult.responseData.token;
        const retriedResponse = await context.retryRequest(newToken);

        return {
            ...retriedResponse,
            _tokenRefreshed: true,
            newToken,
        };
    } catch {
        return response;
    }
};

export { reauthenticateAndRetryAfterware };

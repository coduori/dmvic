import { authenticate } from '../../index.mjs';

const createUnrefreshedResponse = (originalResponse) => ({
    ...originalResponse,
    tokenRefreshed: false,
});

const reauthenticateAndRetryAfterware = async (response, context) => {
    const isAuthError =
        response.httpStatusCode === 401 || response.error?.[0]?.sdkErrorCode === 'INVLD_TKN';

    if (!isAuthError || context.retryCount >= 1) return createUnrefreshedResponse(response);

    try {
        const authResult = await authenticate();
        if (!authResult.success) return createUnrefreshedResponse(response);

        const newToken = authResult.responseData.token;
        const retriedResponse = await context.retryRequest(newToken);

        return {
            ...retriedResponse,
            tokenRefreshed: true,
            newToken,
        };
    } catch {
        return createUnrefreshedResponse(response);
    }
};

export { reauthenticateAndRetryAfterware };

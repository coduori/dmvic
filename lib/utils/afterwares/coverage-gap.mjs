import { confirmCoverIssuance } from '../../index.mjs';
import { COVERAGE_GAP_POLICIES } from '../constants.mjs';
import { getSecret } from '../secrets-handler.mjs';

const hasCoverageGap = (response) =>
    Array.isArray(response?.error) && response.error.some((e) => e.sdkErrorCode === 'COVERAGE_GAP');

const coverageGapAfterware = async (response, context) => {
    if (!hasCoverageGap(response)) return response;

    if (getSecret('coveragegappolicy') === COVERAGE_GAP_POLICIES.BYPASS) {
        return confirmCoverIssuance(context.authToken, response.issuanceRequestId);
    }

    return response;
};

export { coverageGapAfterware };

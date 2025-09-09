import { jest, expect } from '@jest/globals';

const mockRequest = jest.fn();
const mockClient = { request: mockRequest };
const mockGetClient = jest.fn(() => mockClient);
const mockGetSecret = jest.fn(() => 'testClientId');

jest.unstable_mockModule('../../lib/utils/http-client.mjs', () => ({
    getClient: mockGetClient,
}));
jest.unstable_mockModule('../../lib/utils/secrets-handler.mjs', () => ({
    getSecret: mockGetSecret,
}));

const { invoke } = await import('../../lib/utils/request-handler.mjs');

describe('Request Handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('throws if no token is provided for an authorized request', async () => {
        await expect(invoke('POST', '/endpoint', { foo: 'bar' }, null, true)).rejects.toThrow(
            'An Auth token is required for all authenticated requests!'
        );
    });

    it('does not throw if not authorized', async () => {
        mockRequest.mockResolvedValue({
            statusCode: 200,
            headers: {},
            body: { json: async () => ({ ok: true }) },
        });
        await expect(invoke('GET', '/endpoint', {}, null, false)).resolves.toBeDefined();
    });

    it('sets correct headers for authorized requests', async () => {
        mockRequest.mockResolvedValue({
            statusCode: 200,
            headers: {},
            body: { json: async () => ({ ok: true }) },
        });
        await invoke('POST', '/endpoint', { foo: 'bar' }, 'token123', true);

        const call = mockRequest.mock.calls[0][0];
        expect(call.headers.authorization).toBe('Bearer token123');
        expect(call.headers.clientId).toBe('testClientId');
        expect(call.headers.accept).toBe('application/json');
        expect(call.headers['Content-Type']).toBe('application/json');
    });

    it('does not set Authorization header if not authorized', async () => {
        mockRequest.mockResolvedValue({
            statusCode: 200,
            headers: {},
            body: { json: async () => ({ ok: true }) },
        });
        await invoke('GET', '/endpoint', {}, null, false);

        const call = mockRequest.mock.calls[0][0];
        expect(call.headers.authorization).toBeUndefined();
    });

    it('calls getClient().request with correct arguments', async () => {
        mockRequest.mockResolvedValue({
            statusCode: 200,
            headers: { foo: 'bar' },
            body: { json: async () => ({ ok: true }) },
        });
        await invoke('POST', '/endpoint', { foo: 'bar' }, 'token123', true);

        expect(mockRequest).toHaveBeenCalledWith({
            path: '/endpoint',
            method: 'POST',
            body: JSON.stringify({ foo: 'bar' }),
            headers: expect.objectContaining({
                authorization: 'Bearer token123',
                clientId: 'testClientId',
            }),
        });
    });

    it('returns the expected response structure', async () => {
        mockRequest.mockResolvedValue({
            statusCode: 201,
            headers: { foo: 'bar' },
            body: { json: async () => ({ result: 42 }) },
        });
        const result = await invoke('POST', '/endpoint', { foo: 'bar' }, 'token123', true);

        expect(result).toEqual({
            responseBody: { result: 42 },
            statusCode: 201,
        });
    });

    it('throws with correct message if getClient().request throws', async () => {
        mockRequest.mockRejectedValue(new Error('Network error'));
        await expect(invoke('POST', '/endpoint', { foo: 'bar' }, 'token123', true)).rejects.toThrow(
            'DMVIC Request error: Error: Network error'
        );
    });

    it('throws with correct message if response.json() throws', async () => {
        mockRequest.mockResolvedValue({
            statusCode: 200,
            headers: {},
            body: {
                json: async () => {
                    throw new Error('Bad JSON');
                },
            },
        });
        await expect(invoke('POST', '/endpoint', { foo: 'bar' }, 'token123', true)).rejects.toThrow(
            'DMVIC Request error: Error: Bad JSON'
        );
    });
});

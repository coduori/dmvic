import { jest } from '@jest/globals';

import { logger } from '../../lib/utils/logger.mjs';

const mockStdoutWrite = jest.fn();
const originalProcess = global.process;

describe('logger', () => {
    let originalConsoleLog;

    beforeAll(() => {
        originalConsoleLog = console.log;
        console.log = jest.fn();
    });

    beforeEach(() => {
        mockStdoutWrite.mockClear();
        jest.useFakeTimers();

        global.process = {
            stdout: {
                write: mockStdoutWrite,
            },
        };
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    afterAll(() => {
        global.process = originalProcess;
        console.log = originalConsoleLog;
    });

    describe('environment validation', () => {
        const supportErrorString =
            'This library requires Node.js with process.stdout.write support.';

        it('should throw error when process is undefined', () => {
            global.process = undefined;

            expect(() => logger('test')).toThrow(supportErrorString);
        });

        it('should throw error when process.stdout is undefined', () => {
            global.process = { stdout: undefined };

            expect(() => logger('test')).toThrow(supportErrorString);
        });

        it('should throw error when process.stdout.write is not a function', () => {
            global.process = { stdout: { write: 'not-a-function' } };

            expect(() => logger('test')).toThrow(supportErrorString);
        });
    });

    describe('argument processing', () => {
        const fixedDate = new Date('2023-01-01T00:00:00.000Z');

        beforeEach(() => {
            jest.setSystemTime(fixedDate);
        });

        it('should handle string arguments', () => {
            logger('hello', 'world');

            expect(mockStdoutWrite).toHaveBeenCalledWith(
                `[${fixedDate.toISOString()}] hello world\n`
            );
        });

        it('should handle number arguments', () => {
            logger(42, 3.14);

            expect(mockStdoutWrite).toHaveBeenCalledWith(`[${fixedDate.toISOString()}] 42 3.14\n`);
        });

        it('should handle boolean arguments', () => {
            logger(true, false);

            expect(mockStdoutWrite).toHaveBeenCalledWith(
                `[${fixedDate.toISOString()}] true false\n`
            );
        });

        it('should handle null and undefined', () => {
            logger(null, undefined);

            expect(mockStdoutWrite).toHaveBeenCalledWith(
                `[${fixedDate.toISOString()}] null undefined\n`
            );
        });

        it('should serialize plain objects to JSON', () => {
            const obj = { name: 'test', value: 42 };
            logger(obj);

            expect(mockStdoutWrite).toHaveBeenCalledWith(
                `[${fixedDate.toISOString()}] ${JSON.stringify(obj)}\n`
            );
        });

        it('should serialize arrays to JSON', () => {
            const arr = [1, 'two', { three: 3 }];
            logger(arr);

            expect(mockStdoutWrite).toHaveBeenCalledWith(
                `[${fixedDate.toISOString()}] ${JSON.stringify(arr)}\n`
            );
        });

        it('should handle unserializable objects gracefully', () => {
            const circularObj = {};
            circularObj.self = circularObj;

            logger(circularObj);

            expect(mockStdoutWrite).toHaveBeenCalledWith(
                `[${fixedDate.toISOString()}] [Unserializable Object]\n`
            );
        });

        it('should handle mixed argument types', () => {
            const obj = { data: 'test' };
            const arr = [1, 2, 3];

            logger('Message:', obj, 'Numbers:', arr, 42, true);

            expect(mockStdoutWrite).toHaveBeenCalledWith(
                `[${fixedDate.toISOString()}] Message: ${JSON.stringify(obj)} Numbers: ${JSON.stringify(arr)} 42 true\n`
            );
        });

        it('should handle empty arguments', () => {
            logger();

            expect(mockStdoutWrite).toHaveBeenCalledWith(`[${fixedDate.toISOString()}] \n`);
        });

        it('should handle function arguments by converting to string', () => {
            const testFn = () => 'test';
            logger(testFn);

            expect(mockStdoutWrite).toHaveBeenCalledWith(
                `[${fixedDate.toISOString()}] ${String(testFn)}\n`
            );
        });

        it('should handle symbol arguments by converting to string', () => {
            const sym = Symbol('test');
            logger(sym);

            expect(mockStdoutWrite).toHaveBeenCalledWith(
                `[${fixedDate.toISOString()}] ${String(sym)}\n`
            );
        });
    });

    describe('output formatting', () => {
        it('should include ISO timestamp in output', () => {
            const fixedDate = new Date('2023-01-01T12:34:56.789Z');
            jest.setSystemTime(fixedDate);

            logger('test message');

            expect(mockStdoutWrite).toHaveBeenCalledWith(
                `[${fixedDate.toISOString()}] test message\n`
            );
        });

        it('should join multiple arguments with spaces', () => {
            logger('hello', 'world', '!');

            const call = mockStdoutWrite.mock.calls[0][0];
            expect(call).toMatch(/^\[.*\] hello world !\n$/);
        });

        it('should end output with newline character', () => {
            logger('test');

            const output = mockStdoutWrite.mock.calls[0][0];
            expect(output.endsWith('\n')).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should handle very long strings', () => {
            const longString = 'a'.repeat(10000);
            logger(longString);

            expect(mockStdoutWrite).toHaveBeenCalledWith(expect.stringContaining(longString));
        });

        it('should handle special characters in strings', () => {
            const specialString = 'line1\nline2\ttab\\backslash';
            logger(specialString);

            expect(mockStdoutWrite).toHaveBeenCalledWith(expect.stringContaining(specialString));
        });

        it('should handle objects with toJSON method', () => {
            const objWithToJSON = {
                data: 'test',
                toJSON: function () {
                    return { custom: 'serialized', data: this.data };
                },
            };

            logger(objWithToJSON);

            expect(mockStdoutWrite).toHaveBeenCalledWith(
                expect.stringContaining('{"custom":"serialized","data":"test"}')
            );
        });
    });
});

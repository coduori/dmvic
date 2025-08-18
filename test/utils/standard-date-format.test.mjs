import {
    getDateToday,
    getOneYearFromToday,
    standardizeDateFormat,
} from '../../lib/utils/standard-date-format.mjs';

describe('Date formatting utilities', () => {
    it('should format a Date object to DD/MM/YYYY', () => {
        const date = new Date('2025-01-06');
        expect(standardizeDateFormat(date)).toBe('06/01/2025');
    });

    it('should format a valid date string to DD/MM/YYYY', () => {
        expect(standardizeDateFormat('2025-01-06')).toBe('06/01/2025');
    });

    it('should throw TypeError for invalid date input', () => {
        expect(() => standardizeDateFormat('not-a-date')).toThrow(TypeError);
        expect(() => standardizeDateFormat({})).toThrow(TypeError);
        expect(() => standardizeDateFormat([])).toThrow(TypeError);
        expect(() => standardizeDateFormat(undefined)).toThrow(TypeError);
        expect(() => standardizeDateFormat(null)).toThrow(TypeError);
    });

    it("should return today's date in DD/MM/YYYY format", () => {
        const today = new Date();
        const expected = today.toLocaleDateString('en-GB');
        expect(getDateToday()).toBe(expected);
    });

    it('should return the date one year from today in DD/MM/YYYY format', () => {
        const today = new Date();
        const nextYear = new Date(today);
        nextYear.setFullYear(today.getFullYear() + 1);
        const expected = nextYear.toLocaleDateString('en-GB');
        expect(getOneYearFromToday()).toBe(expected);
    });
});

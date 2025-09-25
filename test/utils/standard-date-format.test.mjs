import {
    getDateToday,
    getAnnualExpiry,
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

    it.each([
        ['2020-03-01', '28/02/2021'],
        ['2019-03-01', '29/02/2020'],
        ['2019-01-01', '31/12/2019'],
        ['2020-02-29', '28/02/2021'],
    ])('should expire %s on %s', (currentDate, expiryDate) => {
        expect(getAnnualExpiry(new Date(currentDate))).toBe(expiryDate);
    });
});

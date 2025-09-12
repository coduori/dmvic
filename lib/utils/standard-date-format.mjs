function standardizeDateFormat(date) {
    let dateObj = date;
    if (typeof date === 'string' || typeof date === 'number') {
        dateObj = new Date(date);
    }

    if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
        throw new TypeError('Input must be a valid Date');
    }

    return dateObj.toLocaleDateString('en-GB');
}

function getDateToday() {
    return standardizeDateFormat(new Date());
}

function getAnnualExpiry() {
    const today = new Date();
    const year = today.getFullYear();
    const nextYear = year + 1;
    const isLeap = (nextYear % 4 === 0 && nextYear % 100 !== 0) || nextYear % 400 === 0;
    const daysToAdd = isLeap ? 366 : 365;
    const expiry = new Date(today);
    expiry.setDate(expiry.getDate() + (daysToAdd - 1));
    return standardizeDateFormat(expiry);
}
export { getDateToday, getAnnualExpiry, standardizeDateFormat };

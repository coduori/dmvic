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

function getOneYearFromToday() {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);
    return standardizeDateFormat(nextYear);
}
export { getDateToday, getOneYearFromToday, standardizeDateFormat };

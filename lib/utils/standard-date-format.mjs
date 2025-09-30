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

function getAnnualExpiry(commencingDate) {
    return standardizeDateFormat(getISOAnnualExpiry(commencingDate));
}

function getISOAnnualExpiry(commencingDate = new Date()) {
    const expiry = new Date(commencingDate);
    expiry.setFullYear(expiry.getFullYear() + 1);
    expiry.setDate(expiry.getDate() - 1);
    return expiry;
}

export { getAnnualExpiry, getDateToday, getISOAnnualExpiry, standardizeDateFormat };

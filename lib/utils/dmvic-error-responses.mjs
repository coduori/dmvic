const DMVIC_RESPONSE_ERRORS = [
    {
        code: 'INVLD_CRD',
        regex: /Incorrect Username or Password entered./i,
    },
    {
        code: 'INVLD_USR',
        regex: /Username is Invalid.please enter correct username/i,
    },
    {
        code: 'INVLD_TKN',
        regex: /Token is expired or invalid/i,
    },
    {
        code: 'LCKD_ACC',
        regex: /Your account has been locked, Please contact your administrator./i,
    },
    {
        code: 'INVLD_REG',
        regex: /Vehicle Registration Number is invalid/i,
    },
    {
        code: 'CHSS_REG_DIFF',
        regex: /Registration number \(.+\) and chassis number \(.+\) combination have been changed from the previously issued policy/i,
    },
    {
        code: 'CRT_CVR_CHG',
        regex: /Change of cover is noted and issuance on a new certificate based on the new terms authorised/i,
    },
    {
        code: 'ACTV_CVR_EXST',
        regex: /This vehicle is already covered under an active policy\. To obtain a new quote, set the cover start date after the current policy’s expiry/i,
    },
    {
        code: 'DAY_GAP',
        regex: /There is a \d+\s+days? gap between the previous insurance and the proposed one/i,
    },
    {
        code: 'CVR_OVLP',
        regex: /Vehicle Registration Number \/ Chassis Number has an overlapping policy, leading to Double Insurance./i,
    },
    {
        code: 'INVLD_NTSA',
        regex: /The vehicle details you entered are not found in the NTSA records./i,
    },
    {
        code: 'NTSA_CNFLCT',
        regex: /Please note that the details entered do not match NTSA records/i,
    },
    {
        code: 'INVLD_CERT',
        regex: /Certificate Number is not valid/i,
    },
    {
        code: 'NOT_FOUND',
        regex: /No Records Found/i,
    },
    {
        code: 'INVLD_CERT_PDF',
        regex: /Invalid CertificateNo/i,
    },
    {
        code: 'CXL_TTL_EXCD',
        regex: /Sorry!? you can not cancel the certificate since issuance time exceeded (\d+) hours?\./i,
    },
];

export { DMVIC_RESPONSE_ERRORS };

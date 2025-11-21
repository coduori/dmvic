/* eslint-disable max-lines */
const sampleSuccessAuthResponse = {
    token: 'auth.token.123',
    loginUserId: '60179D4D-C5EC-4005-8B30-140EE86BHBEA',
    issueAt: '2025-11-21T14:11:45.8321463Z',
    expires: '2025-11-28T14:16:45.8128631Z',
    code: 1,
    LoginHistoryId: 2060230,
    firstName: 'John',
    lastName: 'Doe',
    loggedinEntityId: 28550,
    ApimSubscriptionKey: null,
    IndustryTypeId: 4,
};

const sampleFailedAuthResponse = {
    code: -6,
    message: 'Username is Invalid.please enter correct username',
};

const sampleDMVICFailedResponses = [
    {
        Inputs: '{"membercompanyid":49,"typeofcover":200,"policyholder":"SA","policynumber":"SAPOL123","commencingdate":"05/10/2025","expiringdate":"13/12/2025","registrationnumber":"KBC705F","chassisnumber":"LLCLPSIA381C1841","phonenumber":"708312406","bodytype":"S.WAGON","vehiclemake":"NISSAN","vehiclemodel":"NA","email":"iconcept24@gmail.com","suminsured":100000,"insuredpin":"A123456789A"}',
        callbackObj: {
            IssuanceRequestID: 'UAT-AAB8546',
            NTSAResponse: {
                VehicleRegistrationNumber: 'KBC705F',
                ChassisNumber: 'VFY11063012',
                VehicleRegistrationYear: '',
                EngineNumber: 'QG15428006',
                VehicleMake: 'NISSAN',
                VehicleModel: 'NA',
                BodyType: 'S.WAGON',
                TypeID: 2,
            },
            IssuanceMessage: 'Please note that the details entered do not match NTSA records',
        },
        success: false,
        Error: [
            {
                errorCode: 'ERR10001',
                errorText: 'Please note that the details entered do not match NTSA records',
            },
        ],
        APIRequestNumber: 'UAT-OJL7217',
        DMVICRefNo: null,
    },
    {
        Inputs: '{"policystartdate":"14/11/2025","policyenddate":"13/11/2026","vehicleregistrationnumber":"KBC705F"}',
        callbackObj: {},
        success: false,
        Error: [
            {
                errorCode: 'ER0016',
                errorText: 'No Records Found',
            },
        ],
        APIRequestNumber: 'UAT-OJL7193',
        DMVICRefNo: null,
    },
    {
        Inputs: '{"membercompanyid":49,"typeofcover":200,"policyholder":"SA","policynumber":"SAPOL123","commencingdate":"05/10/2025","expiringdate":"13/12/2025","registrationnumber":"KBC705F","chassisnumber":"LLCLPSIA381C1841","phonenumber":"708312406","bodytype":"S.WAGON","vehiclemake":"NISSAN","vehiclemodel":"NA","email":"iconcept24@gmail.com","suminsured":100000,"insuredpin":"A123456789A"}',
        callbackObj: {},
        success: false,
        Error: [
            {
                errorCode: 'ER004',
                errorText: ' Commencing Date is not valid',
            },
        ],
        APIRequestNumber: 'UAT-OJL7242',
        DMVICRefNo: null,
    },
    {
        Inputs: {
            CertificateNumber: 'C27400610',
        },
        callbackObj: {},
        success: false,
        Error: [
            {
                errorCode: 'ER009',
                errorText: 'Invalid CertificateNo',
            },
        ],
        APIRequestNumber: 'UAT-OJL7243',
        DMVICRefNo: null,
    },
    {
        Inputs: '{"certificatenumber":"C27400610","cancelreasonid":20}',
        callbackObj: {},
        success: false,
        Error: [
            {
                errorCode: 'ER004',
                errorText: 'Certificate Number is not valid',
            },
        ],
        APIRequestNumber: 'UAT-OJL7248',
        DMVICRefNo: null,
    },
    {
        Inputs: '{"membercompanyid":49,"typeofcover":200,"policyholder":"SA","policynumber":"SAPOL123","commencingdate":"05/12/2025","expiringdate":"112/123/2025","registrationnumber":"KBC705DF","chassisnumber":"ZNE100081633","phonenumber":"708312406","bodytype":"S.WAGON","vehiclemake":"TOYOTA","vehiclemodel":"WISH","email":"iconcept24@gmail.com","suminsured":100000,"insuredpin":"A123456789A"}',
        callbackObj: {},
        success: false,
        Error: [
            {
                errorCode: 'ER003',
                errorText: 'Expiring Date is not valid',
            },
            {
                errorCode: 'ER0011',
                errorText: 'COMMENCING DATE should be greater than EXPIRING DATE',
            },
        ],
        APIRequestNumber: 'UAT-OJL7334',
        DMVICRefNo: null,
    },
];

const DMVIC_STATUS_CODES = {
    SUCCESS: 200,
    FAILED: 400,
};

export {
    DMVIC_STATUS_CODES,
    sampleDMVICFailedResponses,
    sampleFailedAuthResponse,
    sampleSuccessAuthResponse,
};

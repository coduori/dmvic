export interface SecretConfig {
    username: string;
    password: string;
    clientid: string;
    environment: 'sandbox' | 'production';
    includeoptionaldata: boolean;
}

export interface ApiConfig {
    baseUrl: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

export interface AuthenticationResponse {
    token: string;
    expiresIn: number;
    tokenType: string;
}

export interface CertificateResponse {
    certificateId: string;
    certificateNumber: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
}

export interface StockStatusResponse {
    availableStock: number;
    totalAllocated: number;
    lastUpdated: string;
}

export interface InsuranceStatusResponse {
    isValid: boolean;
    policyStatus: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED';
    expiryDate: string;
    certificateNumber?: string;
}

export interface CertificateVerificationResponse {
    isValid: boolean;
    certificateDetails?: {
        certificateNumber: string;
        registrationNumber: string;
        effectiveDate: string;
        expiryDate: string;
        insurer: string;
    };
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    statusCode?: number;
}

export enum Insurer {
    AIG = 'AIG',
    AMACO = 'AMACO',
    APA = 'APA',
    BRITAM_INSURANCE = 'BRITAM_INSURANCE',
    CANNON = 'CANNON',
    CIC = 'CIC',
    DEFINITE_INSURANCE = 'DEFINITE_INSURANCE',
    DIRECTLINE = 'DIRECTLINE',
    FIDELITY_INSURANCE = 'FIDELITY_INSURANCE',
    FIRST_ASSURANCE = 'FIRST_ASSURANCE',
    GA_INSURANCE = 'GA_INSURANCE',
    GEMINIA = 'GEMINIA',
    HERITAGE = 'HERITAGE',
    ICEA_LION = 'ICEA_LION',
    KENINDIA = 'KENINDIA',
    INTRAAFRICA = 'INTRAAFRICA',
    JUBILEE_ALLIANZ = 'JUBILEE_ALLIANZ',
    KENYA_ALLIANCE = 'KENYA_ALLIANCE',
    KENYA_ORIENT = 'KENYA_ORIENT',
    MADISON = 'MADISON',
    MAYFAIR = 'MAYFAIR',
    MUA = 'MUA',
    MONARCH = 'MONARCH',
    OLD_MUTUAL = 'OLD_MUTUAL',
    OCCIDENTAL = 'OCCIDENTAL',
    PACIS = 'PACIS',
    PIONEER = 'PIONEER',
    SANLAM = 'SANLAM',
    STAR_DISCOVER = 'STAR_DISCOVER',
    TAKAFUL = 'TAKAFUL',
    TRIDENT = 'TRIDENT',
}

export enum MotorClass {
    CLASS_A = 'A',
    CLASS_B = 'B',
    CLASS_C = 'C',
    CLASS_D = 'D',
}

export enum CertificateType {
    PSV_UNMARKED = 'PSV_UNMARKED',
    PRIVATE_MOTOR_CYCLE = 'PRIVATE_MOTOR_CYCLE',
    TAXI = 'TAXI',
    PSV_MOTOR_CYCLE = 'PSV_MOTOR_CYCLE',
    COMMERCIAL_MOTOR_CYCLE = 'COMMERCIAL_MOTOR_CYCLE',
}

export enum CoverType {
    COMP = 'COMP',
    TPO = 'TPO',
    TPTF = 'TPTF',
}

export enum VehicleType {
    OWN_GOODS = 'OWN_GOODS',
    GENERAL_CARTAGE = 'GENERAL_CARTAGE',
    INSTITUTIONAL_VEHICLE = 'INSTITUTIONAL_VEHICLE',
    SPECIAL_VEHICLE = 'SPECIAL_VEHICLE',
    LIQUID_CARRYING_TANKERS = 'LIQUID_CARRYING_TANKERS',
    ROAD_RISK_MOTOR_TRADE = 'ROAD_RISK_MOTOR_TRADE',
}

export enum CancellationReason {
    INSURED_REQUESTED = 'INSURED_REQUESTED',
    AMEND_PASSENGER_COUNT = 'AMEND_PASSENGER_COUNT',
    CHANGE_SCOPE_OF_COVER = 'CHANGE_SCOPE_OF_COVER',
    POLICY_NOT_TAKEN_UP = 'POLICY_NOT_TAKEN_UP',
    VEHICLE_SOLD = 'VEHICLE_SOLD',
    AMEND_INSURED_DETAILS = 'AMEND_INSURED_DETAILS',
    AMEND_VEHICLE_DETAILS = 'AMEND_VEHICLE_DETAILS',
    SUSPECTED_FRAUD = 'SUSPECTED_FRAUD',
    NON_PAYMENT = 'NON_PAYMENT',
    MISSING_KYC = 'MISSING_KYC',
    GOVERNMENT_REQUEST = 'GOVERNMENT_REQUEST',
    SUBJECT_MATTER_CEASED = 'SUBJECT_MATTER_CEASED',
    CHANGE_PERIOD_OF_INSURANCE = 'CHANGE_PERIOD_OF_INSURANCE',
    INSURER_DECLINED_COVER = 'INSURER_DECLINED_COVER',
    WRITTEN_OFF = 'WRITTEN_OFF',
    STOLEN = 'STOLEN',
}

export interface CertificateRequestPayload {
    insurer: Insurer;
    motorClass: MotorClass;
    certificateType?: CertificateType;
    coverType: CoverType;
    policyHolderFullName: string;
    policyNumber: string;
    commencingDate: string;
    expiringDate: string;
    passengerCount?: number;
    recipientEmail: string;
    vehicleYearOfManufacture?: number;
    vehicleRegistrationNumber?: string;
    vehicleEngineNumber?: string;
    vehicleChassisNumber: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleValue?: number;
    recipientPhoneNumber: number;
    vehicleBodyType?: string;
    policyHolderKRAPIN?: string;
    policyHolderHudumaNumber?: string;
    vehicleTonnage?: number;
    vehicleType?: VehicleType;
}

export interface CertificateConfig {
    sslKey: string;
    sslCert: string;
}

export interface InitializeConfig {
    secrets: SecretConfig;
    certificates: CertificateConfig;
}

// Main API functions
export function initialize(config: InitializeConfig): Promise<void>;
export function authenticate(): Promise<ApiResponse<unknown>>;
export function checkStockStatus(
    authToken: string,
    insurer: Insurer
): Promise<ApiResponse<unknown>>;
export function requestInsuranceCertificate(
    authToken: string,
    certificateRequestPayload: CertificateRequestPayload,
    motorClass: MotorClass
): Promise<ApiResponse<unknown>>;
export function getCertificatePdf(
    authToken: string,
    certificateNumber: string
): Promise<ApiResponse<unknown>>;
export function cancelCertificate(
    authToken: string,
    certificateNumber: string,
    cancellationReason: CancellationReason
): Promise<ApiResponse<unknown>>;

export interface VehicleIdentifier {
    registrationNumber?: string;
    chassisNumber?: string;
}

export function checkInsuranceStatus(
    authToken: string,
    vehicleIdentifier: VehicleIdentifier
): Promise<ApiResponse<unknown>>;

export interface CertificateVerificationPayload {
    certificateNumber: string;
    vehicleRegistration?: string;
    chassisNumber?: string;
}

export function verifyInsuranceCertificate(
    authToken: string,
    payload: CertificateVerificationPayload
): Promise<ApiResponse<unknown>>;

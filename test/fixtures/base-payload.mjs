import Chance from 'chance';

import { COVER_TYPE_OPTIONS, INSURERS, MOTOR_CLASS_OPTIONS } from '../../lib/utils/constants.mjs';
import { getISOAnnualExpiry } from '../../lib/utils/standard-date-format.mjs';
import { cryptoPickOne } from '../random-pick.mjs';

const chance = new Chance();

const vehicleMakes = {
    Toyota: ['Corolla', 'Hilux', 'Prado', 'Rav4'],
    Nissan: ['Sunny', 'Navara', 'X-Trail'],
    Honda: ['Civic', 'CR-V', 'Accord'],
    Mercedes: ['C200', 'E350', 'GLE'],
    BMW: ['X3', 'X5', '320i'],
};

chance.mixin({
    vehicleRegistration: () => {
        const secondLetterOptions = ['A', 'B', 'C', 'D'];
        const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            .split('')
            .filter((l) => l !== 'I' && l !== 'O');

        const second = cryptoPickOne(secondLetterOptions);

        const third = cryptoPickOne(allLetters);
        const last = cryptoPickOne(allLetters);

        const digits = chance.string({ length: 3, pool: '0123456789' });

        return `K${second}${third} ${digits}${last}`;
    },
    vehicleMake: () => cryptoPickOne(Object.keys(vehicleMakes)),
    vehicleModel: (vehicleMake) => {
        const validMake =
            vehicleMake && vehicleMakes[vehicleMake]
                ? vehicleMake
                : cryptoPickOne(Object.keys(vehicleMakes));
        return cryptoPickOne(vehicleMakes[validMake]);
    },
});

const generateValidCommencingDate = () => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(
        futureDate.getDate() + chance.integer({ min: 0, max: 365 - futureDate.getDate() })
    );
    return futureDate.toISOString().split('T')[0];
};

const getVehicleBodyType = (motorClass) => {
    const VEHICLE_BODY_TYPES = {
        A: ['Bus', 'Minibus', 'van'],
        B: ['Lorry', 'truck', 'Pickup'],
        C: ['sedan', 'station wagon', 'SUV'],
        D: ['commuter', 'sportsbike', 'scooter', 'three-wheelers'],
    };
    return chance.pickone(VEHICLE_BODY_TYPES[motorClass]);
};

// eslint-disable-next-line max-lines-per-function
const getBaseRequestPayload = (overrides = {}) => {
    let {
        insurer = cryptoPickOne(Object.keys(INSURERS)),
        motorClass,
        coverType = cryptoPickOne(Object.keys(COVER_TYPE_OPTIONS)),
        policyHolderFullName = chance.name(),
        policyNumber = `TEST/POLICY/NUMBER/${chance.integer({ min: 1000, max: 9999 })}`,
        commencingDate = generateValidCommencingDate(),
        expiringDate = overrides.expiringDate ||
            getISOAnnualExpiry(new Date(commencingDate)).toISOString().split('T')[0],
        recipientEmail = chance.email(),
        recipientPhoneNumber = chance.integer({ min: 700000000, max: 799999999 }),
        vehicleYearOfManufacture = chance.year({ min: 1900, max: new Date().getFullYear() }),
        vehicleRegistrationNumber = chance.vehicleRegistration(),
        vehicleMake = chance.vehicleMake(),
        vehicleModel = chance.vehicleModel(overrides.vehicleMake || vehicleMake),
        vehicleBodyType,
        vehicleChassisNumber = chance.string({
            length: 15,
            casing: 'upper',
            alpha: true,
            numeric: true,
        }),
    } = overrides;

    if (!('motorClass' in overrides)) {
        motorClass = cryptoPickOne(Object.values(MOTOR_CLASS_OPTIONS));
    }
    if (!(vehicleBodyType in overrides)) {
        vehicleBodyType = getVehicleBodyType(motorClass);
    }
    return {
        insurer,
        motorClass,
        coverType,
        policyHolderFullName,
        policyNumber,
        commencingDate,
        expiringDate,
        recipientEmail,
        recipientPhoneNumber,
        vehicleYearOfManufacture,
        vehicleRegistrationNumber,
        vehicleMake,
        vehicleModel,
        vehicleChassisNumber,
        vehicleBodyType,
    };
};

export { getBaseRequestPayload };

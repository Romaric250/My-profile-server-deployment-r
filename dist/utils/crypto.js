"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecondaryId = exports.generateUniqueConnectLink = exports.generateProfileAccessToken = exports.generateReferralCode = void 0;
exports.generateOTP = generateOTP;
/**
 * Utility functions for cryptographic operations
 */
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
/**
 * Generates a random OTP (One-Time Password) of specified length
 * @param length The length of the OTP to generate (default: 6)
 * @returns A string containing the generated OTP
 */
function generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}
/**
 * Generates a unique referral code
 * @param length Length of the referral code (default: 8)
 * @returns A unique referral code string
 */
const generateReferralCode = (length = 8) => {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking characters like I, 1, O, 0
    let result = '';
    // Use Node.js crypto module for server-side random generation
    const crypto = require('crypto');
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charset.length);
        result += charset[randomIndex];
    }
    return result;
};
exports.generateReferralCode = generateReferralCode;
/**
 * Generates a secure JWT access token for profile API access with no expiry
 * @param profileId The ID of the profile
 * @returns A JWT token with no expiration
 */
const generateProfileAccessToken = (profileId) => {
    // Create a JWT token with the profile ID and no expiration
    return jsonwebtoken_1.default.sign({
        profileId,
        type: 'profile_access'
    }, config_1.config.JWT_SECRET, {
    // No expiresIn property means the token never expires
    });
};
exports.generateProfileAccessToken = generateProfileAccessToken;
/**
 * Generates a unique connect link for profiles
 * @returns A promise that resolves to a unique connect link string
 */
const generateUniqueConnectLink = async () => {
    // Generate a random string for the connect link
    const randomPart = Math.random().toString(36).substring(2, 10);
    const timestamp = Date.now().toString(36);
    // Combine random part and timestamp for uniqueness
    const connectLink = `mypts-${randomPart}-${timestamp}`;
    // In a real implementation, you might want to check if this link already exists in the database
    // and generate a new one if it does. For simplicity, we're assuming the combination of
    // random string and timestamp will be unique enough.
    return connectLink;
};
exports.generateUniqueConnectLink = generateUniqueConnectLink;
/**
 * Generates a unique secondary ID for profiles
 * The ID starts with a letter and consists of 8 mixed alphanumeric characters
 * @param checkUniqueness Function to check if the generated ID already exists in the database
 * @returns A promise that resolves to a unique secondary ID string
 */
const generateSecondaryId = async (checkUniqueness) => {
    // Characters for the ID (letters and numbers)
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // Use Node.js crypto module for secure random generation
    const crypto = require('crypto');
    let isUnique = false;
    let secondaryId = '';
    // Try to generate a unique ID (max 10 attempts)
    let attempts = 0;
    const maxAttempts = 10;
    while (!isUnique && attempts < maxAttempts) {
        // First character must be a letter
        const firstChar = letters[crypto.randomInt(0, letters.length)];
        // Generate the remaining 7 characters (can be letters or numbers)
        let remainingChars = '';
        for (let i = 0; i < 7; i++) {
            const randomIndex = crypto.randomInt(0, alphanumeric.length);
            remainingChars += alphanumeric[randomIndex];
        }
        secondaryId = firstChar + remainingChars;
        // Check if this ID is unique
        isUnique = await checkUniqueness(secondaryId);
        attempts++;
    }
    if (!isUnique) {
        throw new Error('Failed to generate a unique secondary ID after maximum attempts');
    }
    return secondaryId;
};
exports.generateSecondaryId = generateSecondaryId;

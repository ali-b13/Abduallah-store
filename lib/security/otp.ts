
import { Twilio } from 'twilio';

// Twilio credentials (store these in environment variables for security)
const accountSid = process.env.TWILIO_ACCOUNT_SID ;
const authToken = process.env.TWILIO_AUTH_TOKEN ;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID ; // Twilio Verify service SID

// Initialize Twilio client
const client = new Twilio(accountSid, authToken);

// Function to send OTP via Twilio Verify
export const sendOtpToMobile = async (phoneNumber: string) => {
  try {
    // Request to send OTP using Twilio Verify
    const verification = await client.verify.v2.services(verifyServiceSid as string).verifications.create({
      to: `+967`+phoneNumber,
      channel: 'sms', // Use 'sms' to send OTP via SMS, or 'whatsapp' for WhatsApp
    });

    console.log(`OTP sent to ${phoneNumber}, SID: ${verification.sid}`);
    return verification.sid; // Return verification SID if needed for tracking
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

// Function to verify OTP using Twilio Verify
export const verifyOtpService = async (phoneNumber: string, otp: string): Promise<boolean> => {
  try {
    // Check OTP entered by user
    const verificationCheck = await client.verify.v2.services(verifyServiceSid as string).verificationChecks.create({
      to: phoneNumber,
      code: otp,
    });

    console.log(`OTP verification status for ${phoneNumber}: ${verificationCheck.status}`);
    return verificationCheck.status === 'approved'; // Return true if OTP is valid
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('Failed to verify OTP');
  }
};

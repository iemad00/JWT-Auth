import {
	saveToRedis,
	getFromRedis,
	deleteFromRedis,
} from "../utils/redisClient";
import * as smsService from "../services/smsService";
import { generateOtp } from "../utils/authUtils";

export const sendOtpToPhone = async (phone: string): Promise<void> => {
	const otp = generateOtp();
	await saveToRedis(`otp:${phone}`, otp, 90); // OTP valid for 90 seconds
	await smsService.sendOTP(phone, otp); // Send OTP via SMS
};

export const validateOtp = async (
	phone: string,
	otp: string,
): Promise<boolean> => {
	const storedOtp = await getFromRedis(`otp:${phone}`);
	if (!storedOtp || storedOtp !== otp) return false;

	await deleteFromRedis(`otp:${phone}`);
	return true;
};

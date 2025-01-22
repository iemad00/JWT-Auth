import type { FastifyReply, FastifyRequest } from "fastify";
import {
	createUser,
	findUserByPhone,
	savePasscode,
	findPasscodeByUserId,
} from "../models/userModel";
import {
	saveToRedis,
	getFromRedis,
	deleteFromRedis,
} from "../utils/redisClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as smsService from "../services/smsService";
import otpHelper from "../helpers/otpHelper";
import { validateRequest } from "../utils/validation";
import { SendOtpType } from "../types/sendOtp.type";
import { VerifyOtpType } from "../types/verifyOtp.type";
import { LoginType } from "../types/login.type";
import { RefreshTokenType } from "../types/refreshToken.type";
import {
	Ok,
	BadRequest,
	Unauthorized,
	InternalServerError,
} from "../utils/responseHelper";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const LOGIN_TOKEN_EXPIRY = "5m";
const ACCESS_TOKEN_EXPIRY = "10m";
const REFRESH_TOKEN_EXPIRY = "1d";

// Send OTP
export const sendOtp = async (request: FastifyRequest, reply: FastifyReply) => {
	validateRequest(request.query, SendOtpType);

	try {
		const { phone } = request.query as { phone: string };

		// Generate and save OTP
		const otp = otpHelper.generateOtp();
		await saveToRedis(`otp:${phone}`, otp, 90);

		// Send OTP via SMS
		smsService.sendOTP(phone, otp);

		Ok(reply, "OTP sent successfully");
	} catch (error) {
		InternalServerError(reply, "Failed to send OTP");
	}
};

// Verify OTP
export const verifyOtp = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	validateRequest(request.body, VerifyOtpType);

	try {
		const { phone, otp, name } = request.body as {
			phone: string;
			otp: string;
			name?: string;
		};

		// Validate OTP
		const storedOtp = await getFromRedis(`otp:${phone}`);
		if (!storedOtp || storedOtp !== otp) {
			return BadRequest(reply, "Invalid or expired OTP");
		}
		await deleteFromRedis(`otp:${phone}`);

		// Get or create user
		let user = await findUserByPhone(phone);
		if (!user) {
			user = await createUser(phone, name || "Unknown User");
		}

		const passcode = await findPasscodeByUserId(user.id);
		const firstLogin = !passcode;

		// Generate a login token
		const loginToken = jwt.sign({ userId: user.id, firstLogin }, JWT_SECRET, {
			expiresIn: LOGIN_TOKEN_EXPIRY,
		});

		Ok(reply, "OTP verified", { loginToken, firstLogin });
	} catch (error) {
		InternalServerError(reply, "Failed to verify OTP");
	}
};

// Login
export const login = async (request: FastifyRequest, reply: FastifyReply) => {
	validateRequest(request.body, LoginType);

	try {
		const { loginToken, passcode } = request.body as {
			loginToken: string;
			passcode: string;
		};

		// Verify login token
		const decoded = jwt.verify(loginToken, JWT_SECRET) as {
			userId: number;
			firstLogin: boolean;
		};

		const { userId, firstLogin } = decoded;

		if (firstLogin) {
			const hashedPasscode = await bcrypt.hash(passcode, 10);
			await savePasscode(userId, hashedPasscode);
		} else {
			const userPasscode = await findPasscodeByUserId(userId);
			const isMatch = await bcrypt.compare(
				passcode,
				userPasscode?.hashedPasscode || "",
			);

			if (!isMatch) {
				return Unauthorized(reply);
			}
		}

		// Generate JWT tokens
		const accessToken = jwt.sign({ userId }, JWT_SECRET, {
			expiresIn: ACCESS_TOKEN_EXPIRY,
		});
		const refreshToken = jwt.sign({ userId }, JWT_SECRET, {
			expiresIn: REFRESH_TOKEN_EXPIRY,
		});

		Ok(reply, "Login successful", { accessToken, refreshToken });
	} catch (error) {
		Unauthorized(reply);
	}
};

// Refresh Token
export const refreshToken = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	validateRequest(request.body, RefreshTokenType);

	try {
		const { refreshToken, passcode } = request.body as {
			refreshToken: string;
			passcode: string;
		};

		// Verify the refresh token
		const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: number };

		const { userId } = decoded;

		// Fetch the user's stored passcode
		const userPasscode = await findPasscodeByUserId(userId);
		if (!userPasscode) {
			return Unauthorized(reply);
		}

		const isPasscodeValid = await bcrypt.compare(
			passcode,
			userPasscode.hashedPasscode,
		);
		if (!isPasscodeValid) {
			return Unauthorized(reply);
		}

		// Generate a new access token
		const accessToken = jwt.sign({ userId }, JWT_SECRET, {
			expiresIn: ACCESS_TOKEN_EXPIRY,
		});

		Ok(reply, "Token refreshed successfully", { accessToken });
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			Unauthorized(reply);
		} else {
			Unauthorized(reply);
		}
	}
};

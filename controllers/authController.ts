import type { FastifyReply, FastifyRequest } from "fastify";
import { validateRequest } from "../utils/validation";
import {
	findUserByPhone,
	createUser,
	savePasscode,
	findPasscodeByUserId,
} from "../models/userModel";
import { sendOtpToPhone, validateOtp } from "../services/otpService";
import {
	createJwtToken,
	verifyJwtToken,
	hashPasscode,
	comparePasscodes,
	ACCESS_TOKEN_EXPIRY,
	REFRESH_TOKEN_EXPIRY,
	LOGIN_TOKEN_EXPIRY,
} from "../utils/authUtils";
import {
	Ok,
	BadRequest,
	Unauthorized,
	InternalServerError,
} from "../utils/responseHelper";
import { SendOtpType } from "../types/sendOtp.type";
import { VerifyOtpType } from "../types/verifyOtp.type";
import { LoginType } from "../types/login.type";
import { RefreshTokenType } from "../types/refreshToken.type";

export const sendOtp = async (request: FastifyRequest, reply: FastifyReply) => {
	validateRequest(request.query, SendOtpType);

	try {
		const { phone } = request.query as { phone: string };
		await sendOtpToPhone(phone);
		Ok(reply, "OTP sent successfully");
	} catch {
		InternalServerError(reply, "Failed to send OTP");
	}
};

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

		if (!(await validateOtp(phone, otp))) {
			return BadRequest(reply, "Invalid or expired OTP");
		}

		let user = await findUserByPhone(phone);
		if (!user) {
			user = await createUser(phone, name || "Unknown User");
		}

		const passcode = await findPasscodeByUserId(user.id);
		const firstLogin = !passcode;

		const loginToken = createJwtToken(
			{ userId: user.id, firstLogin },
			LOGIN_TOKEN_EXPIRY,
		);
		Ok(reply, "OTP verified", { loginToken, firstLogin });
	} catch {
		InternalServerError(reply, "Failed to verify OTP");
	}
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
	validateRequest(request.body, LoginType);

	try {
		const { loginToken, passcode } = request.body as {
			loginToken: string;
			passcode: string;
		};

		const { userId, firstLogin } = verifyJwtToken(loginToken);

		if (firstLogin) {
			const hashedPasscode = await hashPasscode(passcode);
			await savePasscode(userId, hashedPasscode);
		} else {
			const userPasscode = await findPasscodeByUserId(userId);
			if (
				!userPasscode ||
				!(await comparePasscodes(passcode, userPasscode.hashedPasscode))
			) {
				return Unauthorized(reply);
			}
		}

		const accessToken = createJwtToken({ userId }, ACCESS_TOKEN_EXPIRY);
		const refreshToken = createJwtToken({ userId }, REFRESH_TOKEN_EXPIRY);

		Ok(reply, "Login successful", { accessToken, refreshToken });
	} catch {
		Unauthorized(reply);
	}
};

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

		const { userId } = verifyJwtToken(refreshToken);

		const userPasscode = await findPasscodeByUserId(userId);
		if (
			!userPasscode ||
			!(await comparePasscodes(passcode, userPasscode.hashedPasscode))
		) {
			return Unauthorized(reply);
		}

		const accessToken = createJwtToken({ userId }, ACCESS_TOKEN_EXPIRY);
		Ok(reply, "Token refreshed successfully", { accessToken });
	} catch {
		Unauthorized(reply);
	}
};

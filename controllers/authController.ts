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
import { Type } from "@sinclair/typebox";
import { validateRequest } from "../utils/validation";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const LOGIN_TOKEN_EXPIRY = "10m";
const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "7d";

// Types Definitions for Validation
const SendOtpType = Type.Object({
	phone: Type.String({ minLength: 10, maxLength: 15 }),
});

const VerifyOtpType = Type.Object({
	phone: Type.String({ minLength: 10, maxLength: 15 }),
	otp: Type.String({ minLength: 4, maxLength: 4 }),
	name: Type.Optional(Type.String({ maxLength: 255 })),
});

const LoginType = Type.Object({
	loginToken: Type.String(),
	passcode: Type.Optional(Type.String({ minLength: 4, maxLength: 10 })),
});

// Send OTP
export const sendOtp = async (request: FastifyRequest, reply: FastifyReply) => {
	validateRequest(request.query, SendOtpType);

	const { phone } = request.query as { phone: string };

	// Generate and save OTP
	const otp = otpHelper.generateOtp();
	await saveToRedis(`otp:${phone}`, otp, 90);

	// Send OTP via SMS
	smsService.sendOTP(phone, otp);

	reply.send({ success: true, message: "OTP sent successfully." });
};

// Verify OTP
export const verifyOtp = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	validateRequest(request.body, VerifyOtpType);

	const { phone, otp, name } = request.body as {
		phone: string;
		otp: string;
		name?: string;
	};

	// Validate OTP
	const storedOtp = await getFromRedis(`otp:${phone}`);
	if (!storedOtp || storedOtp !== otp) {
		return reply
			.status(400)
			.send({ success: false, message: "Invalid or expired OTP." });
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

	reply.send({
		success: true,
		message: "OTP verified.",
		loginToken,
		firstLogin,
	});
};

// Login
export const login = async (request: FastifyRequest, reply: FastifyReply) => {
	validateRequest(request.body, LoginType);

	const { loginToken, passcode } = request.body as {
		loginToken: string;
		passcode?: string;
	};

	try {
		// Verify login token
		const decoded = jwt.verify(loginToken, JWT_SECRET) as {
			userId: number;
			firstLogin: boolean;
		};

		const { userId, firstLogin } = decoded;

		if (firstLogin) {
			if (!passcode) {
				return reply
					.status(400)
					.send({ message: "Passcode is required for first login." });
			}
			const hashedPasscode = await bcrypt.hash(passcode, 10);
			await savePasscode(userId, hashedPasscode);
		} else {
			if (!passcode) {
				return reply.status(400).send({ message: "Passcode is required." });
			}

			const userPasscode = await findPasscodeByUserId(userId);
			const isMatch = await bcrypt.compare(
				passcode,
				userPasscode?.hashedPasscode || "",
			);

			if (!isMatch) {
				return reply.status(400).send({ message: "Invalid passcode." });
			}
		}

		// Generate JWT tokens
		const accessToken = jwt.sign({ userId }, JWT_SECRET, {
			expiresIn: ACCESS_TOKEN_EXPIRY,
		});
		const refreshToken = jwt.sign({ userId }, JWT_SECRET, {
			expiresIn: REFRESH_TOKEN_EXPIRY,
		});

		reply.send({
			success: true,
			message: "Login successful.",
			accessToken,
			refreshToken,
		});
	} catch (error) {
		reply
			.status(401)
			.send({ success: false, message: "Invalid or expired login token." });
	}
};

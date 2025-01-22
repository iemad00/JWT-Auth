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

const JWT_SECRET = process.env.JWT_SECRET as string;
const LOGIN_TOKEN_EXPIRY = "10m"; // 10 minutes
const ACCESS_TOKEN_EXPIRY = "1h"; // 1 hour
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

export const sendOtp = async (request: FastifyRequest, reply: FastifyReply) => {
	const { phone } = request.query as { phone: string };
	if (!phone)
		return reply.status(400).send({ message: "Phone number is required" });

	// Generate a 4-digit OTP
	const otp = otpHelper.generateOtp();

	// Save OTP to Redis
	await saveToRedis(`otp:${phone}`, otp, 90); // OTP valid for 90 seconds

	// Send OTP via SMS
	smsService.sendOTP(phone, otp);

	reply.send({ success: true, message: "OTP sent successfully." });
};

export const verifyOtp = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	const { phone, name, otp } = request.body as {
		phone: string;
		name?: string;
		otp: string;
	};

	// Fetch OTP from Redis
	const storedOtp = await getFromRedis(`otp:${phone}`);
	if (!storedOtp || storedOtp !== otp) {
		return reply.status(400).send({ message: "Invalid or expired OTP." });
	}

	// Delete OTP from Redis
	await deleteFromRedis(`otp:${phone}`);

	// Find user by phone
	let user = await findUserByPhone(phone);
	if (!user) {
		// If user does not exist, create a new user
		user = await createUser(phone, name || "Unknown User");
	}

	// Check if the user has a passcode
	const passcode = await findPasscodeByUserId(Number(user.id));

	const firstLogin = !passcode;

	// Generate a login token (JWT)
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

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
	const { loginToken, passcode } = request.body as {
		loginToken: string;
		passcode?: string;
	};

	try {
		// Verify the login token
		const decoded = jwt.verify(loginToken, JWT_SECRET) as {
			userId: number;
			firstLogin: boolean;
		};
		const { userId, firstLogin } = decoded;

		if (firstLogin) {
			if (!passcode)
				return reply
					.status(400)
					.send({ message: "Passcode is required for first login." });

			const hashedPasscode = await bcrypt.hash(passcode, 10);
			await savePasscode(userId, hashedPasscode);
		} else {
			const userPasscode = await findPasscodeByUserId(userId);
			if (!passcode) {
				return reply.status(400).send({ message: "Passcode is required." });
			}
			const isMatch = await bcrypt.compare(
				passcode,
				userPasscode?.hashedPasscode,
			);

			if (!isMatch)
				return reply.status(400).send({ message: "Invalid passcode." });
		}

		// Generate access and refresh tokens
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
		console.error(error);
		return reply
			.status(401)
			.send({ success: false, message: "Invalid or expired login token." });
	}
};

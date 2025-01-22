import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
export const ACCESS_TOKEN_EXPIRY = "10m";
export const REFRESH_TOKEN_EXPIRY = "1d";
export const LOGIN_TOKEN_EXPIRY = "5m";

export const generateOtp = (): string =>
	Math.floor(1000 + Math.random() * 9000).toString();

export const createJwtToken = (payload: object, expiry: string): string =>
	jwt.sign(payload, JWT_SECRET, { expiresIn: expiry });

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const verifyJwtToken = (token: string): any =>
	jwt.verify(token, JWT_SECRET);

export const hashPasscode = async (passcode: string): Promise<string> => {
	return bcrypt.hash(passcode, 10);
};

export const comparePasscodes = async (
	plainText: string,
	hashed: string,
): Promise<boolean> => {
	return bcrypt.compare(plainText, hashed);
};

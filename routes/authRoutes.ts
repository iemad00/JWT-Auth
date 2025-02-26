import type { FastifyInstance } from "fastify";
import {
	sendOtp,
	verifyOtp,
	login,
	refreshToken,
} from "../controllers/authController";

export default async function authRoutes(app: FastifyInstance) {
	app.get("/send", sendOtp);
	app.post("/verify", verifyOtp);
	app.post("/login", login);
	app.post("/refresh", refreshToken);
}

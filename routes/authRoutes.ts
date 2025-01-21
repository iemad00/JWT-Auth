import type { FastifyInstance } from "fastify";
import { register, login, getProfile } from "../controllers/authController";

export default async function authRoutes(app: FastifyInstance) {
	app.post("/register", register);
	app.post("/login", login);
	app.get("/profile", getProfile);
}

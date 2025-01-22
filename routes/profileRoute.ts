import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getProfile } from "../controllers/profileController";

export default async function authRoutes(app: FastifyInstance) {
	app.get("/", { preHandler: [authMiddleware] }, getProfile);
}

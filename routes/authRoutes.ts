import type { FastifyInstance } from "fastify";
import { sendOtp, verifyOtp } from "../controllers/authController";

export default async function authRoutes(app: FastifyInstance) {
  app.get("/send", sendOtp);
  app.post("/verify", verifyOtp);
}

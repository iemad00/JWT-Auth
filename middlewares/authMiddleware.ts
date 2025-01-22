import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authMiddleware = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	try {
		const authorization = request.headers.authorization;

		if (!authorization) {
			return reply.status(401).send({
				success: false,
				message: "Authorization header missing",
			});
		}

		const token = authorization.replace("Bearer ", "");

		const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

		// Attach userId to the request for use in the route handler
		request.user = { id: decoded.userId };
	} catch (error) {
		return reply.status(401).send({
			success: false,
			message: "Unauthorized",
		});
	}
};

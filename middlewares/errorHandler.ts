import type { FastifyReply, FastifyRequest } from "fastify";
import { ValidationError } from "../utils/validation";

export const errorHandler = (
	error: Error,
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	if (error instanceof ValidationError) {
		reply.status(400).send({
			success: false,
			message: "Validation failed",
			errors: error.errors,
		});
	} else {
		reply.status(500).send({
			success: false,
			message: "Internal Server Error",
		});
	}
};

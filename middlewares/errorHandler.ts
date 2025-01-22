import type { FastifyReply, FastifyRequest } from "fastify";
import { ValidationError } from "../utils/validation";
import { BadRequest, InternalServerError } from "../utils/responseHelper";

export const errorHandler = (
	error: Error,
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	if (error instanceof ValidationError) {
		BadRequest(reply, "Validation failed", error.errors);
	} else {
		InternalServerError(reply, "Internal Server Error");
	}
};

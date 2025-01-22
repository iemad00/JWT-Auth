import type { FastifyReply } from "fastify";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const Ok = (reply: FastifyReply, message: string, data?: any) => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const response: { success: true; message: string; data?: any } = {
		success: true,
		message,
	};

	if (data !== undefined) {
		response.data = data;
	}

	reply.status(200).send(response);
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const Created = (reply: FastifyReply, message: string, data?: any) => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const response: { success: true; message: string; data?: any } = {
		success: true,
		message,
	};

	if (data !== undefined) {
		response.data = data;
	}

	reply.status(201).send(response);
};

export const BadRequest = (
	reply: FastifyReply,
	message: string,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	errors?: any,
) => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const response: { success: false; message: string; errors?: any } = {
		success: false,
		message,
	};

	if (errors !== undefined) {
		response.errors = errors;
	}

	reply.status(400).send(response);
};

export const Unauthorized = (reply: FastifyReply) => {
	reply.status(401).send({
		success: false,
		message: "Unauthorized",
	});
};

export const InternalServerError = (
	reply: FastifyReply,
	message: string,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	error?: any,
) => {
	reply.status(500).send({
		success: false,
		message,
		error: error || null,
	});
};

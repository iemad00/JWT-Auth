import type { FastifyReply, FastifyRequest } from "fastify";
import { createUser, findUserByEmail } from "../models/userModel";

interface RegisterRequestBody {
	email: string;
	password: string;
}

export const register = async (
	request: FastifyRequest<{ Body: RegisterRequestBody }>,
	reply: FastifyReply,
) => {
	const email: string = request.body.email;
	const password: string = request.body.password;
	createUser(email, password);
	reply.send({ message: "Register endpoint" });
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
	reply.send({ message: "Login endpoint" });
};

interface ProfileRequestBody {
	email: string;
}

interface ProfileRequestQuery {
	email: string;
}

export const getProfile = async (
	request: FastifyRequest<{ Querystring: ProfileRequestQuery }>,
	reply: FastifyReply,
) => {
	const email: string = request.query.email;
	const user = await findUserByEmail(email);

	reply.send({ message: "Success", user });
};

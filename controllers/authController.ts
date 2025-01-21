import type { FastifyReply, FastifyRequest } from "fastify";

export const register = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	reply.send({ message: "Register endpoint" });
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
	reply.send({ message: "Login endpoint" });
};

export const getProfile = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	reply.send({ message: "Profile endpoint" });
};

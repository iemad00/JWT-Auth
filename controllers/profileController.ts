import type { FastifyReply, FastifyRequest } from "fastify";
import { findUserById } from "../models/userModel";

export const getProfile = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	try {
		const userId = request.user?.id;
		if (!userId) {
			return reply.status(400).send({
				success: false,
				message: "User ID not found in request",
			});
		}

		const user = await findUserById(userId);

		if (!user) {
			return reply.status(404).send({
				success: false,
				message: "User not found",
			});
		}

		reply.send({
			success: true,
			message: "User profile retrieved successfully",
			profile: {
				id: user.id,
				name: user.name,
				phone: user.phone,
				createdAt: user.createdAt,
			},
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			message: "Failed to retrieve profile",
		});
	}
};

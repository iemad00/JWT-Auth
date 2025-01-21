import { db } from "../db/connection";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const createUser = async (email: string, password: string) => {
	return db.insert(users).values({
		email,
		password,
	});
};

export const findUserByEmail = async (email: string) => {
	return db.select().from(users).where(eq(users.email, email));
};

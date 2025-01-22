import { db } from "../db/connection";
import { users, passcodes } from "../db/schema";
import { eq } from "drizzle-orm";

export const findUserByPhone = async (phone: string) => {
	return (await db.select().from(users).where(eq(users.phone, phone)))[0];
};

export const createUser = async (phone: string, name: string | undefined) => {
	const uid = await db
		.insert(users)
		.values({
			phone,
			name,
		})
		.$returningId();

	// Return the newly created user
	return (await db.select().from(users).where(eq(users.id, uid[0].id)))[0];
};

export const savePasscode = async (userId: number, hashedPasscode: string) => {
	return db.insert(passcodes).values({ userId, hashedPasscode });
};

export const findPasscodeByUserId = async (userId: number) => {
	return (
		await db.select().from(passcodes).where(eq(passcodes.userId, userId))
	)[0];
};

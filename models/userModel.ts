import { db } from "../db/connection";
import { users, passcodes } from "../db/schema";
import { eq } from "drizzle-orm";
import type { UserInfo } from "../types/userInfo.type";

export const findUserByPhone = async (phone: string) => {
	return (await db.select().from(users).where(eq(users.phone, phone)))[0];
};

export const findUserById = async (id: number) => {
	return (await db.select().from(users).where(eq(users.id, id)))[0];
};

export const createUser = async (phone: string) => {
	const uid = await db
		.insert(users)
		.values({
			phone,
		})
		.$returningId();

	// Return the newly created user
	return (await db.select().from(users).where(eq(users.id, uid[0].id)))[0];
};

export const updateUser = async (id: number, userInfo: UserInfo) => {
	return db
		.update(users)
		.set({ ...userInfo })
		.where(eq(users.id, id));
};

export const savePasscode = async (userId: number, hashedPasscode: string) => {
	return db.insert(passcodes).values({ userId, hashedPasscode });
};

export const findPasscodeByUserId = async (userId: number) => {
	return (
		await db.select().from(passcodes).where(eq(passcodes.userId, userId))
	)[0];
};

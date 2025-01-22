import {
	mysqlTable,
	serial,
	varchar,
	timestamp,
	int,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }),
	email: varchar("email", { length: 255 }),
	phone: varchar("phone", { length: 20 }).notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const passcodes = mysqlTable("passcodes", {
	id: serial("id").primaryKey(),
	userId: int("user_id").notNull(), // Reference to users table
	hashedPasscode: varchar("hashed_passcode", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

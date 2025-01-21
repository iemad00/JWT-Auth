import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2";

const pool = createPool({
	uri: process.env.DATABASE_URL as string,
});

export const db = drizzle(pool);

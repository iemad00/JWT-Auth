import Fastify from "fastify";
import authRoutes from "./routes/authRoutes";
import { db } from "./db/connection";

const app = Fastify();

(async () => {
	try {
		await db.execute("SELECT 1");
		console.log("Database connected successfully");
	} catch (error) {
		console.error("Failed to connect to the database:", error);
		process.exit(1); // Exit the app if the database connection fails
	}
})();

// Register Routes
app.register(authRoutes, { prefix: "/auth" });

export default app;

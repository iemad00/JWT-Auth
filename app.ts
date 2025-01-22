import Fastify from "fastify";
import authRoutes from "./routes/authRoutes";
import { db } from "./db/connection";
import { errorHandler } from "./middlewares/errorHandler";
import profileRoutes from "./routes/profileRoute";

const app = Fastify();

// Register Error Handler
app.setErrorHandler(errorHandler);

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
app.register(profileRoutes, { prefix: "/profile" });

export default app;

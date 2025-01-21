import Fastify from "fastify";
import authRoutes from "./routes/authRoutes";

const app = Fastify();

// Register Routes
app.register(authRoutes, { prefix: "/auth" });

export default app;

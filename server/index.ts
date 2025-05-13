import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, log, serveStatic } from "./vite";
import { createServer } from "http";

/**
 * Main server entry point that sets up the Express app
 * and starts listening for requests.
 */
(async () => {
  // Create Express app
  const app = express();

  // Apply middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      const elapsed = Date.now() - start;
      if (req.path.startsWith("/api")) {
        log(`${req.method} ${req.path} ${res.statusCode} in ${elapsed}ms`);
      }
    });
    next();
  });

  // Register API routes and get the HTTP server
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("server/index.ts: Uncaught error:", err);
    const status = (err as any).status || (err as any).statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Setup Vite in development mode or serve static files in production
  if (app.get("env") === "development") {
    console.log("server/index.ts: Setting up Vite in development mode");
    await setupVite(app, server);
  } else {
    console.log("server/index.ts: Setting up static file serving for production");
    serveStatic(app);
  }

  // Start the server
  const port = 7000;
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`server/index.ts: Server running and serving on port ${port}`);
  });
})();
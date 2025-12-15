import path from "path";
import { createServer } from "./index";
import * as express from "express";
import * as fs from "fs";
import { fileURLToPath } from "url";

const app = createServer();
const port = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve SPA path - handles both local dev and Vercel/production
let distPath: string;
if (process.env.VERCEL) {
  // Vercel deployment - spa is in dist/spa relative to root
  distPath = path.join(__dirname, "../../dist/spa");
} else {
  // Local dev - spa is in dist/spa relative to project root
  distPath = path.join(__dirname, "../dist/spa");
}

// Ensure the dist/spa folder exists, if not try alternate paths
if (!fs.existsSync(distPath)) {
  const altPath = path.join(__dirname, "../spa");
  if (fs.existsSync(altPath)) {
    distPath = altPath;
  } else {
    console.warn(`⚠️ SPA build directory not found at ${distPath}`);
  }
}

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: "Frontend build not found. Run: npm run build" });
  }
});

// Start server only if not in serverless environment
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
    console.log(`🔧 API: http://localhost:${port}/api`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("🛑 Received SIGTERM, shutting down gracefully");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("🛑 Received SIGINT, shutting down gracefully");
    process.exit(0);
  });
}

// Export app for Vercel serverless environment
export default app;

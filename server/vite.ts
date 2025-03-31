import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Get the actual port from the server
  const address = server.address();
  let port = typeof address === 'object' && address ? address.port : undefined;
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { 
      server,
      clientPort: port, // Use the actual server port for WebSocket connections
      path: '/defense/',
    },
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  // Handle /defense path for the frontend
  app.use(["/defense", "/defense/*"], async (req, res, next) => {
    const url = req.originalUrl;
    
    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
  template = template.replace(
    `src="./src/main.tsx"`,
    `src="./src/main.tsx?v=${nanoid()}"`,
  );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
  
  // Default route for development (fallback)
  app.use("*", async (req, res, next) => {
    // If not starting with /defense, redirect to /defense
    if (!req.originalUrl.startsWith("/defense") && !req.originalUrl.startsWith("/api")) {
      return res.redirect(`/defense${req.originalUrl === "/" ? "" : req.originalUrl}`);
    }
    
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="./src/main.tsx"`,
        `src="./src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files with the correct base path
  app.use('/defense', express.static(distPath));
  
  // Serve static assets without needing the /defense prefix
  app.use(express.static(distPath));

  // Handle API routes first
  app.use("/defense/api/*", (req, res, next) => {
    // Remove /defense from the path and redirect to regular API
    const apiPath = req.originalUrl.replace("/defense/api", "/api");
    req.url = apiPath;
    next('route');
  });

  // Handle /defense routes for frontend
  app.use(["/defense", "/defense/*"], (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  // Redirect root to /defense 
  app.use("/", (req, res) => {
    res.redirect("/defense");
  });

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    // If not starting with /defense, redirect to /defense
    if (!req.originalUrl.startsWith("/defense") && !req.originalUrl.startsWith("/api")) {
      return res.redirect(`/defense${req.originalUrl === "/" ? "" : req.originalUrl}`);
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { AddressInfo } from "net";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add middleware to handle /defense/api requests
app.use('/defense/api/*', (req, res, next) => {
  // Rewrite the URL to strip off the /defense prefix
  req.url = req.url.replace('/defense/api', '/api');
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api") || path.startsWith("/defense/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Function to find an available port dynamically
function findAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number> {
  return new Promise((resolve, reject) => {
    let currentAttempt = 0;
    let currentPort = startPort;

    function tryPort() {
      if (currentAttempt >= maxAttempts) {
        reject(new Error(`Could not find an available port after ${maxAttempts} attempts`));
        return;
      }

      const testServer = createServer();
      
      testServer.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          // Port is in use, try the next one
          currentPort++;
          currentAttempt++;
          tryPort();
        } else {
          // Some other error
          reject(err);
        }
      });

      testServer.once('listening', () => {
        // Found an available port
        const address = testServer.address() as AddressInfo;
        const port = address.port;
        
        // Close the test server
        testServer.close(() => {
          resolve(port);
        });
      });

      // Try to bind to the current port
      testServer.listen(currentPort, 'localhost');
    }

    tryPort();
  });
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  try {
    // Start with the preferred port
    const preferredPort = 5000;
    // Find an available port starting from the preferred port
    const port = await findAvailablePort(preferredPort);
    
    server.listen({
      port,
      host: "localhost",
    }, () => {
      log(`Server running at http://localhost:${port}`);
      
      // Store the port in a global that client code can access
      // @ts-ignore - Add SERVER_PORT to the global window object
      if (typeof global !== 'undefined') {
        global.SERVER_PORT = port;
        // Add a simple API endpoint to get the port
        app.get('/api/port', (req, res) => {
          res.json({ port });
        });
      }
    });
  } catch (error) {
    log(`Failed to start server: ${error}`);
    process.exit(1);
  }
})();

import express, { type Request, Response, NextFunction } from "express";
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import connectPgSimple from 'connect-pg-simple';
import { storage, pool } from './storage'; // Import storage and the exported pool
import { type User } from '@shared/schema'; // Import User type
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { AddressInfo } from "net";

// Augment the NodeJS Global type for TypeScript
declare global {
  namespace NodeJS {
    interface Global {
      SERVER_PORT?: number;
    }
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Session Configuration ---
// Initialize connect-pg-simple with session
const PgSessionStore = connectPgSimple(session);

// Use PgSessionStore with the imported pool
const sessionStore = new PgSessionStore({
    pool : pool,                
    tableName : 'user_sessions', // Optional: specify table name
    createTableIfMissing: true // Optional: auto-create table if needed
});

app.use(session({
    // TODO: Replace 'your-secret-key' with a strong secret from environment variables
    secret: process.env.SESSION_SECRET || 'your-secret-key', 
    // Use the database-backed store
    store: sessionStore,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    cookie: { 
        secure: app.get('env') === 'production', // use secure cookies in production
        httpOnly: true, // prevent client-side JS from reading the cookie
        maxAge: 1000 * 60 * 60 * 24 // 1 day expiration, adjust as needed
    } 
}));

// --- Passport Configuration ---
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            log(`Attempting login for username: ${username}`);
            const user = await storage.getUserByUsername(username);
            if (!user) {
                log(`Login failed: User not found - ${username}`);
                return done(null, false, { message: 'Incorrect username or password.' });
            }
            
            // We need the password hash from the user object, storage should return it for verification
            // The current MemStorage getUserByUsername does return the full user object including password hash
            const isValid = await storage.verifyPassword(password, user.password); 

            if (!isValid) {
                log(`Login failed: Invalid password for user - ${username}`);
                return done(null, false, { message: 'Incorrect username or password.' });
            }

            log(`Login successful for user: ${username} (ID: ${user.id})`);
            // Exclude password from the user object returned to passport/session
            const { password: _, ...userWithoutPassword } = user;
            return done(null, userWithoutPassword as User); 
        } catch (err) {
            log(`Error during authentication for ${username}: ${err}`);
            return done(err);
        }
    }
));

// Store user ID in session
passport.serializeUser((user: any, done) => { 
    process.nextTick(() => {
        done(null, user.id);
    });
});

// Retrieve user object from session using ID
passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await storage.getUser(id);
        // Exclude password from deserialized user object
        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            done(null, userWithoutPassword as User);
        } else {
            done(new Error('User not found during deserialization.'));
        }
    } catch (err) {
        done(err);
    }
});

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
  // --- Register API Routes (Ensure Passport middleware runs BEFORE this) ---
  const server = await registerRoutes(app); // Pass authenticated passport instance

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
      if (typeof globalThis !== 'undefined') {
        // @ts-ignore - Suppress persistent type error for now
        globalThis.SERVER_PORT = port;
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

import type { Express, Request, Response, NextFunction } from "express";
import passport from 'passport';
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertInventoryItemSchema, insertTransferSchema } from "@shared/schema";

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes (Public)
  app.post("/api/auth/login", passport.authenticate('local'), (req: Request, res: Response) => {
    res.json({ user: req.user });
  });

  app.post("/api/auth/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Session destruction error:", destroyErr);
        }
        res.status(200).json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/auth/me", isAuthenticated, (req: Request, res: Response) => {
    res.json({ user: req.user });
  });

  // User routes
  app.get("/api/users", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const items = await storage.getAllInventoryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.get("/api/inventory/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const item = await storage.getInventoryItem(parseInt(req.params.id));
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory item" });
    }
  });

  app.post("/api/inventory", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const itemData = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  // Transfer routes
  app.get("/api/transfers", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const transfers = await storage.getAllTransfers();
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transfers" });
    }
  });

  app.get("/api/transfers/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const transfer = await storage.getTransfer(parseInt(req.params.id));
      if (!transfer) {
        return res.status(404).json({ message: "Transfer not found" });
      }
      res.json(transfer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transfer" });
    }
  });

  app.post("/api/transfers", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const transferData = insertTransferSchema.parse(req.body);
      const transfer = await storage.createTransfer(transferData);
      res.status(201).json(transfer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transfer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transfer" });
    }
  });

  app.patch("/api/transfers/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const transfer = await storage.updateTransferStatus(parseInt(req.params.id), status);
      if (!transfer) {
        return res.status(404).json({ message: "Transfer not found" });
      }
      
      res.json(transfer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update transfer status" });
    }
  });

  // Activity routes
  app.get("/api/activities", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const activities = await storage.getAllActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

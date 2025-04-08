import bcrypt from 'bcrypt';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import * as schema from "@shared/schema"; // Import all schema objects

// --- Neon DB Connection Setup ---
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

// Export the pool for session store usage
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const db = drizzle(pool, { schema });

// --- IStorage Interface (Update getAllUsers return type) ---
export interface IStorage {
  // User operations
  getUser(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  createUser(user: schema.InsertUser): Promise<Omit<schema.User, 'password'>>; // Return type ensures password is not sent back
  verifyPassword(password: string, hash: string): Promise<boolean>;
  getAllUsers(): Promise<Omit<schema.User, 'password'>[]>;
  
  // Inventory operations
  getInventoryItem(id: number): Promise<schema.InventoryItem | undefined>;
  createInventoryItem(item: schema.InsertInventoryItem): Promise<schema.InventoryItem>;
  getAllInventoryItems(): Promise<schema.InventoryItem[]>;
  getInventoryItemsByUserId(userId: number): Promise<schema.InventoryItem[]>;
  updateInventoryItemStatus(id: number, status: string): Promise<schema.InventoryItem | undefined>;
  
  // Transfer operations
  getTransfer(id: number): Promise<schema.Transfer | undefined>;
  createTransfer(transfer: schema.InsertTransfer): Promise<schema.Transfer>;
  getAllTransfers(): Promise<schema.Transfer[]>;
  getTransfersByUserId(userId: number, type: 'from' | 'to'): Promise<schema.Transfer[]>;
  updateTransferStatus(id: number, status: string): Promise<schema.Transfer | undefined>;
  
  // Activity operations
  createActivity(activity: schema.InsertActivity): Promise<schema.Activity>;
  getAllActivities(): Promise<schema.Activity[]>;
  getActivitiesByUserId(userId: number): Promise<schema.Activity[]>;
}

// --- DbStorage Implementation ---
export class DbStorage implements IStorage {
  private saltRounds = 10;

  // User operations
  async getUser(id: number): Promise<schema.User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0]; // Returns undefined if not found
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
     // Returns user including password hash, needed for verification
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: schema.InsertUser): Promise<Omit<schema.User, 'password'>> {
    const hashedPassword = await bcrypt.hash(insertUser.password, this.saltRounds);
    
    const result = await db.insert(schema.users)
      .values({ 
          ...insertUser, 
          password: hashedPassword 
        })
      .returning({ // Explicitly select fields excluding password
          id: schema.users.id, 
          username: schema.users.username,
          name: schema.users.name,
          rank: schema.users.rank,
          createdAt: schema.users.createdAt
        }); 

    if (result.length === 0) {
      throw new Error("Failed to create user.");
    }
    // The returned object already matches the Omit type
    return result[0]; 
  }
  
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async getAllUsers(): Promise<Omit<schema.User, 'password'>[]> {
    // Implementation correctly selects non-password fields
    return db.select({ 
        id: schema.users.id, 
        username: schema.users.username,
        name: schema.users.name,
        rank: schema.users.rank,
        createdAt: schema.users.createdAt
      }).from(schema.users);
  }

  // Inventory operations
  async getInventoryItem(id: number): Promise<schema.InventoryItem | undefined> {
    const result = await db.select().from(schema.inventoryItems).where(eq(schema.inventoryItems.id, id)).limit(1);
    return result[0];
  }

  async createInventoryItem(insertItem: schema.InsertInventoryItem): Promise<schema.InventoryItem> {
    // Handle potentially undefined optional fields explicitly for DB insert
    const result = await db.insert(schema.inventoryItems).values({
        ...insertItem,
        description: insertItem.description ?? null,
        category: insertItem.category ?? null,
        assignedUserId: insertItem.assignedUserId ?? null,
        assignedDate: insertItem.assignedDate ?? null,
    }).returning();
    if (result.length === 0) {
        throw new Error("Failed to create inventory item.");
    }
    return result[0];
  }
  
  async getAllInventoryItems(): Promise<schema.InventoryItem[]> {
    return db.select().from(schema.inventoryItems);
  }
  
  async getInventoryItemsByUserId(userId: number): Promise<schema.InventoryItem[]> {
    return db.select().from(schema.inventoryItems).where(eq(schema.inventoryItems.assignedUserId, userId));
  }
  
  async updateInventoryItemStatus(id: number, status: string): Promise<schema.InventoryItem | undefined> {
     const result = await db.update(schema.inventoryItems)
      .set({ status })
      .where(eq(schema.inventoryItems.id, id))
      .returning();
    return result[0];
  }

  // Transfer operations
  async getTransfer(id: number): Promise<schema.Transfer | undefined> {
    const result = await db.select().from(schema.transfers).where(eq(schema.transfers.id, id)).limit(1);
    return result[0];
  }

  async createTransfer(insertTransfer: schema.InsertTransfer): Promise<schema.Transfer> {
     // Handle potentially undefined optional fields explicitly for DB insert
    const result = await db.insert(schema.transfers).values({
        ...insertTransfer,
        notes: insertTransfer.notes ?? null,
        // requestDate is defaultNow in schema, resolvedDate is null initially
    }).returning();
     if (result.length === 0) {
        throw new Error("Failed to create transfer.");
    }
    return result[0];
  }
  
  async getAllTransfers(): Promise<schema.Transfer[]> {
    return db.select().from(schema.transfers);
  }
  
  async getTransfersByUserId(userId: number, type: 'from' | 'to'): Promise<schema.Transfer[]> {
    const filterColumn = type === 'from' ? schema.transfers.fromUserId : schema.transfers.toUserId;
    return db.select().from(schema.transfers).where(eq(filterColumn, userId));
  }
  
  async updateTransferStatus(id: number, status: string): Promise<schema.Transfer | undefined> {
    const now = new Date();
    const result = await db.update(schema.transfers)
      .set({ 
          status, 
          resolvedDate: status === 'pending' ? null : now 
        })
      .where(eq(schema.transfers.id, id))
      .returning();
    return result[0];
  }

  // Activity operations
  async createActivity(insertActivity: schema.InsertActivity): Promise<schema.Activity> {
    // Handle potentially undefined optional fields explicitly for DB insert
    const result = await db.insert(schema.activities).values({
        ...insertActivity,
        userId: insertActivity.userId ?? null,
        relatedItemId: insertActivity.relatedItemId ?? null,
        relatedTransferId: insertActivity.relatedTransferId ?? null,
        // timestamp is defaultNow in schema
    }).returning();
     if (result.length === 0) {
        throw new Error("Failed to create activity.");
    }
    return result[0];
  }
  
  async getAllActivities(): Promise<schema.Activity[]> {
    return db.select().from(schema.activities);
  }
  
  async getActivitiesByUserId(userId: number): Promise<schema.Activity[]> {
    // Need to handle null userId in the database query if applicable
    // Assuming userId in activities table is non-null when filtering by it
    return db.select().from(schema.activities).where(eq(schema.activities.userId, userId));
  }
}

// Export an instance of the DbStorage
export const storage = new DbStorage();

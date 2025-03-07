import { 
  users, type User, type InsertUser,
  inventoryItems, type InventoryItem, type InsertInventoryItem,
  transfers, type Transfer, type InsertTransfer,
  activities, type Activity, type InsertActivity
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Inventory operations
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  getAllInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItemsByUserId(userId: number): Promise<InventoryItem[]>;
  updateInventoryItemStatus(id: number, status: string): Promise<InventoryItem | undefined>;
  
  // Transfer operations
  getTransfer(id: number): Promise<Transfer | undefined>;
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;
  getAllTransfers(): Promise<Transfer[]>;
  getTransfersByUserId(userId: number, type: 'from' | 'to'): Promise<Transfer[]>;
  updateTransferStatus(id: number, status: string): Promise<Transfer | undefined>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getAllActivities(): Promise<Activity[]>;
  getActivitiesByUserId(userId: number): Promise<Activity[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private inventoryItems: Map<number, InventoryItem>;
  private transfers: Map<number, Transfer>;
  private activities: Map<number, Activity>;
  private userId: number;
  private itemId: number;
  private transferId: number;
  private activityId: number;

  constructor() {
    this.users = new Map();
    this.inventoryItems = new Map();
    this.transfers = new Map();
    this.activities = new Map();
    this.userId = 1;
    this.itemId = 1;
    this.transferId = 1;
    this.activityId = 1;
    
    // Seed with demo data
    this.seedDemoData();
  }

  private seedDemoData() {
    // Create demo user
    const demoUser: InsertUser = {
      username: "john.doe",
      password: "password",
      name: "SSgt. John Doe",
      rank: "Staff Sergeant"
    };
    this.createUser(demoUser);
    
    // Create more users
    const users = [
      { username: "maria.martinez", password: "password", name: "Sgt. Maria Martinez", rank: "Sergeant" },
      { username: "david.parker", password: "password", name: "Lt. David Parker", rank: "Lieutenant" },
      { username: "jose.rodriguez", password: "password", name: "Cpl. Jose Rodriguez", rank: "Corporal" },
      { username: "james.williams", password: "password", name: "Pvt. James Williams", rank: "Private" }
    ];
    
    users.forEach(user => this.createUser(user));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Inventory operations
  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.itemId++;
    const now = new Date();
    const item: InventoryItem = { ...insertItem, id, createdAt: now };
    this.inventoryItems.set(id, item);
    return item;
  }
  
  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }
  
  async getInventoryItemsByUserId(userId: number): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(
      (item) => item.assignedUserId === userId
    );
  }
  
  async updateInventoryItemStatus(id: number, status: string): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, status };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  // Transfer operations
  async getTransfer(id: number): Promise<Transfer | undefined> {
    return this.transfers.get(id);
  }

  async createTransfer(insertTransfer: InsertTransfer): Promise<Transfer> {
    const id = this.transferId++;
    const now = new Date();
    const transfer: Transfer = { 
      ...insertTransfer, 
      id, 
      requestDate: now,
      resolvedDate: null
    };
    this.transfers.set(id, transfer);
    return transfer;
  }
  
  async getAllTransfers(): Promise<Transfer[]> {
    return Array.from(this.transfers.values());
  }
  
  async getTransfersByUserId(userId: number, type: 'from' | 'to'): Promise<Transfer[]> {
    return Array.from(this.transfers.values()).filter(
      (transfer) => type === 'from' ? transfer.fromUserId === userId : transfer.toUserId === userId
    );
  }
  
  async updateTransferStatus(id: number, status: string): Promise<Transfer | undefined> {
    const transfer = this.transfers.get(id);
    if (!transfer) return undefined;
    
    const now = new Date();
    const updatedTransfer = { 
      ...transfer, 
      status,
      resolvedDate: status === 'pending' ? null : now
    };
    this.transfers.set(id, updatedTransfer);
    return updatedTransfer;
  }

  // Activity operations
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const now = new Date();
    const activity: Activity = { ...insertActivity, id, timestamp: now };
    this.activities.set(id, activity);
    return activity;
  }
  
  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }
  
  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      (activity) => activity.userId === userId
    );
  }
}

export const storage = new MemStorage();

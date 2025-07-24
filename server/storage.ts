import { 
  users, 
  seoAnalyses, 
  scheduledScans,
  scanAlerts,
  type User, 
  type InsertUser, 
  type SeoAnalysis, 
  type InsertSeoAnalysis,
  type ScheduledScan,
  type InsertScheduledScan,
  type ScanAlert
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createSeoAnalysis(analysis: InsertSeoAnalysis): Promise<SeoAnalysis>;
  getSeoAnalysis(id: number): Promise<SeoAnalysis | undefined>;
  getSeoAnalysesByUrl(url: string): Promise<SeoAnalysis[]>;
  
  createScheduledScan(scan: InsertScheduledScan): Promise<ScheduledScan>;
  getScheduledScans(userEmail: string): Promise<ScheduledScan[]>;
  deleteScheduledScan(id: number, userEmail: string): Promise<boolean>;
  
  getScanAlerts(userEmail: string): Promise<ScanAlert[]>;
  markAlertAsRead(alertId: number, userEmail: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private seoAnalyses: Map<number, SeoAnalysis>;
  private scheduledScans: Map<number, ScheduledScan>;
  private scanAlerts: Map<number, ScanAlert>;
  private currentUserId: number;
  private currentAnalysisId: number;
  private currentScanId: number;
  private currentAlertId: number;

  constructor() {
    this.users = new Map();
    this.seoAnalyses = new Map();
    this.scheduledScans = new Map();
    this.scanAlerts = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
    this.currentScanId = 1;
    this.currentAlertId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSeoAnalysis(insertAnalysis: InsertSeoAnalysis): Promise<SeoAnalysis> {
    const id = this.currentAnalysisId++;
    const analysis: SeoAnalysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
      isAmp: false,
      ampUrl: null,
      regularUrl: null,
      score: null,
      issues: null,
      warnings: null,
      passed: null,
    };
    this.seoAnalyses.set(id, analysis);
    return analysis;
  }

  async getSeoAnalysis(id: number): Promise<SeoAnalysis | undefined> {
    return this.seoAnalyses.get(id);
  }

  async getSeoAnalysesByUrl(url: string): Promise<SeoAnalysis[]> {
    return Array.from(this.seoAnalyses.values()).filter(
      (analysis) => analysis.url === url,
    );
  }

  async createScheduledScan(insertScan: InsertScheduledScan): Promise<ScheduledScan> {
    const id = this.currentScanId++;
    const nextScan = new Date();
    nextScan.setDate(nextScan.getDate() + 1); // Default to tomorrow
    
    const scan: ScheduledScan = {
      ...insertScan,
      id,
      isActive: true,
      lastScan: null,
      nextScan,
      createdAt: new Date(),
      lastResults: null,
    };
    this.scheduledScans.set(id, scan);
    return scan;
  }

  async getScheduledScans(userEmail: string): Promise<ScheduledScan[]> {
    return Array.from(this.scheduledScans.values()).filter(
      (scan) => scan.userEmail === userEmail && scan.isActive,
    );
  }

  async deleteScheduledScan(id: number, userEmail: string): Promise<boolean> {
    const scan = this.scheduledScans.get(id);
    if (scan && scan.userEmail === userEmail) {
      scan.isActive = false;
      return true;
    }
    return false;
  }

  async getScanAlerts(userEmail: string): Promise<ScanAlert[]> {
    return Array.from(this.scanAlerts.values()).filter((alert) => {
      const scan = this.scheduledScans.get(alert.scheduledScanId);
      return scan && scan.userEmail === userEmail;
    });
  }

  async markAlertAsRead(alertId: number, userEmail: string): Promise<boolean> {
    const alert = this.scanAlerts.get(alertId);
    if (alert) {
      const scan = this.scheduledScans.get(alert.scheduledScanId);
      if (scan && scan.userEmail === userEmail) {
        alert.isRead = true;
        return true;
      }
    }
    return false;
  }
}

// For development, we can switch between memory and database storage
export const storage = new MemStorage();

// Uncomment to use database storage:
// import { DatabaseStorage } from "./services/database-storage";
// export const storage = new DatabaseStorage();

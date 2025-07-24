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
import { db } from "../db";
import { eq, and } from "drizzle-orm";
import type { IStorage } from "../storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createSeoAnalysis(insertAnalysis: InsertSeoAnalysis): Promise<SeoAnalysis> {
    const [analysis] = await db
      .insert(seoAnalyses)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getSeoAnalysis(id: number): Promise<SeoAnalysis | undefined> {
    const [analysis] = await db.select().from(seoAnalyses).where(eq(seoAnalyses.id, id));
    return analysis || undefined;
  }

  async getSeoAnalysesByUrl(url: string): Promise<SeoAnalysis[]> {
    return await db.select().from(seoAnalyses).where(eq(seoAnalyses.url, url));
  }

  async createScheduledScan(insertScan: InsertScheduledScan): Promise<ScheduledScan> {
    const nextScan = new Date();
    nextScan.setDate(nextScan.getDate() + 1);

    const [scan] = await db
      .insert(scheduledScans)
      .values({
        ...insertScan,
        nextScan,
      })
      .returning();
    return scan;
  }

  async getScheduledScans(userEmail: string): Promise<ScheduledScan[]> {
    return await db
      .select()
      .from(scheduledScans)
      .where(and(eq(scheduledScans.userEmail, userEmail), eq(scheduledScans.isActive, true)));
  }

  async deleteScheduledScan(id: number, userEmail: string): Promise<boolean> {
    const result = await db
      .update(scheduledScans)
      .set({ isActive: false })
      .where(and(eq(scheduledScans.id, id), eq(scheduledScans.userEmail, userEmail)))
      .returning();

    return result.length > 0;
  }

  async getScanAlerts(userEmail: string): Promise<ScanAlert[]> {
    const alerts = await db
      .select({
        id: scanAlerts.id,
        scheduledScanId: scanAlerts.scheduledScanId,
        url: scanAlerts.url,
        changeType: scanAlerts.changeType,
        changeDetails: scanAlerts.changeDetails,
        severity: scanAlerts.severity,
        isRead: scanAlerts.isRead,
        createdAt: scanAlerts.createdAt,
      })
      .from(scanAlerts)
      .innerJoin(scheduledScans, eq(scanAlerts.scheduledScanId, scheduledScans.id))
      .where(eq(scheduledScans.userEmail, userEmail))
      .orderBy(scanAlerts.createdAt);

    return alerts;
  }

  async markAlertAsRead(alertId: number, userEmail: string): Promise<boolean> {
    const result = await db
      .update(scanAlerts)
      .set({ isRead: true })
      .where(eq(scanAlerts.id, alertId))
      .returning();

    return result.length > 0;
  }
}
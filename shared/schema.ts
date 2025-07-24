import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const seoAnalyses = pgTable("seo_analyses", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  analysisData: jsonb("analysis_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isAmp: boolean("is_amp").default(false).notNull(),
  ampUrl: text("amp_url"),
  regularUrl: text("regular_url"),
  score: integer("score"),
  issues: integer("issues"),
  warnings: integer("warnings"),
  passed: integer("passed"),
});

export const scheduledScans = pgTable("scheduled_scans", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  userEmail: text("user_email").notNull(),
  frequency: text("frequency").default("daily").notNull(),
  customTime: text("custom_time"), // For custom scheduling (e.g., "14:30", "09:00")
  customDays: jsonb("custom_days"), // For custom days [1,2,3,4,5] (Monday-Friday)
  timeZone: text("time_zone").default("UTC"),
  isActive: boolean("is_active").default(true).notNull(),
  lastScan: timestamp("last_scan"),
  nextScan: timestamp("next_scan").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastResults: jsonb("last_results"),
});

export const scanAlerts = pgTable("scan_alerts", {
  id: serial("id").primaryKey(),
  scheduledScanId: integer("scheduled_scan_id").notNull(),
  url: text("url").notNull(),
  changeType: text("change_type").notNull(),
  changeDetails: jsonb("change_details").notNull(),
  severity: text("severity").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSeoAnalysisSchema = createInsertSchema(seoAnalyses).pick({
  url: true,
  analysisData: true,
});

export const insertScheduledScanSchema = createInsertSchema(scheduledScans).pick({
  url: true,
  userEmail: true,
  frequency: true,
  customTime: true,
  customDays: true,
  timeZone: true,
});

export const urlAnalysisSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export const scheduledScanSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  userEmail: z.string().email("Please enter a valid email"),
  frequency: z.enum(["daily", "weekly", "monthly", "custom"]).default("daily"),
  customTime: z.string().optional(),
  customDays: z.array(z.number().min(0).max(6)).optional(), // 0=Sunday, 1=Monday, etc.
  timeZone: z.string().default("UTC"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSeoAnalysis = z.infer<typeof insertSeoAnalysisSchema>;
export type SeoAnalysis = typeof seoAnalyses.$inferSelect;
export type InsertScheduledScan = z.infer<typeof insertScheduledScanSchema>;
export type ScheduledScan = typeof scheduledScans.$inferSelect;
export type ScanAlert = typeof scanAlerts.$inferSelect;
export type UrlAnalysis = z.infer<typeof urlAnalysisSchema>;
export type ScheduledScanInput = z.infer<typeof scheduledScanSchema>;

export interface SEOAnalysisResult {
  url: string;
  timestamp: string;
  overallScore: number;
  issues: number;
  warnings: number;
  passed: number;
  loadTime?: number;
  pageSize?: number;
  isAmp?: boolean;
  ampUrl?: string;
  regularUrl?: string;
  ampComparison?: {
    ampScore: number;
    regularScore: number;
    ampIssues: number;
    regularIssues: number;
    differences: Array<{
      category: string;
      ampValue: any;
      regularValue: any;
      impact: 'positive' | 'negative' | 'neutral';
    }>;
  };
  performance: {
    loadTime: number;
    responseTime: number;
    redirects: number;
    ssl: boolean;
    pageSize: number;
  };
  accessibility: {
    hasAltTags: boolean;
    hasHeadings: boolean;
    contrastRatio: string | null;
  };
  openGraph: {
    title: string | null;
    description: string | null;
    image: string | null;
    type: string | null;
  };
  twitterCard: {
    card: string | null;
    title: string | null;
    description: string | null;
    image: string | null;
  };
  metaTags: {
    title: string | null;
    titleLength: number;
    description: string | null;
    descriptionLength: number;
    keywords: string | null;
    keywordsLength: number;
    canonical: string | null;
    canonicalMatches: boolean;
    robots: string | null;
    robotsValid: boolean;
    htmlLang: string | null;
    maxImagePreview: boolean;
  };
  dates: {
    published: string | null;
    publishedSource: string | null;
    modified: string | null;
    modifiedSource: string | null;
  };
  author: {
    name: string | null;
    link: string | null;
    source: string | null;
  };
  breadcrumbs: {
    found: boolean;
    type: string | null;
    data: any[];
  };
  schema: {
    found: boolean;
    types: Array<{
      type: string;
      format: string;
      data: any;
    }>;
  };
  robotsTxt: {
    found: boolean;
    content: string | null;
    rules: Array<{
      userAgent: string;
      directive: string;
      path: string;
    }>;
  };
  links: {
    total: number;
    internal: number;
    external: number;
    broken: Array<{
      url: string;
      text: string;
      status: number;
      error: string | null;
    }>;
    externalLinks: Array<{
      url: string;
      text: string;
      nofollow: boolean;
      status: number;
    }>;
  };
}

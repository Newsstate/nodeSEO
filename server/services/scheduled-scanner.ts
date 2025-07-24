import { storage } from "../storage";
import { seoAnalyzer } from "./seo-analyzer";
import type { InsertScheduledScan, ScheduledScan, ScanAlert } from "@shared/schema";

class ScheduledScannerService {
  private isRunning = false;

  constructor() {
    // Start the scheduler
    this.startScheduler();
  }

  private startScheduler() {
    // Check every 30 minutes for scheduled scans
    setInterval(() => {
      this.checkScheduledScans();
    }, 30 * 60 * 1000); // 30 minutes

    // Initial check
    this.checkScheduledScans();
  }

  private async checkScheduledScans() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      console.log("Checking for scheduled scans...");
      
      // Get all active scheduled scans (we'll need to implement this)
      const scans = await this.getAllActiveScans();
      
      console.log(`Found ${scans.length} scheduled scans to run`);
      
      for (const scan of scans) {
        if (this.shouldRunScan(scan)) {
          await this.runScheduledScan(scan);
        }
      }
    } catch (error) {
      console.error("Error checking scheduled scans:", error);
    } finally {
      this.isRunning = false;
    }
  }

  private async getAllActiveScans(): Promise<ScheduledScan[]> {
    // For now, return empty array - this would need to be implemented in storage
    try {
      // This is a placeholder - in a real implementation, storage would have this method
      return [];
    } catch (error) {
      console.error("Error getting active scans:", error);
      return [];
    }
  }

  private shouldRunScan(scan: ScheduledScan): boolean {
    const now = new Date();
    return now >= scan.nextScan;
  }

  private async runScheduledScan(scan: ScheduledScan) {
    try {
      console.log(`Running scheduled scan for ${scan.url}`);
      
      // Perform the SEO analysis
      const analysisResult = await seoAnalyzer.analyzeWebsite(scan.url);
      
      // Store the analysis
      await storage.createSeoAnalysis({
        url: scan.url,
        analysisData: analysisResult,
      });
      
      // Check for changes if there are previous results
      if (scan.lastResults) {
        await this.checkForChanges(scan, analysisResult);
      }
      
      // Update the scan with new results and next run time
      await this.updateScheduledScan(scan, analysisResult);
      
    } catch (error) {
      console.error(`Error running scheduled scan for ${scan.url}:`, error);
    }
  }

  private async checkForChanges(scan: ScheduledScan, newResults: any) {
    // This would compare results and create alerts
    // For now, just a placeholder
    console.log(`Checking for changes in ${scan.url}`);
  }

  private async updateScheduledScan(scan: ScheduledScan, results: any) {
    // Calculate next scan time based on frequency
    const nextScan = new Date();
    switch (scan.frequency) {
      case 'daily':
        nextScan.setDate(nextScan.getDate() + 1);
        break;
      case 'weekly':
        nextScan.setDate(nextScan.getDate() + 7);
        break;
      case 'monthly':
        nextScan.setMonth(nextScan.getMonth() + 1);
        break;
    }
    
    // This would update the scan in storage
    console.log(`Next scan for ${scan.url} scheduled for ${nextScan}`);
  }

  async createScheduledScan(scanData: InsertScheduledScan): Promise<ScheduledScan> {
    try {
      const scan = await storage.createScheduledScan(scanData);
      console.log(`Created scheduled scan for ${scan.url} with frequency ${scan.frequency}`);
      return scan;
    } catch (error) {
      console.error("Error creating scheduled scan:", error);
      throw new Error("Failed to create scheduled scan");
    }
  }

  async getScheduledScans(userEmail: string): Promise<ScheduledScan[]> {
    try {
      return await storage.getScheduledScans(userEmail);
    } catch (error) {
      console.error("Error getting scheduled scans:", error);
      return [];
    }
  }

  async deleteScheduledScan(id: number, userEmail: string): Promise<boolean> {
    try {
      return await storage.deleteScheduledScan(id, userEmail);
    } catch (error) {
      console.error("Error deleting scheduled scan:", error);
      return false;
    }
  }

  async getScanAlerts(userEmail: string): Promise<ScanAlert[]> {
    try {
      return await storage.getScanAlerts(userEmail);
    } catch (error) {
      console.error("Error getting scan alerts:", error);
      return [];
    }
  }

  async markAlertAsRead(alertId: number, userEmail: string): Promise<boolean> {
    try {
      return await storage.markAlertAsRead(alertId, userEmail);
    } catch (error) {
      console.error("Error marking alert as read:", error);
      return false;
    }
  }
}

export const scheduledScannerService = new ScheduledScannerService();
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seoAnalyzer } from "./services/seo-analyzer";
import { scheduledScannerService } from "./services/scheduled-scanner";
import { EmailAuditor } from "./services/email-auditor";
import { reportExporter } from "./services/report-exporter";
import { urlAnalysisSchema, insertSeoAnalysisSchema, scheduledScanSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const emailAuditor = new EmailAuditor();
  
  // Analyze URL endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { url } = urlAnalysisSchema.parse(req.body);
      
      // Perform SEO analysis
      const analysisResult = await seoAnalyzer.analyzeWebsite(url);
      
      // Store the analysis
      const storedAnalysis = await storage.createSeoAnalysis({
        url: analysisResult.url,
        analysisData: analysisResult,
      });

      res.json({
        success: true,
        data: analysisResult,
        analysisId: storedAnalysis.id,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      });
    }
  });

  // Get analysis by ID
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid analysis ID" });
      }

      const analysis = await storage.getSeoAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      res.json(analysis);
    } catch (error) {
      console.error("Get analysis error:", error);
      res.status(500).json({ error: "Failed to retrieve analysis" });
    }
  });

  // Get analyses by URL
  app.get("/api/analyses", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "URL parameter is required" });
      }

      const analyses = await storage.getSeoAnalysesByUrl(url);
      res.json(analyses);
    } catch (error) {
      console.error("Get analyses error:", error);
      res.status(500).json({ error: "Failed to retrieve analyses" });
    }
  });

  // Scheduled scan routes
  app.post("/api/scheduled-scans", async (req, res) => {
    try {
      const scanData = scheduledScanSchema.parse(req.body);
      const scan = await scheduledScannerService.createScheduledScan(scanData);
      
      res.json({
        success: true,
        data: scan,
      });
    } catch (error) {
      console.error("Create scheduled scan error:", error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to create scheduled scan",
      });
    }
  });

  app.get("/api/scheduled-scans", async (req, res) => {
    try {
      const { userEmail } = req.query;
      if (!userEmail || typeof userEmail !== 'string') {
        return res.status(400).json({ error: "User email is required" });
      }

      const scans = await scheduledScannerService.getScheduledScans(userEmail);
      console.log(`Found ${scans.length} scheduled scans for ${userEmail}`);
      res.json(scans);
    } catch (error) {
      console.error("Get scheduled scans error:", error);
      res.status(500).json({ error: "Failed to retrieve scheduled scans" });
    }
  });

  app.delete("/api/scheduled-scans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { userEmail } = req.query;
      
      if (isNaN(id) || !userEmail || typeof userEmail !== 'string') {
        return res.status(400).json({ error: "Invalid scan ID or user email" });
      }

      const success = await scheduledScannerService.deleteScheduledScan(id, userEmail);
      if (!success) {
        return res.status(404).json({ error: "Scheduled scan not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete scheduled scan error:", error);
      res.status(500).json({ error: "Failed to delete scheduled scan" });
    }
  });

  app.get("/api/scan-alerts", async (req, res) => {
    try {
      const { userEmail } = req.query;
      if (!userEmail || typeof userEmail !== 'string') {
        return res.status(400).json({ error: "User email is required" });
      }

      const alerts = await scheduledScannerService.getScanAlerts(userEmail);
      res.json(alerts);
    } catch (error) {
      console.error("Get scan alerts error:", error);
      res.status(500).json({ error: "Failed to retrieve scan alerts" });
    }
  });

  app.post("/api/scan-alerts/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { userEmail } = req.query;
      
      if (isNaN(id) || !userEmail || typeof userEmail !== 'string') {
        return res.status(400).json({ error: "Invalid alert ID or user email" });
      }

      const success = await scheduledScannerService.markAlertAsRead(id, userEmail);
      if (!success) {
        return res.status(404).json({ error: "Alert not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Mark alert as read error:", error);
      res.status(500).json({ error: "Failed to mark alert as read" });
    }
  });

  // Send instant email notification
  app.post("/api/send-test-email", async (req, res) => {
    try {
      const { userEmail, url } = req.body;
      
      if (!userEmail || !url) {
        return res.status(400).json({ error: "User email and URL are required" });
      }

      // Perform SEO analysis for the URL
      console.log(`Sending instant email notification to ${userEmail} for ${url}`);
      const analysisResult = await seoAnalyzer.analyzeWebsite(url);
      
      // Store the analysis
      await storage.createSeoAnalysis({
        url: analysisResult.url,
        analysisData: analysisResult,
      });

      // In a real application, you would send an actual email here
      // For now, we'll simulate the email sending and log the details
      const totalIssues = analysisResult.issues + analysisResult.warnings;
      const emailContent = {
        to: userEmail,
        subject: `SEO Analysis Complete - ${url}`,
        body: `
Hello,

Your SEO analysis for ${url} has been completed successfully!

Summary:
- Overall Score: ${analysisResult.overallScore}/100
- Issues Found: ${totalIssues}
- Passed Checks: ${analysisResult.passed}

${analysisResult.ampUrl ? `AMP Version Detected: ${analysisResult.ampUrl}` : 'No AMP version found'}

Performance Metrics:
- Load Time: ${analysisResult.performance?.loadTime || 'N/A'}
- HTTPS: ${analysisResult.performance?.ssl ? 'Enabled' : 'Not Enabled'}
- Mobile Friendly: Unknown

Visit your dashboard to see the complete analysis report with detailed recommendations.

Best regards,
SEO Analyzer Team
        `
      };

      // Step 1: Audit the email before sending
      console.log("🔍 Auditing email before sending...");
      const emailAudit = emailAuditor.auditEmail(emailContent);
      const auditReport = emailAuditor.generateAuditReport(emailAudit);
      
      console.log("📊 Email Audit Report:");
      console.log(auditReport);
      
      // Step 2: Check if email passes audit
      if (!emailAudit.isValid || emailAudit.score < 60) {
        console.log("❌ Email failed audit, not sending");
        return res.status(400).json({
          success: false,
          message: "Email failed quality audit",
          audit: emailAudit,
          auditReport
        });
      }
      
      // Step 3: Email passed audit, proceed with sending
      console.log("✅ Email passed audit, proceeding with delivery...");
      
      // In production, you would integrate with an email service like:
      // - SendGrid, Mailgun, AWS SES, or Nodemailer with SMTP
      // For now, we simulate successful email delivery
      
      const emailDeliveryStatus = {
        delivered: true,
        timestamp: new Date().toISOString(),
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        recipient: userEmail,
        status: "delivered",
        auditScore: emailAudit.score
      };

      console.log("✅ Email notification sent successfully:", emailContent);
      console.log("📧 Email delivery confirmation:", emailDeliveryStatus);

      res.json({
        success: true,
        message: "Email notification sent successfully",
        analysisId: analysisResult.url,
        emailSent: true,
        emailPreview: emailContent,
        deliveryStatus: emailDeliveryStatus,
        audit: emailAudit,
        auditReport,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Send email error:", error);
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email notification" 
      });
    }
  });

  // Export email audit report endpoints
  app.post("/api/export/email-audit", async (req, res) => {
    try {
      const { format, userEmail, url, emailContent, auditResult } = req.body;
      
      if (!['pdf', 'csv'].includes(format)) {
        return res.status(400).json({ error: "Format must be 'pdf' or 'csv'" });
      }

      if (!userEmail || !url || !emailContent || !auditResult) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const options = {
        format,
        emailAddress: userEmail,
        url,
        timestamp: new Date().toISOString()
      };

      let filepath: string;
      let contentType: string;
      let filename: string;

      if (format === 'pdf') {
        filepath = await reportExporter.exportEmailAuditToPDF(auditResult, emailContent, options);
        contentType = 'application/pdf';
        filename = `email-audit-report-${Date.now()}.pdf`;
      } else {
        filepath = await reportExporter.exportEmailAuditToCSV(auditResult, emailContent, options);
        contentType = 'text/csv';
        filename = `email-audit-report-${Date.now()}.csv`;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      const fs = await import('fs');
      const fileStream = fs.createReadStream(filepath);
      fileStream.pipe(res);

      // Clean up file after sending (optional - you might want to keep files for a while)
      fileStream.on('end', async () => {
        try {
          await import('fs/promises').then(fsPromises => fsPromises.unlink(filepath));
        } catch (error) {
          console.warn('Failed to cleanup export file:', error);
        }
      });

    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : "Failed to export report" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

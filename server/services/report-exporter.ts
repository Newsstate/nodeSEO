import puppeteer from 'puppeteer';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs/promises';
import { EmailAuditResult } from './email-auditor';

export interface ExportOptions {
  format: 'pdf' | 'csv';
  emailAddress: string;
  url: string;
  timestamp: string;
}

export class ReportExporter {
  private async ensureExportDirectory(): Promise<string> {
    const exportDir = path.join(process.cwd(), 'exports');
    try {
      await fs.access(exportDir);
    } catch {
      await fs.mkdir(exportDir, { recursive: true });
    }
    return exportDir;
  }

  async exportEmailAuditToPDF(
    auditResult: EmailAuditResult,
    emailContent: { to: string; subject: string; body: string },
    options: ExportOptions
  ): Promise<string> {
    const exportDir = await this.ensureExportDirectory();
    const filename = `email-audit-${Date.now()}.pdf`;
    const filepath = path.join(exportDir, filename);

    const htmlContent = this.generateEmailAuditHTML(auditResult, emailContent, options);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      await page.pdf({
        path: filepath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      return filepath;
    } finally {
      await browser.close();
    }
  }

  async exportEmailAuditToCSV(
    auditResult: EmailAuditResult,
    emailContent: { to: string; subject: string; body: string },
    options: ExportOptions
  ): Promise<string> {
    const exportDir = await this.ensureExportDirectory();
    const filename = `email-audit-${Date.now()}.csv`;
    const filepath = path.join(exportDir, filename);

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'email', title: 'Email Address' },
        { id: 'url', title: 'URL' },
        { id: 'subject', title: 'Email Subject' },
        { id: 'score', title: 'Audit Score' },
        { id: 'isValid', title: 'Is Valid' },
        { id: 'subjectLength', title: 'Subject Length' },
        { id: 'bodyLength', title: 'Body Length' },
        { id: 'hasPersonalization', title: 'Has Personalization' },
        { id: 'hasCallToAction', title: 'Has Call to Action' },
        { id: 'spamScore', title: 'Spam Score' },
        { id: 'readabilityScore', title: 'Readability Score' },
        { id: 'issues', title: 'Critical Issues' },
        { id: 'warnings', title: 'Warnings' },
        { id: 'suggestions', title: 'Suggestions' }
      ]
    });

    const data = [{
      timestamp: options.timestamp,
      email: options.emailAddress,
      url: options.url,
      subject: emailContent.subject,
      score: auditResult.score,
      isValid: auditResult.isValid ? 'Yes' : 'No',
      subjectLength: auditResult.contentAnalysis.subjectLength,
      bodyLength: auditResult.contentAnalysis.bodyLength,
      hasPersonalization: auditResult.contentAnalysis.hasPersonalization ? 'Yes' : 'No',
      hasCallToAction: auditResult.contentAnalysis.hasCallToAction ? 'Yes' : 'No',
      spamScore: auditResult.contentAnalysis.spamScore,
      readabilityScore: auditResult.contentAnalysis.readabilityScore,
      issues: auditResult.issues.join('; '),
      warnings: auditResult.warnings.join('; '),
      suggestions: auditResult.suggestions.join('; ')
    }];

    await csvWriter.writeRecords(data);
    return filepath;
  }

  private generateEmailAuditHTML(
    auditResult: EmailAuditResult,
    emailContent: { to: string; subject: string; body: string },
    options: ExportOptions
  ): string {
    const scoreColor = auditResult.score >= 80 ? '#10b981' : 
                     auditResult.score >= 60 ? '#f59e0b' : '#ef4444';
    
    const formatList = (items: string[], icon: string) => 
      items.length > 0 ? `
        <div class="section">
          <h3>${icon} ${icon === '❌' ? 'Critical Issues' : icon === '⚠️' ? 'Warnings' : 'Suggestions'}</h3>
          <ul>
            ${items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Email Audit Report</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f8fafc;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
          }
          .score-card {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .score-number {
            font-size: 4em;
            font-weight: bold;
            color: ${scoreColor};
            margin: 0;
          }
          .score-label {
            font-size: 1.2em;
            color: #666;
            margin-top: 10px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .info-card h3 {
            margin: 0 0 15px 0;
            color: #374151;
            font-size: 1.1em;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-item:last-child {
            border-bottom: none;
          }
          .info-label {
            color: #6b7280;
          }
          .info-value {
            font-weight: 600;
            color: #374151;
          }
          .section {
            background: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .section h3 {
            margin: 0 0 15px 0;
            color: #374151;
            font-size: 1.3em;
          }
          .section ul {
            margin: 0;
            padding-left: 20px;
          }
          .section li {
            margin-bottom: 8px;
            color: #4b5563;
          }
          .email-preview {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 20px;
            margin-top: 15px;
          }
          .email-header {
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
          }
          .email-body {
            white-space: pre-wrap;
            color: #4b5563;
            font-size: 0.9em;
            line-height: 1.5;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #6b7280;
            font-size: 0.9em;
          }
          @media print {
            body { background: white; }
            .header { break-inside: avoid; }
            .score-card { break-inside: avoid; }
            .section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Email Audit Report</h1>
          <p>Generated on ${new Date(options.timestamp).toLocaleDateString()} at ${new Date(options.timestamp).toLocaleTimeString()}</p>
        </div>

        <div class="score-card">
          <div class="score-number">${auditResult.score}</div>
          <div class="score-label">Overall Score (out of 100)</div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <h3>Email Details</h3>
            <div class="info-item">
              <span class="info-label">Recipient:</span>
              <span class="info-value">${emailContent.to}</span>
            </div>
            <div class="info-item">
              <span class="info-label">URL Analyzed:</span>
              <span class="info-value">${options.url}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span>
              <span class="info-value">${auditResult.isValid ? 'Valid' : 'Invalid'}</span>
            </div>
          </div>

          <div class="info-card">
            <h3>Content Metrics</h3>
            <div class="info-item">
              <span class="info-label">Subject Length:</span>
              <span class="info-value">${auditResult.contentAnalysis.subjectLength} chars</span>
            </div>
            <div class="info-item">
              <span class="info-label">Body Length:</span>
              <span class="info-value">${auditResult.contentAnalysis.bodyLength} chars</span>
            </div>
            <div class="info-item">
              <span class="info-label">Spam Risk:</span>
              <span class="info-value">${auditResult.contentAnalysis.spamScore}/100</span>
            </div>
            <div class="info-item">
              <span class="info-label">Readability:</span>
              <span class="info-value">${auditResult.contentAnalysis.readabilityScore}/100</span>
            </div>
          </div>
        </div>

        ${formatList(auditResult.issues, '❌')}
        ${formatList(auditResult.warnings, '⚠️')}
        ${formatList(auditResult.suggestions, '💡')}

        <div class="section">
          <h3>📧 Email Preview</h3>
          <div class="email-preview">
            <div class="email-header">Subject: ${emailContent.subject}</div>
            <div class="email-body">${emailContent.body}</div>
          </div>
        </div>

        <div class="footer">
          <p>Report generated by SEO Analyzer Email Audit System</p>
          <p>For support, contact your system administrator</p>
        </div>
      </body>
      </html>
    `;
  }
}

export const reportExporter = new ReportExporter();
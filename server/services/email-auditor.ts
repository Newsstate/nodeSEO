export interface EmailAuditResult {
  isValid: boolean;
  score: number;
  issues: string[];
  warnings: string[];
  suggestions: string[];
  contentAnalysis: {
    subjectLength: number;
    bodyLength: number;
    hasPersonalization: boolean;
    hasCallToAction: boolean;
    spamScore: number;
    readabilityScore: number;
  };
}

export class EmailAuditor {
  auditEmail(emailContent: {
    to: string;
    subject: string;
    body: string;
  }): EmailAuditResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Subject line analysis
    const subjectLength = emailContent.subject.length;
    if (subjectLength > 70) {
      issues.push("Subject line too long (over 70 characters)");
      score -= 15;
    } else if (subjectLength < 30) {
      warnings.push("Subject line might be too short (under 30 characters)");
      score -= 5;
    }

    // Body length analysis
    const bodyLength = emailContent.body.length;
    if (bodyLength > 5000) {
      warnings.push("Email body is very long, consider summarizing");
      score -= 10;
    } else if (bodyLength < 100) {
      issues.push("Email body too short, lacks sufficient information");
      score -= 20;
    }

    // Spam score calculation
    let spamScore = 0;
    const spamWords = ['urgent', 'act now', 'limited time', 'guarantee', 'free', 'click here'];
    const bodyLower = emailContent.body.toLowerCase();
    const subjectLower = emailContent.subject.toLowerCase();
    
    spamWords.forEach(word => {
      if (bodyLower.includes(word) || subjectLower.includes(word)) {
        spamScore += 10;
      }
    });

    if (spamScore > 30) {
      issues.push("High spam risk detected");
      score -= 25;
    } else if (spamScore > 10) {
      warnings.push("Moderate spam risk detected");
      score -= 10;
    }

    // Personalization check
    const hasPersonalization = emailContent.body.includes('Hello') || 
                              emailContent.body.includes('Hi') ||
                              emailContent.to.split('@')[0].length > 3;

    if (!hasPersonalization) {
      suggestions.push("Consider adding personalization to improve engagement");
      score -= 5;
    }

    // Call to action check
    const hasCallToAction = bodyLower.includes('visit') || 
                           bodyLower.includes('click') || 
                           bodyLower.includes('view') ||
                           bodyLower.includes('dashboard');

    if (!hasCallToAction) {
      suggestions.push("Consider adding a clear call-to-action");
      score -= 5;
    }

    // Readability score (simplified)
    const sentences = emailContent.body.split(/[.!?]+/).length;
    const words = emailContent.body.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    let readabilityScore = 100;
    if (avgWordsPerSentence > 20) {
      readabilityScore -= 20;
      suggestions.push("Consider shorter sentences for better readability");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailContent.to)) {
      issues.push("Invalid recipient email address");
      score -= 30;
    }

    // Final score adjustment
    score = Math.max(0, Math.min(100, score));

    return {
      isValid: issues.length === 0,
      score,
      issues,
      warnings,
      suggestions,
      contentAnalysis: {
        subjectLength,
        bodyLength,
        hasPersonalization,
        hasCallToAction,
        spamScore,
        readabilityScore
      }
    };
  }

  generateAuditReport(audit: EmailAuditResult): string {
    let report = `Email Audit Report (Score: ${audit.score}/100)\n\n`;
    
    if (audit.issues.length > 0) {
      report += "❌ Critical Issues:\n";
      audit.issues.forEach(issue => report += `• ${issue}\n`);
      report += "\n";
    }

    if (audit.warnings.length > 0) {
      report += "⚠️ Warnings:\n";
      audit.warnings.forEach(warning => report += `• ${warning}\n`);
      report += "\n";
    }

    if (audit.suggestions.length > 0) {
      report += "💡 Suggestions:\n";
      audit.suggestions.forEach(suggestion => report += `• ${suggestion}\n`);
      report += "\n";
    }

    report += "📊 Content Analysis:\n";
    report += `• Subject Length: ${audit.contentAnalysis.subjectLength} characters\n`;
    report += `• Body Length: ${audit.contentAnalysis.bodyLength} characters\n`;
    report += `• Personalization: ${audit.contentAnalysis.hasPersonalization ? 'Yes' : 'No'}\n`;
    report += `• Call to Action: ${audit.contentAnalysis.hasCallToAction ? 'Yes' : 'No'}\n`;
    report += `• Spam Risk: ${audit.contentAnalysis.spamScore}/100\n`;
    report += `• Readability: ${audit.contentAnalysis.readabilityScore}/100\n`;

    return report;
  }
}
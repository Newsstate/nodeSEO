import { useState } from "react";
import { SEOAnalysisForm } from "@/components/seo-analysis-form";
import { AnalysisResults } from "@/components/analysis-results";
import { Button } from "@/components/ui/button";
import { Download, Settings, Search } from "lucide-react";
import type { SEOAnalysisResult } from "@shared/schema";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<SEOAnalysisResult | null>(null);

  const handleAnalysisComplete = (result: SEOAnalysisResult) => {
    setAnalysisResult(result);
  };

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    if (!analysisResult) return;
    
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(analysisResult, null, 2);
        filename = `seo-analysis-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        // Simple CSV export of key metrics
        const csvData = [
          ['Metric', 'Value', 'Status'],
          ['URL', analysisResult.url, ''],
          ['Overall Score', analysisResult.overallScore.toString(), ''],
          ['SEO Title', analysisResult.metaTags.title || 'Missing', analysisResult.metaTags.title ? 'Pass' : 'Fail'],
          ['Meta Description', analysisResult.metaTags.description || 'Missing', analysisResult.metaTags.description ? 'Pass' : 'Fail'],
          ['Canonical Tag', analysisResult.metaTags.canonical || 'Missing', analysisResult.metaTags.canonical ? 'Pass' : 'Fail'],
          ['Schema Markup', analysisResult.schema.found ? 'Found' : 'Missing', analysisResult.schema.found ? 'Pass' : 'Fail'],
          ['Robots.txt', analysisResult.robotsTxt.found ? 'Found' : 'Missing', analysisResult.robotsTxt.found ? 'Pass' : 'Fail'],
          ['Broken Links', analysisResult.links.broken.length.toString(), analysisResult.links.broken.length === 0 ? 'Pass' : 'Fail'],
        ];
        content = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        filename = `seo-analysis-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;
      default:
        // For PDF, we'll create a simple text version
        content = `SEO Analysis Report
URL: ${analysisResult.url}
Generated: ${new Date(analysisResult.timestamp).toLocaleString()}
Overall Score: ${analysisResult.overallScore}/100

ISSUES: ${analysisResult.issues}
WARNINGS: ${analysisResult.warnings}
PASSED: ${analysisResult.passed}

META TAGS:
- Title: ${analysisResult.metaTags.title || 'Missing'}
- Description: ${analysisResult.metaTags.description || 'Missing'}
- Keywords: ${analysisResult.metaTags.keywords || 'Missing'}
- Canonical: ${analysisResult.metaTags.canonical || 'Missing'}

TECHNICAL SEO:
- HTML Lang: ${analysisResult.metaTags.htmlLang || 'Missing'}
- Robots Tag: ${analysisResult.metaTags.robots || 'Missing'}
- Schema Markup: ${analysisResult.schema.found ? 'Found' : 'Missing'}
- Robots.txt: ${analysisResult.robotsTxt.found ? 'Found' : 'Missing'}

LINKS:
- Total Links: ${analysisResult.links.total}
- Internal Links: ${analysisResult.links.internal}
- External Links: ${analysisResult.links.external}
- Broken Links: ${analysisResult.links.broken.length}
`;
        filename = `seo-analysis-${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  <Search className="inline-block text-primary mr-2" size={24} />
                  Deep SEO Analyzer
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {analysisResult && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('json')}
                  >
                    <Download className="mr-2" size={16} />
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('csv')}
                  >
                    <Download className="mr-2" size={16} />
                    CSV
                  </Button>
                  <Button
                    onClick={() => handleExport('pdf')}
                    size="sm"
                  >
                    <Download className="mr-2" size={16} />
                    Export Report
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="sm">
                <Settings size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analysis Form */}
        <SEOAnalysisForm onAnalysisComplete={handleAnalysisComplete} />

        {/* Results */}
        {analysisResult && (
          <AnalysisResults result={analysisResult} />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">Deep SEO Analyzer - Comprehensive website SEO analysis tool</p>
            <p className="text-sm">Built for SEO professionals and digital marketers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

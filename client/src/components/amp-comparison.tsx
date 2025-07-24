import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus, Zap, Globe, ExternalLink } from "lucide-react";
import type { SEOAnalysisResult } from "@shared/schema";

interface AmpComparisonProps {
  result: SEOAnalysisResult;
}

export function AmpComparison({ result }: AmpComparisonProps) {
  if (!result.ampComparison || !result.ampUrl || !result.regularUrl) {
    return null;
  }

  const { ampComparison } = result;

  const getImpactIcon = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'neutral':
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          AMP vs Regular Version Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">AMP Version</span>
            </div>
            <a 
              href={result.ampUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-700 hover:text-blue-900 flex items-center gap-1 break-all"
            >
              {result.ampUrl}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">Regular Version</span>
            </div>
            <a 
              href={result.regularUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1 break-all"
            >
              {result.regularUrl}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
        </div>

        {/* Score Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{ampComparison.ampScore}</div>
            <div className="text-sm text-blue-800">AMP Score</div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-lg font-medium text-gray-600">vs</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">{ampComparison.regularScore}</div>
            <div className="text-sm text-gray-800">Regular Score</div>
          </div>
        </div>

        {/* Issues Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xl font-bold text-blue-600">{ampComparison.ampIssues}</div>
            <div className="text-sm text-blue-800">AMP Issues</div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-lg font-medium text-gray-600">vs</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xl font-bold text-gray-600">{ampComparison.regularIssues}</div>
            <div className="text-sm text-gray-800">Regular Issues</div>
          </div>
        </div>

        {/* Detailed Differences */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Detailed Comparison</h4>
          <div className="space-y-3">
            {ampComparison.differences.map((diff, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  {getImpactIcon(diff.impact)}
                  <span className="font-medium">{diff.category}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">AMP</div>
                    <div className="font-medium text-blue-600">{diff.ampValue}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Regular</div>
                    <div className="font-medium text-gray-600">{diff.regularValue}</div>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={`${getImpactColor(diff.impact)} text-xs`}
                  >
                    {diff.impact === 'positive' ? 'Better' : diff.impact === 'negative' ? 'Worse' : 'Same'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">AMP Summary</h4>
          <p className="text-sm text-blue-800">
            {ampComparison.ampScore > ampComparison.regularScore 
              ? "AMP version shows better SEO performance with improved loading times and mobile optimization."
              : ampComparison.ampScore < ampComparison.regularScore
              ? "Regular version performs better, but AMP may still provide benefits for mobile users."
              : "Both versions have similar SEO scores. AMP provides mobile performance benefits."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
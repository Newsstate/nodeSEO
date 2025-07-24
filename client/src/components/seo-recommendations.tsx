import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Lightbulb,
  ExternalLink 
} from "lucide-react";
import type { SEOAnalysisResult } from "@shared/schema";

interface SEORecommendationsProps {
  result: SEOAnalysisResult;
}

export function SEORecommendations({ result }: SEORecommendationsProps) {
  const generateRecommendations = () => {
    const recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      category: string;
      title: string;
      description: string;
      impact: string;
      action: string;
    }> = [];

    // Title optimization
    if (!result.metaTags.title) {
      recommendations.push({
        priority: 'high',
        category: 'Meta Tags',
        title: 'Missing SEO Title',
        description: 'Your page is missing a title tag, which is crucial for search rankings.',
        impact: 'Critical for search visibility',
        action: 'Add a descriptive, keyword-rich title tag (50-60 characters)'
      });
    } else if (result.metaTags.titleLength < 30 || result.metaTags.titleLength > 60) {
      recommendations.push({
        priority: 'medium',
        category: 'Meta Tags',
        title: 'Optimize Title Length',
        description: 'Your title is either too short or too long for optimal display in search results.',
        impact: 'Better click-through rates',
        action: `Adjust title to 50-60 characters (currently ${result.metaTags.titleLength})`
      });
    }

    // Meta description
    if (!result.metaTags.description) {
      recommendations.push({
        priority: 'high',
        category: 'Meta Tags',
        title: 'Missing Meta Description',
        description: 'Meta descriptions help search engines understand your page content.',
        impact: 'Improved search result snippets',
        action: 'Add a compelling meta description (150-160 characters)'
      });
    }

    // Schema markup
    if (!result.schema.found) {
      recommendations.push({
        priority: 'medium',
        category: 'Technical SEO',
        title: 'Add Schema Markup',
        description: 'Structured data helps search engines understand your content better.',
        impact: 'Rich snippets and better rankings',
        action: 'Implement relevant schema.org markup (Article, Organization, etc.)'
      });
    }

    // Performance
    if (result.performance.loadTime > 3000) {
      recommendations.push({
        priority: 'high',
        category: 'Performance',
        title: 'Improve Page Load Speed',
        description: 'Your page loads slowly, which affects user experience and SEO.',
        impact: 'Better user experience and rankings',
        action: 'Optimize images, minify CSS/JS, use CDN'
      });
    }

    // HTTPS
    if (!result.performance.ssl) {
      recommendations.push({
        priority: 'high',
        category: 'Security',
        title: 'Enable HTTPS',
        description: 'Google prioritizes secure websites in search results.',
        impact: 'SEO boost and user trust',
        action: 'Install SSL certificate and redirect HTTP to HTTPS'
      });
    }

    // Social media
    if (!result.openGraph.title) {
      recommendations.push({
        priority: 'low',
        category: 'Social Media',
        title: 'Add Open Graph Tags',
        description: 'Improve how your content appears when shared on social media.',
        impact: 'Better social media engagement',
        action: 'Add og:title, og:description, og:image tags'
      });
    }

    // Accessibility
    if (!result.accessibility.hasAltTags) {
      recommendations.push({
        priority: 'medium',
        category: 'Accessibility',
        title: 'Add Alt Text to Images',
        description: 'Images without alt text hurt accessibility and SEO.',
        impact: 'Better accessibility and image SEO',
        action: 'Add descriptive alt attributes to all images'
      });
    }

    // Broken links
    if (result.links.broken.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Content',
        title: 'Fix Broken Links',
        description: `${result.links.broken.length} broken links found on your page.`,
        impact: 'Better user experience and crawlability',
        action: 'Update or remove broken links'
      });
    }

    return recommendations.sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    });
  };

  const recommendations = generateRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle size={16} />;
      case 'medium': return <TrendingUp size={16} />;
      case 'low': return <Lightbulb size={16} />;
      default: return <CheckCircle size={16} />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="text-primary mr-3" size={20} />
          SEO Recommendations
          <Badge variant="secondary" className="ml-2">
            {recommendations.length} suggestions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Great job!</h3>
            <p className="text-gray-600">Your website follows most SEO best practices.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`p-1 rounded-full mr-3 ${getPriorityColor(rec.priority)}`}>
                      {getPriorityIcon(rec.priority)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {rec.category}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getPriorityColor(rec.priority)}`}
                        >
                          {rec.priority} priority
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 ml-10">
                  <p className="text-sm text-gray-600">{rec.description}</p>
                  <div className="bg-blue-50 rounded p-3">
                    <p className="text-sm font-medium text-blue-900 mb-1">Recommended Action:</p>
                    <p className="text-sm text-blue-800">{rec.action}</p>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <TrendingUp size={12} className="mr-1" />
                    Impact: {rec.impact}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Need help implementing these recommendations?</h4>
              <p className="text-sm text-gray-600 mb-3">
                These suggestions are prioritized by their potential impact on your SEO performance.
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink size={16} className="mr-2" />
                SEO Best Practices Guide
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
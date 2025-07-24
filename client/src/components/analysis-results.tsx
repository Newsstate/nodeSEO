import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tag, 
  Settings, 
  FileText, 
  Code, 
  Link, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Calendar,
  User,
  Globe,
  FileSearch,
  Zap,
  Share2,
  Eye,
  Clock
} from "lucide-react";
import type { SEOAnalysisResult } from "@shared/schema";
import { SEORecommendations } from "./seo-recommendations";
import { AmpComparison } from "./amp-comparison";

interface AnalysisResultsProps {
  result: SEOAnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getStatusBadge = (condition: boolean, text?: string) => {
    if (condition) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1" size={12} />
          {text || "Passed"}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
        <XCircle className="mr-1" size={12} />
        {text || "Failed"}
      </Badge>
    );
  };

  const getWarningBadge = (text: string) => (
    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
      <AlertTriangle className="mr-1" size={12} />
      {text}
    </Badge>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="text-lg">Analysis Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overall Score</span>
              <div className="flex items-center">
                <div className={`w-8 h-8 ${getScoreBgColor(result.overallScore)} rounded-full flex items-center justify-center mr-2`}>
                  <span className={`${getScoreColor(result.overallScore)} font-semibold text-sm`}>
                    {result.overallScore}
                  </span>
                </div>
                <span className={`${getScoreColor(result.overallScore)} font-medium`}>
                  {result.overallScore >= 80 ? "Good" : result.overallScore >= 60 ? "Fair" : "Poor"}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Issues Found</span>
                <span className="text-red-600 font-medium">{result.issues}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Warnings</span>
                <span className="text-amber-600 font-medium">{result.warnings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Passed Tests</span>
                <span className="text-green-600 font-medium">{result.passed}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Navigation</h4>
              <nav className="space-y-1">
                <a href="#meta-tags" className="block text-sm text-gray-600 hover:text-primary py-1">Meta Tags</a>
                <a href="#technical-seo" className="block text-sm text-gray-600 hover:text-primary py-1">Technical SEO</a>
                <a href="#performance" className="block text-sm text-gray-600 hover:text-primary py-1">Performance</a>
                <a href="#social-media" className="block text-sm text-gray-600 hover:text-primary py-1">Social Media</a>
                <a href="#accessibility" className="block text-sm text-gray-600 hover:text-primary py-1">Accessibility</a>
                <a href="#content-analysis" className="block text-sm text-gray-600 hover:text-primary py-1">Content Analysis</a>
                <a href="#schema-markup" className="block text-sm text-gray-600 hover:text-primary py-1">Schema Markup</a>
                <a href="#link-analysis" className="block text-sm text-gray-600 hover:text-primary py-1">Link Analysis</a>
              </nav>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Results */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Meta Tags Section */}
        <Card id="meta-tags">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="text-primary mr-3" size={20} />
              Meta Tags Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* SEO Title */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">SEO Title</h4>
                {getStatusBadge(!!result.metaTags.title)}
              </div>
              {result.metaTags.title ? (
                <>
                  <div className="bg-gray-50 rounded p-3 font-mono text-sm text-gray-700">
                    {result.metaTags.title}
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    Length: <span className="font-medium">{result.metaTags.titleLength}</span> characters 
                    {result.metaTags.titleLength >= 50 && result.metaTags.titleLength <= 60 
                      ? " (Optimal: 50-60)" 
                      : " (Recommended: 50-60)"
                    }
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-600">No title tag found</div>
              )}
            </div>

            {/* Meta Description */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">Meta Description</h4>
                {getStatusBadge(!!result.metaTags.description)}
              </div>
              {result.metaTags.description ? (
                <>
                  <div className="bg-gray-50 rounded p-3 font-mono text-sm text-gray-700">
                    {result.metaTags.description}
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    Length: <span className="font-medium">{result.metaTags.descriptionLength}</span> characters
                    {result.metaTags.descriptionLength >= 150 && result.metaTags.descriptionLength <= 160 
                      ? " (Optimal: 150-160)" 
                      : " (Recommended: 150-160)"
                    }
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-600">No meta description found</div>
              )}
            </div>

            {/* Meta Keywords */}
            {result.metaTags.keywords && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Meta Keywords</h4>
                  {getWarningBadge("Deprecated")}
                </div>
                <div className="bg-gray-50 rounded p-3 font-mono text-sm text-gray-700">
                  {result.metaTags.keywords}
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Length: <span className="font-medium">{result.metaTags.keywordsLength}</span> characters
                  <br />
                  <span className="text-amber-600">Note: Meta keywords are deprecated and not used by search engines</span>
                </div>
              </div>
            )}

            {/* Canonical Tag */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">Canonical Tag</h4>
                {result.metaTags.canonical 
                  ? getStatusBadge(result.metaTags.canonicalMatches)
                  : getStatusBadge(false, "Missing")
                }
              </div>
              {result.metaTags.canonical ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-600">Canonical URL:</span>
                    <div className="bg-gray-50 rounded p-2 font-mono text-sm text-gray-700">
                      {result.metaTags.canonical}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Input URL:</span>
                    <div className="bg-gray-50 rounded p-2 font-mono text-sm text-gray-700">
                      {result.url}
                    </div>
                  </div>
                  <div className={`text-xs ${result.metaTags.canonicalMatches ? 'text-green-600' : 'text-red-600'}`}>
                    {result.metaTags.canonicalMatches ? '✓ Canonical URL matches input URL' : '✗ Canonical URL does not match input URL'}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">No canonical tag found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Technical SEO Section */}
        <Card id="technical-seo">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="text-primary mr-3" size={20} />
              Technical SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Robots Meta Tag */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">Robots Meta Tag</h4>
                {getStatusBadge(!!result.metaTags.robots && result.metaTags.robotsValid)}
              </div>
              {result.metaTags.robots ? (
                <>
                  <div className="bg-gray-50 rounded p-3 font-mono text-sm text-gray-700">
                    {result.metaTags.robots}
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className={`text-xs ${result.metaTags.robots.includes('index') ? 'text-green-600' : 'text-red-600'}`}>
                      {result.metaTags.robots.includes('index') ? '✓ Page is indexable' : '✗ Page is not indexable'}
                    </div>
                    <div className={`text-xs ${result.metaTags.robots.includes('follow') ? 'text-green-600' : 'text-red-600'}`}>
                      {result.metaTags.robots.includes('follow') ? '✓ Links are followable' : '✗ Links are not followable'}
                    </div>
                    {result.metaTags.maxImagePreview && (
                      <div className="text-xs text-green-600">✓ Large image previews allowed</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-600">No robots meta tag found</div>
              )}
            </div>

            {/* HTML Lang Attribute */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">HTML Language</h4>
                {getStatusBadge(!!result.metaTags.htmlLang)}
              </div>
              {result.metaTags.htmlLang ? (
                <>
                  <div className="bg-gray-50 rounded p-3 font-mono text-sm text-gray-700">
                    {result.metaTags.htmlLang}
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    Language: {result.metaTags.htmlLang === 'en' ? 'English' : result.metaTags.htmlLang}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-600">No HTML lang attribute found</div>
              )}
            </div>

            {/* Robots.txt */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">Robots.txt</h4>
                {getStatusBadge(result.robotsTxt.found, result.robotsTxt.found ? "Found" : "Not Found")}
              </div>
              {result.robotsTxt.found && result.robotsTxt.content ? (
                <>
                  <ScrollArea className="h-32 w-full">
                    <div className="bg-gray-50 rounded p-3 font-mono text-xs text-gray-700 whitespace-pre">
                      {result.robotsTxt.content}
                    </div>
                  </ScrollArea>
                  <div className="mt-2">
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      View Full Robots.txt
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-600">No robots.txt file found</div>
              )}
            </div>

            {/* Breadcrumbs */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">Breadcrumbs</h4>
                {getStatusBadge(result.breadcrumbs.found, result.breadcrumbs.found ? "Found" : "Not Found")}
              </div>
              {result.breadcrumbs.found ? (
                <div className="text-sm text-gray-600">
                  Breadcrumb markup detected: {result.breadcrumbs.type}
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  No breadcrumb markup detected. Consider adding schema.org/BreadcrumbList or aria-label="breadcrumb".
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Section */}
        <Card id="performance">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="text-primary mr-3" size={20} />
              Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Clock className="mx-auto text-blue-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-blue-600">{result.performance?.loadTime || 0}ms</div>
                <div className="text-sm text-blue-600">Load Time</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <CheckCircle className="mx-auto text-green-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-green-600">{result.performance?.ssl ? 'Yes' : 'No'}</div>
                <div className="text-sm text-green-600">HTTPS/SSL</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <Link className="mx-auto text-purple-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-purple-600">{result.performance?.redirects || 0}</div>
                <div className="text-sm text-purple-600">Redirects</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <FileText className="mx-auto text-yellow-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-yellow-600">{Math.round((result.performance?.pageSize || 0) / 1024)}KB</div>
                <div className="text-sm text-yellow-600">Page Size</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Section */}
        <Card id="social-media">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="text-primary mr-3" size={20} />
              Social Media Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Open Graph */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">Open Graph Tags</h4>
                {getStatusBadge(!!result.openGraph?.title)}
              </div>
              {result.openGraph?.title ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-600">Title:</span>
                    <div className="bg-gray-50 rounded p-2 font-mono text-sm text-gray-700">{result.openGraph.title}</div>
                  </div>
                  {result.openGraph.description && (
                    <div>
                      <span className="text-xs text-gray-600">Description:</span>
                      <div className="bg-gray-50 rounded p-2 font-mono text-sm text-gray-700">{result.openGraph.description}</div>
                    </div>
                  )}
                  {result.openGraph.image && (
                    <div>
                      <span className="text-xs text-gray-600">Image:</span>
                      <div className="bg-gray-50 rounded p-2 font-mono text-sm text-gray-700">{result.openGraph.image}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-600">No Open Graph tags found</div>
              )}
            </div>

            {/* Twitter Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">Twitter Card</h4>
                {getStatusBadge(!!result.twitterCard?.card)}
              </div>
              {result.twitterCard?.card ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-600">Card Type:</span>
                    <div className="bg-gray-50 rounded p-2 font-mono text-sm text-gray-700">{result.twitterCard.card}</div>
                  </div>
                  {result.twitterCard.title && (
                    <div>
                      <span className="text-xs text-gray-600">Title:</span>
                      <div className="bg-gray-50 rounded p-2 font-mono text-sm text-gray-700">{result.twitterCard.title}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-600">No Twitter Card tags found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Section */}
        <Card id="accessibility">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="text-primary mr-3" size={20} />
              Accessibility Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">Image Alt Tags</h4>
                {getStatusBadge(result.accessibility?.hasAltTags || false)}
              </div>
              <div className="text-sm text-gray-600">
                {result.accessibility?.hasAltTags 
                  ? "Most images have alt attributes for screen readers" 
                  : "Some images are missing alt attributes"
                }
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">Heading Structure</h4>
                {getStatusBadge(result.accessibility?.hasHeadings || false)}
              </div>
              <div className="text-sm text-gray-600">
                {result.accessibility?.hasHeadings 
                  ? "Page has proper heading structure (H1-H6)" 
                  : "No heading elements found on the page"
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Analysis Section */}
        <Card id="content-analysis">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="text-primary mr-3" size={20} />
              Content Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Published Date */}
            {result.dates.published && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Published Date</h4>
                  {getStatusBadge(!!result.dates.published, "Found")}
                </div>
                <div className="bg-gray-50 rounded p-3 font-mono text-sm text-gray-700">
                  {new Date(result.dates.published).toLocaleString()}
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Source: {result.dates.publishedSource}
                </div>
              </div>
            )}

            {/* Modified Date */}
            {result.dates.modified && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Modified Date</h4>
                  {getStatusBadge(!!result.dates.modified, "Found")}
                </div>
                <div className="bg-gray-50 rounded p-3 font-mono text-sm text-gray-700">
                  {new Date(result.dates.modified).toLocaleString()}
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Source: {result.dates.modifiedSource}
                </div>
              </div>
            )}

            {/* Author Profile */}
            {result.author.name && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Author Profile</h4>
                  {getStatusBadge(!!result.author.name, "Found")}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="text-gray-600" size={16} />
                  </div>
                  <div>
                    {result.author.link ? (
                      <a 
                        href={result.author.link} 
                        className="text-primary hover:text-primary/80 font-medium flex items-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {result.author.name}
                        <ExternalLink className="ml-1" size={12} />
                      </a>
                    ) : (
                      <span className="font-medium">{result.author.name}</span>
                    )}
                    <div className="text-xs text-gray-600">
                      Source: {result.author.source}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schema Markup Section */}
        <Card id="schema-markup">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="text-primary mr-3" size={20} />
              Schema Markup
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.schema.found ? (
              <div className="space-y-4">
                {result.schema.types.map((schema, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{schema.type} Schema</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {schema.format}
                      </Badge>
                    </div>
                    <ScrollArea className="h-32 w-full">
                      <div className="bg-gray-50 rounded p-3">
                        <pre className="text-xs font-mono text-gray-700 overflow-x-auto">
                          {JSON.stringify(schema.data, null, 2)}
                        </pre>
                      </div>
                    </ScrollArea>
                  </div>
                ))}
                <div className="text-center py-4">
                  <span className="text-sm text-green-600 font-medium">
                    <CheckCircle className="inline mr-2" size={16} />
                    {result.schema.types.length} schema types detected
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileSearch className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No schema markup detected</p>
                <p className="text-sm text-gray-500 mt-2">
                  Consider adding structured data to improve search engine understanding
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Link Analysis Section */}
        <Card id="link-analysis">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link className="text-primary mr-3" size={20} />
              Link Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Link Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{result.links.total}</div>
                <div className="text-sm text-blue-600">Total Links</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{result.links.internal}</div>
                <div className="text-sm text-green-600">Internal Links</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{result.links.external}</div>
                <div className="text-sm text-purple-600">External Links</div>
              </div>
            </div>

            {/* External Links */}
            {result.links.externalLinks.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">External Links Analysis</h4>
                <ScrollArea className="h-48 w-full">
                  <div className="space-y-2">
                    {result.links.externalLinks.slice(0, 10).map((link, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm text-gray-700 truncate">{link.url}</div>
                          <div className="text-xs text-gray-500 truncate">Link text: "{link.text}"</div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant="secondary" className={link.nofollow ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"}>
                            {link.nofollow ? "Nofollow" : "Follow"}
                          </Badge>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {link.status} OK
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Broken Links */}
            {result.links.broken.length > 0 ? (
              <div className="border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <h4 className="font-medium text-gray-900">Broken Links</h4>
                  <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
                    {result.links.broken.length} Issue{result.links.broken.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {result.links.broken.map((link, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm text-gray-700 truncate">{link.url}</div>
                        <div className="text-xs text-gray-500 truncate">Link text: "{link.text}"</div>
                      </div>
                      <Badge variant="secondary" className="bg-red-100 text-red-800 ml-4">
                        <XCircle className="mr-1" size={12} />
                        {link.status} {link.error || 'Error'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center text-green-600">
                  <CheckCircle className="mr-2" size={20} />
                  <span className="font-medium">No broken links detected</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analysis Summary</span>
              <div className="text-sm text-gray-500">
                Last analyzed: {new Date(result.timestamp).toLocaleString()}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Analysis complete for <span className="font-mono font-medium">{result.url}</span>
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{result.issues}</div>
                  <div className="text-sm text-gray-600">Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{result.warnings}</div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{result.passed}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AMP Comparison */}
        <AmpComparison result={result} />

        {/* SEO Recommendations */}
        <SEORecommendations result={result} />
      </div>
    </div>
  );
}

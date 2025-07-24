import axios from "axios";
import { load } from "cheerio";
import { URL } from "url";
import type { SEOAnalysisResult } from "@shared/schema";

export class SEOAnalyzer {
  private async detectAmpUrl(html: string, originalUrl: string): Promise<string | null> {
    const $ = load(html);
    
    // Check for AMP link in head
    const ampLink = $('link[rel="amphtml"]').attr('href');
    if (ampLink) {
      return new URL(ampLink, originalUrl).toString();
    }
    
    // Check if current page is AMP
    if ($('html').attr('amp') !== undefined || $('html').attr('⚡') !== undefined) {
      return originalUrl;
    }
    
    // Check for common AMP URL patterns
    const url = new URL(originalUrl);
    const ampPatterns = [
      `${url.origin}/amp${url.pathname}`,
      `${url.origin}${url.pathname}/amp/`,
      `${url.origin}${url.pathname}?amp=1`,
      `${url.origin}/amp${url.pathname}${url.search}`,
    ];
    
    for (const ampUrl of ampPatterns) {
      try {
        const response = await axios.head(ampUrl, { timeout: 3000, validateStatus: () => true });
        if (response.status === 200) {
          return ampUrl;
        }
      } catch (error) {
        // Continue to next pattern
      }
    }
    
    return null;
  }

  private async isAmpPage(html: string): Promise<boolean> {
    const $ = load(html);
    return $('html').attr('amp') !== undefined || $('html').attr('⚡') !== undefined;
  }

  private async fetchPage(url: string): Promise<{ html: string; performance: any }> {
    try {
      const startTime = Date.now();
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)',
        },
        maxRedirects: 5,
        validateStatus: () => true,
      });
      
      const loadTime = Date.now() - startTime;
      const contentLength = response.headers['content-length'] ? parseInt(response.headers['content-length']) : response.data.length;
      
      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        html: response.data,
        performance: {
          loadTime,
          responseTime: loadTime,
          redirects: response.request.res?.responseUrl !== url ? 1 : 0,
          ssl: url.startsWith('https://'),
          pageSize: contentLength,
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fetchRobotsTxt(baseUrl: string) {
    try {
      const robotsUrl = new URL('/robots.txt', baseUrl).toString();
      const response = await axios.get(robotsUrl, { timeout: 5000 });
      return response.data;
    } catch (error) {
      return null;
    }
  }

  private async checkLinkStatus(url: string): Promise<{ status: number; error: string | null }> {
    try {
      const response = await axios.head(url, { 
        timeout: 5000,
        validateStatus: () => true // Don't throw on 4xx/5xx
      });
      return { status: response.status, error: null };
    } catch (error) {
      return { 
        status: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private extractMetaTags(html: string, originalUrl: string) {
    const $ = load(html);
    
    const title = $('title').text().trim() || null;
    const description = $('meta[name="description"]').attr('content')?.trim() || null;
    const keywords = $('meta[name="keywords"]').attr('content')?.trim() || null;
    const canonical = $('link[rel="canonical"]').attr('href') || null;
    const robots = $('meta[name="robots"]').attr('content')?.trim() || null;
    const htmlLang = $('html').attr('lang')?.trim() || null;

    let canonicalMatches = false;
    if (canonical) {
      try {
        const canonicalUrl = new URL(canonical, originalUrl);
        const inputUrl = new URL(originalUrl);
        canonicalMatches = canonicalUrl.href === inputUrl.href;
      } catch (error) {
        canonicalMatches = false;
      }
    }

    const robotsValid = robots ? robots.includes('index') || robots.includes('noindex') : false;
    const maxImagePreview = robots ? robots.includes('max-image-preview:large') : false;

    return {
      title,
      titleLength: title ? title.length : 0,
      description,
      descriptionLength: description ? description.length : 0,
      keywords,
      keywordsLength: keywords ? keywords.length : 0,
      canonical,
      canonicalMatches,
      robots,
      robotsValid,
      htmlLang,
      maxImagePreview,
    };
  }

  private extractDates(html: string) {
    const $ = load(html);
    
    let published = null;
    let publishedSource = null;
    let modified = null;
    let modifiedSource = null;

    // Check for Open Graph published time
    const ogPublished = $('meta[property="article:published_time"]').attr('content');
    if (ogPublished) {
      published = ogPublished;
      publishedSource = 'article:published_time meta tag';
    }

    // Check for Open Graph modified time
    const ogModified = $('meta[property="article:modified_time"]').attr('content');
    if (ogModified) {
      modified = ogModified;
      modifiedSource = 'article:modified_time meta tag';
    }

    // Check for time tags
    if (!published) {
      const timeTag = $('time[datetime]').first();
      if (timeTag.length) {
        published = timeTag.attr('datetime') || null;
        publishedSource = 'time tag';
      }
    }

    return {
      published,
      publishedSource,
      modified,
      modifiedSource,
    };
  }

  private extractAuthor(html: string) {
    const $ = load(html);
    
    let name = null;
    let link = null;
    let source = null;

    // Check for rel="author" link
    const authorLink = $('link[rel="author"], a[rel="author"]').first();
    if (authorLink.length) {
      name = authorLink.text().trim() || authorLink.attr('title') || null;
      link = authorLink.attr('href') || null;
      source = 'rel="author" link';
    }

    // Check for meta author
    if (!name) {
      const metaAuthor = $('meta[name="author"]').attr('content');
      if (metaAuthor) {
        name = metaAuthor;
        source = 'meta author tag';
      }
    }

    return { name, link, source };
  }

  private extractBreadcrumbs(html: string) {
    const $ = load(html);
    
    // Check for schema.org BreadcrumbList
    const breadcrumbScript = $('script[type="application/ld+json"]').toArray().find(script => {
      try {
        const data = JSON.parse($(script).text());
        return data['@type'] === 'BreadcrumbList' || 
               (Array.isArray(data) && data.some(item => item['@type'] === 'BreadcrumbList'));
      } catch {
        return false;
      }
    });

    if (breadcrumbScript) {
      try {
        const data = JSON.parse($(breadcrumbScript).text());
        return {
          found: true,
          type: 'schema.org/BreadcrumbList',
          data: Array.isArray(data) ? data : [data],
        };
      } catch {
        // fallthrough
      }
    }

    // Check for aria-label="breadcrumb"
    const ariaBreadcrumb = $('[aria-label="breadcrumb"]');
    if (ariaBreadcrumb.length) {
      return {
        found: true,
        type: 'aria-label="breadcrumb"',
        data: [],
      };
    }

    return {
      found: false,
      type: null,
      data: [],
    };
  }

  private extractSchema(html: string) {
    const $ = load(html);
    const types: Array<{ type: string; format: string; data: any }> = [];

    // Extract JSON-LD
    $('script[type="application/ld+json"]').each((_, script) => {
      try {
        const data = JSON.parse($(script).text());
        const schemas = Array.isArray(data) ? data : [data];
        
        schemas.forEach(schema => {
          if (schema['@type']) {
            types.push({
              type: schema['@type'],
              format: 'JSON-LD',
              data: schema,
            });
          }
        });
      } catch {
        // Skip invalid JSON
      }
    });

    // Extract microdata (basic detection)
    $('[itemtype]').each((_, element) => {
      const itemtype = $(element).attr('itemtype');
      if (itemtype) {
        const type = itemtype.split('/').pop() || itemtype;
        types.push({
          type,
          format: 'Microdata',
          data: { itemtype },
        });
      }
    });

    return {
      found: types.length > 0,
      types,
    };
  }

  private parseRobotsTxt(content: string) {
    const rules: Array<{ userAgent: string; directive: string; path: string }> = [];
    
    if (!content) return rules;

    const lines = content.split('\n');
    let currentUserAgent = '*';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [directive, ...pathParts] = trimmed.split(':');
      const path = pathParts.join(':').trim();

      if (directive.toLowerCase() === 'user-agent') {
        currentUserAgent = path;
      } else if (['allow', 'disallow', 'sitemap'].includes(directive.toLowerCase())) {
        rules.push({
          userAgent: currentUserAgent,
          directive: directive.toLowerCase(),
          path,
        });
      }
    }

    return rules;
  }

  private async analyzeLinks(html: string, baseUrl: string) {
    const $ = load(html);
    const base = new URL(baseUrl);
    
    const allLinks: Array<{ url: string; text: string; isExternal: boolean; nofollow: boolean }> = [];
    
    $('a[href]').each((_, link) => {
      const href = $(link).attr('href');
      const text = $(link).text().trim();
      const nofollow = $(link).attr('rel')?.includes('nofollow') || false;
      
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      try {
        const absoluteUrl = new URL(href, baseUrl);
        const isExternal = absoluteUrl.hostname !== base.hostname;
        
        allLinks.push({
          url: absoluteUrl.href,
          text,
          isExternal,
          nofollow,
        });
      } catch {
        // Skip invalid URLs
      }
    });

    const internalLinks = allLinks.filter(link => !link.isExternal);
    const externalLinks = allLinks.filter(link => link.isExternal);

    // Check for broken links (sample a few to avoid overwhelming the target)
    const linksToCheck = [...internalLinks, ...externalLinks.slice(0, 10)]; // Check up to 10 external links
    const broken: Array<{ url: string; text: string; status: number; error: string | null }> = [];
    
    for (const link of linksToCheck.slice(0, 20)) { // Limit total checks
      const result = await this.checkLinkStatus(link.url);
      if (result.status >= 400 || result.status === 0) {
        broken.push({
          url: link.url,
          text: link.text,
          status: result.status,
          error: result.error,
        });
      }
    }

    return {
      total: allLinks.length,
      internal: internalLinks.length,
      external: externalLinks.length,
      broken,
      externalLinks: externalLinks.map(link => ({
        url: link.url,
        text: link.text,
        nofollow: link.nofollow,
        status: 200, // Default, would need individual checks for accuracy
      })),
    };
  }

  private calculateScore(data: Omit<SEOAnalysisResult, 'overallScore' | 'issues' | 'warnings' | 'passed'>): { score: number; issues: number; warnings: number; passed: number } {
    let score = 0;
    let issues = 0;
    let warnings = 0;
    let passed = 0;

    // Title (10 points)
    if (data.metaTags.title) {
      if (data.metaTags.titleLength >= 50 && data.metaTags.titleLength <= 60) {
        score += 10;
        passed++;
      } else {
        score += 5;
        warnings++;
      }
    } else {
      issues++;
    }

    // Description (10 points)
    if (data.metaTags.description) {
      if (data.metaTags.descriptionLength >= 150 && data.metaTags.descriptionLength <= 160) {
        score += 10;
        passed++;
      } else {
        score += 5;
        warnings++;
      }
    } else {
      issues++;
    }

    // Canonical (5 points)
    if (data.metaTags.canonical) {
      if (data.metaTags.canonicalMatches) {
        score += 5;
        passed++;
      } else {
        warnings++;
      }
    } else {
      warnings++;
    }

    // Robots (5 points)
    if (data.metaTags.robots && data.metaTags.robotsValid) {
      score += 5;
      passed++;
    } else {
      warnings++;
    }

    // HTML Lang (5 points)
    if (data.metaTags.htmlLang) {
      score += 5;
      passed++;
    } else {
      warnings++;
    }

    // Schema (15 points)
    if (data.schema.found) {
      score += 15;
      passed++;
    } else {
      issues++;
    }

    // Robots.txt (5 points)
    if (data.robotsTxt.found) {
      score += 5;
      passed++;
    } else {
      warnings++;
    }

    // Broken links (10 points)
    if (data.links.broken.length === 0) {
      score += 10;
      passed++;
    } else {
      issues += data.links.broken.length;
    }

    // Breadcrumbs (5 points)
    if (data.breadcrumbs.found) {
      score += 5;
      passed++;
    } else {
      warnings++;
    }

    // Max score is 70, normalize to 100
    const normalizedScore = Math.round((score / 70) * 100);

    return {
      score: Math.max(0, Math.min(100, normalizedScore)),
      issues,
      warnings,
      passed,
    };
  }

  private extractOpenGraph(html: string) {
    const $ = load(html);
    
    return {
      title: $('meta[property="og:title"]').attr('content')?.trim() || null,
      description: $('meta[property="og:description"]').attr('content')?.trim() || null,
      image: $('meta[property="og:image"]').attr('content')?.trim() || null,
      type: $('meta[property="og:type"]').attr('content')?.trim() || null,
    };
  }

  private extractTwitterCard(html: string) {
    const $ = load(html);
    
    return {
      card: $('meta[name="twitter:card"]').attr('content')?.trim() || null,
      title: $('meta[name="twitter:title"]').attr('content')?.trim() || null,
      description: $('meta[name="twitter:description"]').attr('content')?.trim() || null,
      image: $('meta[name="twitter:image"]').attr('content')?.trim() || null,
    };
  }

  private extractAccessibility(html: string) {
    const $ = load(html);
    
    const images = $('img');
    const imagesWithAlt = $('img[alt]');
    const hasAltTags = images.length === 0 || imagesWithAlt.length / images.length > 0.8;
    
    const hasHeadings = $('h1, h2, h3, h4, h5, h6').length > 0;
    
    return {
      hasAltTags,
      hasHeadings,
      contrastRatio: null, // Would need more complex analysis
    };
  }

  async analyzeWebsite(url: string): Promise<SEOAnalysisResult> {
    try {
      // Normalize URL
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      
      // Fetch page content
      const { html, performance } = await this.fetchPage(normalizedUrl);
      
      // Check if current page is AMP and detect AMP/regular URLs
      const isCurrentAmp = await this.isAmpPage(html);
      let ampUrl: string | null = null;
      let regularUrl: string | null = null;
      let ampComparison: any = null;

      if (isCurrentAmp) {
        ampUrl = normalizedUrl;
        // Try to find canonical non-AMP version
        const $ = load(html);
        const canonicalLink = $('link[rel="canonical"]').attr('href');
        if (canonicalLink) {
          regularUrl = new URL(canonicalLink, normalizedUrl).toString();
        }
      } else {
        regularUrl = normalizedUrl;
        ampUrl = await this.detectAmpUrl(html, normalizedUrl);
      }

      // Perform all analyses for the main page
      const metaTags = this.extractMetaTags(html, normalizedUrl);
      const dates = this.extractDates(html);
      const author = this.extractAuthor(html);
      const breadcrumbs = this.extractBreadcrumbs(html);
      const schema = this.extractSchema(html);
      const openGraph = this.extractOpenGraph(html);
      const twitterCard = this.extractTwitterCard(html);
      const accessibility = this.extractAccessibility(html);
      const links = await this.analyzeLinks(html, normalizedUrl);
      
      // Fetch robots.txt
      const robotsTxtContent = await this.fetchRobotsTxt(normalizedUrl);
      const robotsTxt = {
        found: !!robotsTxtContent,
        content: robotsTxtContent,
        rules: robotsTxtContent ? this.parseRobotsTxt(robotsTxtContent) : [],
      };

      // Build result object without scores first
      const analysisData = {
        url: normalizedUrl,
        timestamp: new Date().toISOString(),
        metaTags,
        dates,
        author,
        breadcrumbs,
        schema,
        robotsTxt,
        links,
        performance,
        accessibility,
        openGraph,
        twitterCard,
      };

      // Calculate scores for main page
      const scores = this.calculateScore(analysisData);

      // If both AMP and regular versions exist, perform comparison
      if (ampUrl && regularUrl && ampUrl !== regularUrl) {
        try {
          ampComparison = await this.compareAmpAndRegular(ampUrl, regularUrl);
        } catch (error) {
          console.error('AMP comparison failed:', error);
          // Continue without comparison if it fails
        }
      }

      return {
        ...analysisData,
        overallScore: scores.score,
        issues: scores.issues,
        warnings: scores.warnings,
        passed: scores.passed,
        isAmp: isCurrentAmp,
        ampUrl: ampUrl || undefined,
        regularUrl: regularUrl || undefined,
        ampComparison,
      };
      
    } catch (error) {
      throw new Error(`SEO analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async compareAmpAndRegular(ampUrl: string, regularUrl: string) {
    try {
      // Fetch both versions
      const [ampData, regularData] = await Promise.all([
        this.fetchPage(ampUrl),
        this.fetchPage(regularUrl),
      ]);

      // Analyze both versions
      const ampAnalysis = {
        metaTags: this.extractMetaTags(ampData.html, ampUrl),
        schema: this.extractSchema(ampData.html),
        accessibility: this.extractAccessibility(ampData.html),
        performance: ampData.performance,
      };

      const regularAnalysis = {
        metaTags: this.extractMetaTags(regularData.html, regularUrl),
        schema: this.extractSchema(regularData.html),
        accessibility: this.extractAccessibility(regularData.html),
        performance: regularData.performance,
      };

      // Calculate scores for both
      const ampScores = this.calculateScore({
        url: ampUrl,
        timestamp: new Date().toISOString(),
        ...ampAnalysis,
        dates: this.extractDates(ampData.html),
        author: this.extractAuthor(ampData.html),
        breadcrumbs: this.extractBreadcrumbs(ampData.html),
        robotsTxt: { found: false, content: null, rules: [] },
        links: { total: 0, internal: 0, external: 0, broken: [], externalLinks: [] },
        openGraph: this.extractOpenGraph(ampData.html),
        twitterCard: this.extractTwitterCard(ampData.html),
      });

      const regularScores = this.calculateScore({
        url: regularUrl,
        timestamp: new Date().toISOString(),
        ...regularAnalysis,
        dates: this.extractDates(regularData.html),
        author: this.extractAuthor(regularData.html),
        breadcrumbs: this.extractBreadcrumbs(regularData.html),
        robotsTxt: { found: false, content: null, rules: [] },
        links: { total: 0, internal: 0, external: 0, broken: [], externalLinks: [] },
        openGraph: this.extractOpenGraph(regularData.html),
        twitterCard: this.extractTwitterCard(regularData.html),
      });

      // Generate comparison differences
      const differences = [
        {
          category: 'Load Time',
          ampValue: `${ampAnalysis.performance.loadTime}ms`,
          regularValue: `${regularAnalysis.performance.loadTime}ms`,
          impact: ampAnalysis.performance.loadTime < regularAnalysis.performance.loadTime ? 'positive' as const : 'negative' as const,
        },
        {
          category: 'Page Size',
          ampValue: `${Math.round(ampAnalysis.performance.pageSize / 1024)}KB`,
          regularValue: `${Math.round(regularAnalysis.performance.pageSize / 1024)}KB`,
          impact: ampAnalysis.performance.pageSize < regularAnalysis.performance.pageSize ? 'positive' as const : 'negative' as const,
        },
        {
          category: 'Schema Markup',
          ampValue: ampAnalysis.schema.found ? 'Present' : 'Missing',
          regularValue: regularAnalysis.schema.found ? 'Present' : 'Missing',
          impact: ampAnalysis.schema.found === regularAnalysis.schema.found ? 'neutral' as const : (ampAnalysis.schema.found ? 'positive' as const : 'negative' as const),
        },
      ];

      return {
        ampScore: ampScores.score,
        regularScore: regularScores.score,
        ampIssues: ampScores.issues,
        regularIssues: regularScores.issues,
        differences,
      };
    } catch (error) {
      throw new Error(`AMP comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const seoAnalyzer = new SEOAnalyzer();

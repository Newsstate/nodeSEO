# Deep SEO Analysis Tool

## Overview

This is a comprehensive full-stack web application for performing deep SEO analysis of websites. The application analyzes 15+ SEO factors including meta tags, schema markup, robots.txt, links, performance metrics, social media optimization, and accessibility. It provides detailed reports with scoring, actionable recommendations, and export capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Storage**: PostgreSQL-based sessions with connect-pg-simple
- **Web Scraping**: Cheerio for HTML parsing and analysis
- **HTTP Client**: Axios for external requests

### Key Components

#### Enhanced SEO Analysis Engine
- **Core Service**: `SEOAnalyzer` class that performs comprehensive website analysis across 15+ factors
- **Analysis Features**:
  - **Meta Tags**: Title, description, keywords with length validation
  - **Technical SEO**: Canonical tags, robots meta, HTML lang, max-image-preview
  - **Performance Metrics**: Load time, page size, HTTPS/SSL, redirects
  - **Social Media Optimization**: Open Graph tags, Twitter Card metadata
  - **Accessibility**: Alt text validation, heading structure analysis
  - **Schema Markup**: JSON-LD and microdata detection with full validation
  - **Content Analysis**: Publication dates, author profiles, breadcrumbs
  - **Link Analysis**: Broken link detection, external link analysis with nofollow detection
  - **Robots.txt**: Parsing and rule analysis
  - **Smart Scoring**: Weighted scoring algorithm with issue prioritization
  - **AI Recommendations**: Contextual SEO improvement suggestions with priority levels

#### Data Storage
- **In-Memory Storage**: `MemStorage` class for development/testing
- **Database Schema**: 
  - Users table for authentication
  - SEO analyses table for storing analysis results with JSONB data
- **Migration System**: Drizzle Kit for database schema management

#### Enhanced Frontend Components
- **Smart Analysis Form**: Enhanced URL validation with real-time progress tracking and step visualization
- **Comprehensive Results Display**: Multi-tabbed analysis results with interactive navigation
- **SEO Recommendations Engine**: AI-powered suggestions with priority levels and actionable steps
- **Advanced Export Options**: JSON, CSV, and text format exports with detailed metrics
- **Performance Dashboard**: Real-time performance metrics and load time analysis
- **Social Media Preview**: Open Graph and Twitter Card validation and preview
- **Accessibility Audit**: Image alt text and heading structure analysis
- **Mobile-Responsive Design**: Optimized for all device sizes with sticky navigation

## Data Flow

1. **Analysis Request**: User submits URL through the SEO analysis form
2. **Validation**: Frontend validates URL format using Zod schema
3. **API Call**: Frontend sends POST request to `/api/analyze` endpoint
4. **Web Scraping**: Backend fetches the webpage content using Axios
5. **Analysis Processing**: SEOAnalyzer processes the HTML content
6. **Data Storage**: Analysis results are stored in PostgreSQL database
7. **Response**: Frontend receives analysis results and displays them
8. **Export Options**: Users can export results in multiple formats

## External Dependencies

### Production Dependencies
- **Database**: `@neondatabase/serverless` for Neon Database connectivity
- **ORM**: `drizzle-orm` with PostgreSQL dialect
- **UI Components**: Extensive Radix UI component library
- **Validation**: `zod` for runtime type validation
- **HTTP Client**: `axios` for reliable HTTP requests
- **Web Scraping**: `cheerio` for server-side HTML parsing
- **Date Handling**: `date-fns` for date manipulation
- **State Management**: `@tanstack/react-query` for caching and synchronization

### Development Dependencies
- **Build Tools**: Vite with React plugin
- **TypeScript**: Full TypeScript support across frontend and backend
- **CSS Framework**: Tailwind CSS with PostCSS
- **Development Server**: Express with Vite middleware integration

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React application to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Single Artifact**: Combined frontend and backend in single deployment

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL` environment variable
- **Development**: Hot reload with Vite middleware integration
- **Production**: Static file serving with Express

### Database Management
- **Schema**: Defined in `shared/schema.ts` with Drizzle ORM
- **Migrations**: Generated and applied using Drizzle Kit
- **Sessions**: PostgreSQL-based session storage for scalability

### Scalability Considerations
- **Database**: Serverless PostgreSQL (Neon) for automatic scaling
- **Caching**: React Query for client-side caching
- **Error Handling**: Comprehensive error boundaries and API error handling
- **Performance**: Optimized bundle sizes and lazy loading strategies

The application follows a monorepo structure with shared TypeScript types and schemas, enabling type safety across the full stack while maintaining clear separation of concerns between frontend and backend components.
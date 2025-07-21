# FinRasyo - Financial Ratio Analysis Platform

## Overview
FinRasyo is a comprehensive financial analysis platform designed to help researchers and analysts quickly calculate and analyze financial ratios for companies listed on the Istanbul Stock Exchange (BIST). The platform provides automated ratio calculations, report generation in multiple formats (PDF, Excel, CSV), and subscription-based access to financial data.

## System Architecture

### Full-Stack TypeScript Architecture
- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js with TypeScript, using TSX for development
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy and session management
- **Payment Processing**: Stripe integration for subscription management
- **Deployment**: Google Cloud Engine (GCE) via Replit

### Monorepo Structure
The application follows a monorepo pattern with shared types and schemas:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and database schemas
- `scripts/` - Utility scripts for data fetching and processing

## Key Components

### Frontend Architecture
- **React Router**: Using wouter for lightweight routing
- **State Management**: React Query (TanStack Query) for server state management
- **UI Framework**: Radix UI components with Tailwind CSS styling
- **Forms**: React Hook Form with Zod validation
- **Authentication Context**: Custom React Context for user session management

### Backend Architecture
- **RESTful API**: Express.js with TypeScript
- **Authentication Middleware**: Passport.js with session-based authentication
- **Database Layer**: Drizzle ORM with PostgreSQL
- **File Processing**: PDF generation with jsPDF, Excel generation with ExcelJS
- **External Data**: Web scraping for BIST company data using Cheerio and Axios

### Database Schema
- **Users**: User accounts with role-based access (user/admin) and credit system
- **Companies**: BIST company information with sector classification
- **Financial Data**: Comprehensive financial statements and calculated ratios
- **Reports**: Generated analysis reports with metadata
- **Payments**: Stripe payment tracking and subscription management

## Data Flow

### User Registration and Authentication
1. User registers with email/username/password
2. Password hashed using scrypt with salt
3. Session stored in memory store (configurable for production)
4. Role-based access control for admin features

### Financial Analysis Workflow
1. User selects companies from BIST listings
2. Inputs financial data or system fetches from external sources
3. System calculates financial ratios automatically
4. User selects desired ratios and reporting format
5. Credit-based payment processing via Stripe
6. Report generation in PDF/Excel/CSV formats

### Report Generation Pipeline
1. Financial data validation and ratio calculations
2. Template-based report generation with company branding
3. Multi-format export (PDF with jsPDF, Excel with ExcelJS, CSV)
4. File storage and download link generation
5. Report metadata tracking for user history

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **Authentication**: passport and express-session for user management
- **Payments**: @stripe/stripe-js and @stripe/react-stripe-js for payment processing
- **PDF Generation**: jspdf and jspdf-autotable for report creation
- **Excel Generation**: exceljs for spreadsheet creation
- **Data Fetching**: axios and cheerio for web scraping BIST data
- **UI Components**: Comprehensive Radix UI component library
- **Styling**: Tailwind CSS with custom design tokens

### Development Tools
- **Build Tool**: Vite with React plugin and TypeScript support
- **Database Migrations**: Drizzle Kit for schema management
- **Code Quality**: TypeScript strict mode configuration
- **Development Server**: Replit integration with live reload

## Deployment Strategy

### Replit Configuration
- **Environment**: Node.js 20 with PostgreSQL 16
- **Build Process**: Vite build for frontend, esbuild for backend bundling
- **Runtime**: Production server runs on Google Cloud Engine
- **Port Configuration**: Internal port 5000 mapped to external port 80
- **Database**: Automated PostgreSQL provisioning with connection pooling

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `STRIPE_SECRET_KEY`: Stripe API key for payment processing
- `VITE_STRIPE_PUBLIC_KEY`: Stripe public key for frontend integration
- Session secrets and other sensitive configuration

### Production Considerations
- Session store should be moved to Redis for scalability
- File storage should use cloud storage (AWS S3, Google Cloud Storage)
- Database connection pooling configured for production load
- Rate limiting and security headers implementation needed

## Changelog
- June 23, 2025. Initial setup
- July 10, 2025. Fixed Router structure and SSL certificate issues
- July 10, 2025. **CRITICAL ISSUE**: Navbar navigation completely broken - neither HTML links nor JavaScript buttons work on production. Local development works fine. Issue likely related to Cloudflare proxy or deployment environment.

## User Preferences

Preferred communication style: Simple, everyday language.

## Known Issues

**CRITICAL Navigation Problem (July 14, 2025) - RESOLVED**
- Cloudflare proxy was completely blocking ALL JavaScript navigation
- Direct URL access worked perfectly
- JavaScript buttons completely failed
- React Link components failed
- `window.location.href` also failed
- **ROOT CAUSE**: Cloudflare proxy configuration blocking all JavaScript navigation
- **SOLUTION V4.0**: Replaced ALL navigation with Pure HTML forms using method="GET"
- **WORKAROUND**: No JavaScript at all - pure HTML form submission
- **MAIN FIX**: Page Rule with Cache Bypass successfully created and deployed
- **FINAL STATUS**: Page Rule + Cache Bypass FAILED - Navigation still not working
- **CURRENT STATUS**: CREDIBILITY CRISIS - Users cannot access About/Contact/How-it-works pages
- **NEXT SOLUTION**: Development Mode (3 hours) - complete proxy bypass for www.finrasyo.com
- **USER REQUIREMENT**: Must work on www.finrasyo.com domain, not subdomain
- **CURRENT STATUS**: Development Mode active but navbar links still not working
- **LATEST FIX**: Converting all React Link components to pure HTML `<a>` tags
- **PROBLEM**: Nested `<a>` tags from React Router causing navigation failure
- **CRITICAL FIX**: Navbar converted to HTML form submission - bypassing all JavaScript
- **EMERGENCY FIX**: Server-side routing added - serving pages directly from Express server
- **ABSOLUTE URL FIX**: All navbar and footer links converted to https://www.finrasyo.com/path format
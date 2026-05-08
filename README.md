# Tracker - Enterprise Compliance & Certification Management Platform

A production-ready SaaS platform for managing compliance certifications, frameworks, and renewals with enterprise-grade security and premium UX.

## 🎯 Overview

Tracker is a comprehensive compliance management system designed for enterprises to:

- 🔐 Track certifications and compliance frameworks
- 📅 Monitor expiry dates and renewal timelines  
- 📊 Generate compliance dashboards and insights
- 🔍 Maintain audit readiness and centralized compliance visibility
- 📈 Upload and manage Excel/CSV data with intelligent mapping
- 🛡️ Enforce enterprise-grade security and access controls

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 15+ with App Router
- TypeScript
- TailwindCSS with shadcn/ui
- Framer Motion for animations
- React Query for state management
- Zustand for app state

**Backend:**
- NestJS with TypeScript
- Prisma ORM
- PostgreSQL
- JWT + Refresh token rotation
- RBAC authorization

**Infrastructure:**
- Docker & Docker Compose
- NGINX reverse proxy
- HTTPS/TLS enforcement
- Environment-based configuration

## 📁 Project Structure

```
tracker/
├── backend/                 # NestJS application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── certifications/ # Certifications module
│   │   ├── frameworks/     # Compliance frameworks
│   │   ├── uploads/        # File upload handling
│   │   ├── reports/        # Report generation
│   │   ├── audit-logs/     # Audit trail
│   │   ├── common/         # Shared utilities
│   │   ├── config/         # Configuration
│   │   ├── security/       # Security middleware
│   │   └── main.ts
│   ├── prisma/             # Database schema
│   ├── package.json
│   └── Dockerfile
├── frontend/               # Next.js application
│   ├── app/
│   │   ├── login/         # Login page
│   │   ├── dashboard/     # Main dashboard
│   │   ├── certifications/# Certifications module
│   │   ├── frameworks/    # Frameworks module
│   │   ├── uploads/       # Data upload page
│   │   ├── reports/       # Reports page
│   │   ├── calendar/      # Expiry calendar
│   │   ├── audit-logs/    # Audit logs page
│   │   ├── settings/      # Settings pages
│   │   ├── profile/       # User profile
│   │   └── layout.tsx
│   ├── components/        # UI components
│   ├── lib/              # Utilities
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   ├── package.json
│   └── Dockerfile
├── docker/
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── .env.example
├── docs/                 # Documentation
├── scripts/              # Utility scripts
├── .github/
│   └── copilot-instructions.md
└── package.json          # Root package.json
```

## 🚀 Getting Started

### Quick Start (Recommended)

The easiest way to get started is using our auto-setup script:

```bash
./start
```

This script will automatically:
- ✅ Check system requirements
- ✅ Install missing dependencies (Node.js, Docker, etc.)
- ✅ Set up environment configuration with secure defaults
- ✅ Generate SSL certificates
- ✅ Build and start all services
- ✅ Run database migrations
- ✅ Perform health checks

### Manual Installation

If you prefer manual setup:

**Prerequisites:**
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+

**Steps:**
1. **Clone and setup:**
   ```bash
   cd tracker
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp docker/.env.example docker/.env
   # Edit docker/.env with your configuration
   ```

3. **Start services:**
   ```bash
   cd docker && docker-compose up -d
   ```

4. **Run migrations:**
   ```bash
   cd ../backend && npm run prisma:migrate:deploy
   ```

5. **Start development:**
   ```bash
   cd ../frontend && npm run dev
   ```

Access the application at `https://localhost:3000`

### Start Script Options

```bash
./start          # Default setup and start
./start --dev     # Development mode
./start --prod    # Production mode
./start --help    # Show all options
```

## 🔐 Security Features

### Authentication & Authorization
- ✅ Argon2id password hashing
- ✅ JWT access + refresh token rotation
- ✅ HTTP-only secure cookies
- ✅ RBAC with permission matrix
- ✅ MFA-ready architecture
- ✅ Brute force protection & rate limiting
- ✅ Session management with timeout
- ✅ Device & IP tracking

### API Security
- ✅ Input validation with Zod
- ✅ SQL injection prevention via Prisma
- ✅ CSRF protection
- ✅ API rate limiting & throttling
- ✅ Request size limits
- ✅ API versioning
- ✅ No sensitive error leakage

### Data Protection
- ✅ Encrypted environment secrets
- ✅ Row-level authorization
- ✅ Secure file uploads with malware scanning
- ✅ Signed URLs for downloads
- ✅ Database backups

### Frontend Security
- ✅ Strict Content Security Policy
- ✅ XSS sanitization with DOMPurify
- ✅ Escape all user input
- ✅ Security headers (HSTS, X-Frame-Options, etc.)

### Infrastructure
- ✅ HTTPS/TLS enforced
- ✅ Docker hardening
- ✅ Non-root containers
- ✅ NGINX reverse proxy
- ✅ Centralized audit logging
- ✅ Fail2ban-ready structure

## 📊 Key Features

### Dashboard
- Executive summary with KPIs
- Certification overview (total, active, expired)
- Compliance percentage tracking
- Expiry trend analytics
- Framework distribution charts
- Recent activity feed
- Quick action buttons

### Certifications Management
- Complete CRUD operations
- Advanced filtering & search
- Expiry alerts with countdown
- Status badges (Active/Expiring/Expired)
- Document/evidence uploads
- Logo management
- Timeline view
- Export functionality

### Compliance Frameworks
- Track ISO 27001, SOC 2, HIPAA, PCI DSS, GDPR, NIST, etc.
- Maturity level tracking
- Compliance percentage calculation
- Associated certifications mapping
- Owner assignment
- Review scheduling

### Data Imports
- Excel (.xlsx) and CSV support
- Drag & drop upload
- Intelligent schema auto-mapping
- Data preview before import
- Duplicate detection
- Import validation & rollback
- Upload audit trail

### Reports & Analytics
- Expiry forecast reports
- Compliance status reports
- Renewal timeline projections
- Audit readiness summaries
- Framework coverage analysis
- Export to PDF, CSV, Excel

### Audit & Compliance
- Complete audit trail with timestamps
- User activity tracking
- Data modification history
- Login event logging
- File upload tracking
- IP and device monitoring
- Security event alerts

## 🎨 UI/UX Design

- **Inspiration**: Apple.com premium design
- **Aesthetic**: Minimalist, elegant, enterprise-grade
- **Effects**: Glassmorphism, frosted glass, smooth animations
- **Typography**: Roboto font family
- **Components**: shadcn/ui with custom styling
- **Animations**: Framer Motion for smooth transitions
- **Responsiveness**: Mobile-first design, fully responsive

## 📋 Roles & Permissions

- **Super Admin**: Full system access, user management, organization settings
- **Compliance Manager**: Manage certifications, frameworks, create reports
- **Auditor**: View-only access, audit log access
- **Viewer**: Read-only access to dashboards and reports

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Migrations
```bash
npm run db:migrate
npm run db:seed  # Optional: seed sample data
```

### Running Tests
```bash
npm run test
npm run test:e2e
```

### Linting & Formatting
```bash
npm run lint
npm run format
```

## 📦 Production Deployment

### Docker Build
```bash
docker build -f docker/backend.Dockerfile -t tracker-backend:latest .
docker build -f docker/frontend.Dockerfile -t tracker-frontend:latest .
```

### Deployment with Docker Compose
```bash
docker-compose -f docker/docker-compose.prod.yml up -d
```

### Health Checks
```bash
curl https://api.tracker.local/health
curl https://tracker.local/health
```

## 🔍 Monitoring & Logging

- Centralized audit logs in PostgreSQL
- Security event tracking
- User activity monitoring
- Failed login tracking
- API request logging
- Database query logging
- Container health monitoring

## 📚 API Documentation

Full API documentation available at `https://api.tracker.local/api/docs` (Swagger UI)

### Key Endpoints
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh tokens
- `GET /certifications` - List certifications
- `POST /certifications` - Create certification
- `POST /uploads` - Upload Excel/CSV data
- `GET /reports` - Generate reports
- `GET /audit-logs` - View audit trail

## 🆘 Support & Help

- Local development help: See `/docs`
- API documentation: Check Swagger UI
- Security concerns: Contact security team
- Feature requests: Use GitHub issues

## 📄 License

Proprietary - All rights reserved

## ✅ Compliance

This platform implements:
- ✅ OWASP Top 10 (2026) protections
- ✅ Secure by Design principles
- ✅ Zero Trust architecture
- ✅ Defense in Depth strategy
- ✅ GDPR compliance features
- ✅ SOC 2 audit readiness

---

**Version**: 1.0.0  
**Last Updated**: May 2026  
**Status**: Production Ready

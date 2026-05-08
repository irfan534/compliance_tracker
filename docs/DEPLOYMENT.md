# Deployment Guide

## Overview

This guide covers the deployment of the Tracker Enterprise Compliance Platform in production environments.

## Prerequisites

- Docker & Docker Compose
- OpenSSL (for SSL certificate generation)
- At least 4GB RAM
- 20GB+ storage space
- Linux/macOS/Windows with WSL2

## Quick Start

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd tracker
   ```

2. **Configure Environment**
   ```bash
   cp docker/.env.example docker/.env
   # Edit docker/.env with your configuration
   ```

3. **Deploy**
   ```bash
   ./scripts/deploy.sh --seed
   ```

4. **Access Application**
   - Frontend: https://localhost
   - API: https://localhost/api
   - API Docs: https://localhost/api/docs

## Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://tracker_user:your_password@postgres:5432/tracker_db"
DB_PASSWORD="your_secure_password"

# Security
JWT_SECRET="your-super-secure-jwt-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-key-min-32-chars"

# Application
NODE_ENV="production"
CORS_ORIGIN="https://your-domain.com"
```

### Optional Configuration

```bash
# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Upload
MAX_FILE_SIZE="104857600"  # 100MB
```

## Production Deployment

### SSL/TLS Setup

For production, replace the self-signed certificates:

1. **Obtain SSL Certificate**
   ```bash
   # Using Let's Encrypt (recommended)
   certbot certonly --standalone -d your-domain.com
   ```

2. **Update NGINX Configuration**
   ```bash
   cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/ssl/cert.pem
   cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/ssl/key.pem
   ```

### Database Setup

1. **External Database (Recommended for Production)**
   ```bash
   # Update docker/.env
   DATABASE_URL="postgresql://user:pass@your-db-host:5432/tracker_db"
   ```

2. **Database Backups**
   ```bash
   # Backup
   docker-compose exec postgres pg_dump -U tracker_user tracker_db > backup.sql
   
   # Restore
   docker-compose exec -T postgres psql -U tracker_user tracker_db < backup.sql
   ```

### Scaling

1. **Horizontal Scaling**
   ```bash
   # Scale backend services
   docker-compose up -d --scale backend=3
   ```

2. **Load Balancing**
   - Update NGINX configuration for multiple backend instances
   - Consider using Kubernetes for orchestration

## Security Considerations

### Production Security Checklist

- [ ] Change all default passwords
- [ ] Use proper SSL certificates
- [ ] Enable firewall rules
- [ ] Set up log monitoring
- [ ] Regular security updates
- [ ] Database encryption at rest
- [ ] Backup encryption
- [ ] Network segmentation

### Security Headers

The application includes comprehensive security headers:

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

## Monitoring & Logging

### Application Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Health Monitoring

```bash
# Check service health
curl https://your-domain.com/health

# Check backend API
curl https://your-domain.com/api/health
```

### Metrics Collection

Consider implementing:

- Prometheus for metrics collection
- Grafana for visualization
- ELK stack for log aggregation

## Maintenance

### Regular Tasks

1. **Weekly**
   - Security updates
   - Log rotation
   - Backup verification

2. **Monthly**
   - Dependency updates
   - SSL certificate renewal
   - Performance monitoring

3. **Quarterly**
   - Security audit
   - Database optimization
   - Capacity planning

### Updates

```bash
# Update application
git pull origin main
./scripts/deploy.sh

# Update dependencies
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **Services Not Starting**
   ```bash
   # Check logs
   docker-compose logs
   
   # Check resource usage
   docker stats
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   docker-compose exec backend npm run prisma:db:push
   ```

3. **SSL Certificate Issues**
   ```bash
   # Verify certificates
   openssl x509 -in docker/ssl/cert.pem -text -noout
   ```

### Performance Tuning

1. **Database Optimization**
   - Add proper indexes
   - Monitor query performance
   - Configure connection pooling

2. **Application Caching**
   - Redis for session storage
   - CDN for static assets
   - Application-level caching

## Support

For deployment issues:

1. Check the logs: `docker-compose logs`
2. Verify configuration: `docker/.env`
3. Consult the API documentation: `/api/docs`
4. Review security guidelines in the main README

## Compliance Notes

This deployment setup includes:

- **GDPR Compliance**: Data encryption, access controls, audit logging
- **SOC 2 Ready**: Security controls, monitoring, documentation
- **ISO 27001 Aligned**: Security management framework
- **HIPAA Considerations**: Data protection, audit trails

Ensure to conduct regular compliance audits and maintain documentation for regulatory requirements.

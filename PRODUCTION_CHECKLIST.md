# OverseasJob.in - Production Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Copy `.env.example` to `.env` and fill in all values
- [ ] Copy `backend/.env.example` to `backend/.env` and configure
- [ ] Copy `frontend/.env.example` to `frontend/.env.local` and configure
- [ ] Generate strong JWT secret
- [ ] Configure payment gateway credentials (Razorpay/Stripe)
- [ ] Set up AWS S3 credentials for file storage
- [ ] Configure mail server settings

### Security
- [ ] Change all default passwords
- [ ] Generate unique APP_KEY for Laravel
- [ ] Set strong MySQL root password
- [ ] Configure Redis password (if needed)
- [ ] Enable SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up fail2ban for brute force protection

### SSL Certificates
```bash
# Using Let's Encrypt
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
```

## Deployment Steps

### 1. Build and Start Services
```bash
# Build all services
docker-compose build --no-cache

# Start services
docker-compose up -d

# Verify all services are running
docker-compose ps
```

### 2. Database Setup
```bash
# Wait for MySQL to be ready
docker-compose exec mysql mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD}

# Run migrations
docker-compose exec backend php artisan migrate --force

# Seed default data
docker-compose exec backend php artisan db:seed --force

# Generate application key
docker-compose exec backend php artisan key:generate

# Generate JWT secret
docker-compose exec backend php artisan jwt:secret
```

### 3. Cache and Optimization
```bash
# Cache configuration
docker-compose exec backend php artisan config:cache

# Cache routes
docker-compose exec backend php artisan route:cache

# Cache views
docker-compose exec backend php artisan view:cache

# Optimize autoloader
docker-compose exec backend composer dump-autoload --optimize
```

### 4. File Permissions
```bash
# Set proper permissions
docker-compose exec backend chown -R www-data:www-data storage bootstrap/cache

docker-compose exec backend chmod -R 775 storage bootstrap/cache
```

### 5. Health Checks
```bash
# Test all health endpoints
curl -f http://localhost/health
curl -f http://localhost/api/health
curl -f http://localhost/ai/health
```

## Post-Deployment

### Monitoring Setup
- [ ] Set up log aggregation (ELK stack or similar)
- [ ] Configure application monitoring (Prometheus/Grafana)
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring

### Backup Configuration
```bash
# Database backup cron job (daily at 2 AM)
0 2 * * * /path/to/backup-script.sh

# Backup script content:
#!/bin/bash
BACKUP_DIR="/backups/mysql/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
docker-compose exec -T mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} > $BACKUP_DIR/backup.sql
gzip $BACKUP_DIR/backup.sql
```

### SSL Auto-Renewal
```bash
# Add to crontab (twice daily)
0 0,12 * * * certbot renew --quiet && docker-compose restart nginx
```

## Verification

### API Endpoints
- [ ] Test user registration
- [ ] Test user login
- [ ] Test resume creation
- [ ] Test job search
- [ ] Test application submission
- [ ] Test payment flow (test mode)

### AI Service
- [ ] Test resume parsing
- [ ] Test ATS scoring
- [ ] Test job matching
- [ ] Verify model loading

### Frontend
- [ ] Test all pages load correctly
- [ ] Test responsive design
- [ ] Test form submissions
- [ ] Test file uploads

## Performance Optimization

### Database
- [ ] Add indexes for frequently queried columns
- [ ] Configure query cache
- [ ] Monitor slow queries

### Application
- [ ] Enable OPcache
- [ ] Configure Redis for sessions and cache
- [ ] Set up CDN for static assets

### AI Service
- [ ] Monitor memory usage
- [ ] Scale horizontally if needed
- [ ] Cache frequently used embeddings

## Security Checklist

- [ ] All secrets stored in environment variables
- [ ] No hardcoded credentials in code
- [ ] Database not exposed to internet
- [ ] Redis not exposed to internet
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens for forms

## Rollback Plan

```bash
# If deployment fails:

# 1. Stop services
docker-compose down

# 2. Restore database from backup
docker-compose up -d mysql
docker-compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} < backup.sql

# 3. Start services
docker-compose up -d
```

## Support Contacts

- Technical Support: devops@overseasjob.in
- Emergency Contact: +91-XXX-XXX-XXXX
- Documentation: https://docs.overseasjob.in

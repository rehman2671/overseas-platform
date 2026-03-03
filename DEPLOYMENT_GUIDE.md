# OverseasJob.in - Deployment Guide

## Prerequisites

- Docker Engine 24.0+
- Docker Compose 2.20+
- 8GB+ RAM available
- 50GB+ disk space
- Domain name (for production)
- SSL certificates (for production)

## Local Development Deployment

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd overseasjob-project

# Create environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit environment files with your settings
nano .env
nano backend/.env
nano frontend/.env.local
```

### 2. Build and Start Services

```bash
# Build all services
docker-compose build

# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Database Setup

```bash
# Run migrations
docker-compose exec backend php artisan migrate

# Seed default data (optional)
docker-compose exec backend php artisan db:seed

# Generate app key
docker-compose exec backend php artisan key:generate

# Generate JWT secret
docker-compose exec backend php artisan jwt:secret
```

### 4. Verify Deployment

```bash
# Check all services are running
docker-compose ps

# Test health endpoints
curl http://localhost/health
curl http://localhost/api/health
curl http://localhost/ai/health
```

### 5. Access Application

- Frontend: http://localhost
- API: http://localhost/api
- AI Service: http://localhost/ai
- phpMyAdmin (if configured): http://localhost:8080

## Production Deployment

### 1. Server Requirements

- Ubuntu 22.04 LTS or similar
- 4 CPU cores
- 16GB RAM
- 100GB SSD
- Static IP address

### 2. Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 3. SSL Certificates (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to project
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
```

### 4. Production Configuration

Update `nginx/nginx.conf` for SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # ... rest of configuration
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 5. Environment Variables

Create production `.env`:

```bash
# App
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database
DB_HOST=mysql
DB_DATABASE=overseasjob
DB_USERNAME=overseasjob
DB_PASSWORD=<strong-password>

# Redis
REDIS_PASSWORD=<strong-password>

# JWT
JWT_SECRET=<generate-random-string>

# AWS S3
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_BUCKET=overseasjob-production

# Payments
RAZORPAY_KEY_ID=<live-key>
RAZORPAY_KEY_SECRET=<live-secret>
RAZORPAY_WEBHOOK_SECRET=<webhook-secret>
```

### 6. Deploy Application

```bash
# Pull latest code
git pull origin main

# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec backend php artisan migrate --force

# Optimize Laravel
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache
docker-compose exec backend php artisan view:cache

# Set permissions
docker-compose exec backend chown -R www-data:www-data storage bootstrap/cache
```

### 7. Setup Auto-Renewal for SSL

```bash
# Create renewal hook
sudo nano /etc/letsencrypt/renewal-hooks/deploy/restart-nginx.sh

#!/bin/bash
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/project/nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /path/to/project/nginx/ssl/
docker-compose restart nginx

# Make executable
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/restart-nginx.sh

# Test renewal
sudo certbot renew --dry-run
```

### 8. Setup Monitoring

```bash
# Install monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Configure alerts
# - High CPU usage
# - High memory usage
# - Service down
# - Disk space low
```

## Docker Swarm Deployment (High Availability)

### 1. Initialize Swarm

```bash
# On manager node
docker swarm init --advertise-addr <manager-ip>

# Join worker nodes
docker swarm join --token <token> <manager-ip>:2377
```

### 2. Deploy Stack

```bash
# Deploy services
docker stack deploy -c docker-compose.swarm.yml overseasjob

# Scale services
docker service scale overseasjob_backend=3
docker service scale overseasjob_frontend=2

# View services
docker service ls
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace overseasjob
```

### 2. Apply Configurations

```bash
# ConfigMaps and Secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deployments
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ai-deployment.yaml

# Services
kubectl apply -f k8s/services.yaml

# Ingress
kubectl apply -f k8s/ingress.yaml
```

### 3. Verify Deployment

```bash
kubectl get pods -n overseasjob
kubectl get services -n overseasjob
kubectl get ingress -n overseasjob
```

## Backup Strategy

### Database Backup

```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD overseasjob > $BACKUP_DIR/backup_$DATE.sql

# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/backup-script.sh
```

### File Backup

```bash
# Backup uploaded files
rsync -avz /var/lib/docker/volumes/overseasjob_resumes/ backup-server:/backups/resumes/
```

## Troubleshooting

### Common Issues

#### 1. Services Not Starting

```bash
# Check logs
docker-compose logs <service-name>

# Check resource usage
docker stats

# Restart service
docker-compose restart <service-name>
```

#### 2. Database Connection Issues

```bash
# Check MySQL is running
docker-compose ps mysql

# Check logs
docker-compose logs mysql

# Verify credentials
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"
```

#### 3. AI Service Not Responding

```bash
# Check AI service health
curl http://localhost:5000/health

# Check logs
docker-compose logs ai-service

# Restart AI service
docker-compose restart ai-service
```

#### 4. Permission Issues

```bash
# Fix storage permissions
docker-compose exec backend chown -R www-data:www-data storage

# Clear caches
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
```

### Performance Tuning

#### MySQL Optimization

```ini
# my.cnf
[mysqld]
innodb_buffer_pool_size = 4G
max_connections = 200
query_cache_size = 256M
query_cache_type = 1
```

#### PHP-FPM Optimization

```ini
# php-fpm.conf
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
```

#### Nginx Optimization

```nginx
# nginx.conf
worker_processes auto;
worker_connections 4096;
keepalive_timeout 30;
gzip on;
gzip_comp_level 6;
```

## Security Checklist

- [ ] Change default passwords
- [ ] Enable firewall (ufw)
- [ ] Configure fail2ban
- [ ] Enable SSL/TLS
- [ ] Set up regular security updates
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up log monitoring
- [ ] Regular vulnerability scans
- [ ] Backup encryption

## Maintenance

### Daily
- Check service status
- Review error logs
- Monitor disk space

### Weekly
- Review performance metrics
- Check backup integrity
- Update dependencies

### Monthly
- Security updates
- Performance optimization
- Database optimization
- Log rotation

## Support

For deployment support:
- Email: devops@overseasjob.in
- Documentation: https://docs.overseasjob.in
- Issues: https://github.com/overseasjob/issues

# 🚀 Quick VPS Deployment Guide

Deploy to `majalah.tadatodays.com` in under 30 minutes!

## Prerequisites

- ✅ VPS with Ubuntu 20.04+ (min 2GB RAM)
- ✅ Domain `majalah.tadatodays.com` pointed to VPS IP
- ✅ Root or sudo access
- ✅ Port 80, 443, 5432 open

## Step-by-Step Deployment

### 1️⃣ Initial VPS Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installations
docker --version
docker-compose version
```

### 2️⃣ Setup Project Directory

```bash
# Create directory
mkdir -p /var/www/magazine
cd /var/www/magazine

# Clone or upload your project files here
# Option A: Using Git
git clone <your-repo-url> .

# Option B: Using rsync from local machine
# (Run this from your local machine)
rsync -avz --exclude 'node_modules' --exclude '.next' \
  ./ root@your-vps-ip:/var/www/magazine/
```

### 3️⃣ Configure DNS

Ensure your domain is pointed to VPS:

```bash
# Test DNS resolution
dig majalah.tadatodays.com

# Should show your VPS IP
```

### 4️⃣ Setup SSL Certificate

```bash
# Install Certbot
apt install certbot -y

# Stop any service on port 80 temporarily
docker-compose down 2>/dev/null || true

# Get certificate
certbot certonly --standalone -d majalah.tadatodays.com

# Create SSL directory in project
mkdir -p /var/www/magazine/ssl

# Copy certificates
cp /etc/letsencrypt/live/majalah.tadatodays.com/fullchain.pem /var/www/magazine/ssl/
cp /etc/letsencrypt/live/majalah.tadatodays.com/privkey.pem /var/www/magazine/ssl/
```

### 5️⃣ Configure Environment

```bash
cd /var/www/magazine

# Create .env file
nano .env
```

Paste this configuration:

```env
# Database Password - CHANGE THIS!
DB_PASSWORD=your_super_secure_db_password_here_2024

# NextAuth Secret - GENERATE NEW ONE!
# Run: openssl rand -base64 32
NEXTAUTH_SECRET=your_generated_secret_here

# URLs
NEXTAUTH_URL=https://majalah.tadatodays.com
NEXT_PUBLIC_APP_URL=https://majalah.tadatodays.com

# Admin Credentials - CHANGE THESE!
ADMIN_EMAIL=admin@tadatodays.com
ADMIN_PASSWORD=your_secure_admin_password_here
```

**🔐 Security Checklist:**
- [ ] Changed DB_PASSWORD
- [ ] Generated NEXTAUTH_SECRET (use: `openssl rand -base64 32`)
- [ ] Changed ADMIN_PASSWORD
- [ ] Updated ADMIN_EMAIL

Save and exit (Ctrl+X, Y, Enter)

### 6️⃣ Deploy Application

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

This will:
- Build Docker images
- Start PostgreSQL database
- Start Next.js application
- Start Nginx reverse proxy
- Run database migrations
- Create admin user

**Wait 2-3 minutes for initial build...**

### 7️⃣ Verify Deployment

```bash
# Check containers are running
docker-compose ps

# Should see 3 containers: app, postgres, nginx all "Up"

# Check application logs
docker-compose logs -f app

# Look for: "Ready in XXms" and "compiled successfully"

# Check nginx
docker-compose logs nginx

# Should see no errors
```

### 8️⃣ Test the Website

Open browser and visit:

1. **Homepage**: https://majalah.tadatodays.com
   - Should see the magazine platform homepage

2. **Admin Login**: https://majalah.tadatodays.com/admin
   - Should redirect to login page

3. **Login with**:
   - Email: `admin@tadatodays.com` (or your ADMIN_EMAIL)
   - Password: Your ADMIN_PASSWORD

4. **Upload Test Magazine**:
   - Click "Upload Majalah"
   - Select a PDF file
   - Fill in title and description
   - Click "Upload Majalah"

### 9️⃣ Setup Auto SSL Renewal

```bash
# Create renewal script
cat > /etc/cron.daily/renew-ssl << 'EOF'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/majalah.tadatodays.com/fullchain.pem /var/www/magazine/ssl/
cp /etc/letsencrypt/live/majalah.tadatodays.com/privkey.pem /var/www/magazine/ssl/
cd /var/www/magazine && docker-compose restart nginx
EOF

# Make executable
chmod +x /etc/cron.daily/renew-ssl
```

### 🔟 Setup Firewall (Optional but Recommended)

```bash
# Install UFW
apt install ufw -y

# Allow SSH (IMPORTANT!)
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

## ✅ Deployment Complete!

Your magazine platform is now live at:
- 🌐 https://majalah.tadatodays.com

### Next Steps:

1. **Change Admin Password**
   - Login to admin
   - Go to settings (if you add this feature)
   - Or update directly in database

2. **Upload Magazines**
   - Go to `/admin/upload`
   - Upload your first magazine

3. **Customize**
   - Update branding
   - Customize colors
   - Add your logo

## 🔧 Common Commands

```bash
# View logs
docker-compose logs -f app

# Restart application
docker-compose restart app

# Stop everything
docker-compose down

# Start everything
docker-compose up -d

# Check disk space
df -h

# Check memory
free -m

# View running containers
docker ps
```

## 🐛 Troubleshooting

### Can't connect to website

```bash
# Check if containers are running
docker-compose ps

# Check if nginx is listening
docker-compose exec nginx nginx -t

# Check firewall
ufw status
```

### Upload fails

```bash
# Check application logs
docker-compose logs app

# Check disk space
df -h

# Increase upload limit in .env
MAX_FILE_SIZE=104857600  # 100MB
```

### Database connection error

```bash
# Check postgres is running
docker-compose exec postgres pg_isready

# View postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### SSL certificate issues

```bash
# Check certificate exists
ls -la /etc/letsencrypt/live/majalah.tadatodays.com/

# Re-copy to project
cp /etc/letsencrypt/live/majalah.tadatodays.com/*.pem /var/www/magazine/ssl/

# Restart nginx
docker-compose restart nginx
```

## 📊 Monitoring

```bash
# Watch logs in real-time
docker-compose logs -f

# Check resource usage
docker stats

# Database size
docker-compose exec postgres psql -U postgres -d magazine_platform \
  -c "SELECT pg_size_pretty(pg_database_size('magazine_platform'));"

# Number of magazines
docker-compose exec postgres psql -U postgres -d magazine_platform \
  -c "SELECT COUNT(*) FROM \"Magazine\";"
```

## 🔄 Updating the Application

```bash
cd /var/www/magazine

# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Run migrations if schema changed
docker-compose exec app npx prisma migrate deploy
```

## 🗑️ Cleanup Old Images

```bash
# Remove unused Docker images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused containers
docker container prune
```

## 📱 Optional: Setup Monitoring

```bash
# Install ctop for container monitoring
wget https://github.com/bcicen/ctop/releases/download/v0.7.7/ctop-0.7.7-linux-amd64 \
  -O /usr/local/bin/ctop
chmod +x /usr/local/bin/ctop

# Run ctop
ctop
```

## 🆘 Need Help?

1. Check application logs: `docker-compose logs -f app`
2. Check nginx logs: `docker-compose logs nginx`
3. Check database logs: `docker-compose logs postgres`
4. Review this guide again
5. Check README.md for detailed documentation

---

## 🎉 Success Checklist

- [ ] Domain resolves to VPS IP
- [ ] SSL certificate installed
- [ ] Containers running (3/3)
- [ ] Can access https://majalah.tadatodays.com
- [ ] Can login to admin panel
- [ ] Can upload PDF successfully
- [ ] Magazine displays with page flipping
- [ ] Auto SSL renewal setup
- [ ] Firewall configured
- [ ] Backups configured (see below)

## 💾 Backup Strategy (Recommended)

```bash
# Create backup script
cat > /usr/local/bin/backup-magazine << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U postgres magazine_platform \
  > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/magazine/public/uploads

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/backup-magazine

# Add to crontab (runs daily at 2 AM)
crontab -l | { cat; echo "0 2 * * * /usr/local/bin/backup-magazine"; } | crontab -
```

---

**Your magazine platform is ready! 🚀📚**

Admin Panel: https://majalah.tadatodays.com/admin

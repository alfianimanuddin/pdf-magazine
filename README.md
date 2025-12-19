# 📚 Magazine Platform - Digital Magazine with Page Flipping

Platform majalah digital interaktif dengan efek page flipping seperti majalah fisik. Built dengan Next.js, TypeScript, dan PostgreSQL.

## ✨ Features

- 📖 **Interactive Page Flipping** - Efek flip halaman realistis dengan `react-pageflip`
- 📤 **PDF Upload** - Upload PDF, otomatis dikonversi ke gambar untuk performa optimal
- 🎨 **Modern UI** - Clean, responsive design dengan Tailwind CSS & shadcn/ui
- 🔐 **Admin Dashboard** - Manage majalah dengan mudah
- 📊 **Analytics** - Track views untuk setiap majalah
- 🚀 **Production Ready** - Docker setup untuk deployment ke VPS
- 📱 **Mobile Responsive** - Works great on all devices
- 🔍 **SEO Friendly** - Optimized meta tags dan sitemap

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router) dengan TypeScript
- **React** - UI library
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **react-pageflip** - Page flipping animation
- **Framer Motion** - Smooth animations
- **Zustand** - State management

### Backend
- **Next.js API Routes** - Backend API
- **Prisma** - ORM for database
- **PostgreSQL** - Database
- **NextAuth.js v5** - Authentication
- **pdf-lib & pdf2pic** - PDF processing
- **sharp** - Image optimization

### Deployment
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy
- **Let's Encrypt** - SSL certificates

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn
- (For VPS) Docker & Docker Compose

## 🚀 Quick Start - Local Development

### 1. Clone & Install Dependencies

```bash
# Clone the project
cd magazine-platform

# Install dependencies
npm install
```

### 2. Setup Environment Variables

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` file:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/magazine_platform"

# NextAuth (generate secret: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Admin Credentials
ADMIN_EMAIL="admin@tadatodays.com"
ADMIN_PASSWORD="changeme123"

# File Storage
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=52428800

# App Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Create admin user (run this script)
npx prisma db seed
```

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'changeme123',
    10
  )

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@tadatodays.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@tadatodays.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user created')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

Add to `package.json`:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

### 4. Run Development Server

```bash
npm run dev
```

Visit:
- **Website**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Login**: admin@tadatodays.com / changeme123

## 🐳 Production Deployment - VPS with Docker

### Method 1: Docker Compose (Recommended)

#### 1. Prepare VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Create directory
mkdir -p /var/www/majalah.tadatodays.com
cd /var/www/majalah.tadatodays.com
```

#### 2. Upload Project Files

```bash
# From your local machine
rsync -avz --exclude 'node_modules' --exclude '.next' \
  ./ user@your-vps-ip:/var/www/majalah.tadatodays.com/
```

Or use Git:

```bash
# On VPS
cd /var/www/majalah.tadatodays.com
git clone your-repo-url .
```

#### 3. Configure Environment

```bash
# Create .env file
nano .env
```

```env
# Database
DB_PASSWORD=your_secure_db_password_here

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://majalah.tadatodays.com

# Admin
ADMIN_EMAIL=admin@tadatodays.com
ADMIN_PASSWORD=your_secure_admin_password

# App
NEXT_PUBLIC_APP_URL=https://majalah.tadatodays.com
```

#### 4. Setup SSL Certificate

```bash
# Install Certbot
sudo apt install certbot -y

# Get SSL certificate
sudo certbot certonly --standalone -d majalah.tadatodays.com

# Copy certificates to project
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/majalah.tadatodays.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/majalah.tadatodays.com/privkey.pem ssl/
```

#### 5. Deploy

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f app

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# Create admin user
docker-compose exec app npx prisma db seed
```

#### 6. Setup Auto-renewal for SSL

```bash
# Create renewal script
sudo nano /etc/cron.daily/renew-ssl

# Add:
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/majalah.tadatodays.com/fullchain.pem /var/www/majalah.tadatodays.com/ssl/
cp /etc/letsencrypt/live/majalah.tadatodays.com/privkey.pem /var/www/majalah.tadatodays.com/ssl/
docker-compose -f /var/www/majalah.tadatodays.com/docker-compose.yml restart nginx

# Make executable
sudo chmod +x /etc/cron.daily/renew-ssl
```

### Method 2: PM2 (Alternative)

If you prefer not using Docker:

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install dependencies
npm install

# Build
npm run build

# Setup PostgreSQL
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql
CREATE DATABASE magazine_platform;
\q

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start npm --name "magazine" -- start
pm2 save
pm2 startup
```

Setup Nginx:

```bash
sudo apt install nginx

sudo nano /etc/nginx/sites-available/majalah.tadatodays.com
```

```nginx
server {
    listen 80;
    server_name majalah.tadatodays.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/majalah.tadatodays.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL
sudo certbot --nginx -d majalah.tadatodays.com
```

## 📖 Usage Guide

### Admin Dashboard

1. **Login**: Go to `/admin/login`
2. **Upload Magazine**:
   - Click "Upload Majalah"
   - Choose PDF file (max 50MB)
   - Enter title and description
   - Check "Publikasikan sekarang" to publish immediately
   - Click "Upload Majalah"
3. **Manage Magazines**:
   - View all magazines in dashboard
   - Edit or delete magazines
   - Toggle publish status

### Magazine Viewer

- Navigate pages with arrow buttons or click edges
- Zoom in/out with buttons
- Fullscreen mode for immersive reading
- Keyboard shortcuts:
  - `←` Previous page
  - `→` Next page
  - `F` Toggle fullscreen
  - `+` Zoom in
  - `-` Zoom out

## 🔧 Configuration

### Adjust PDF Processing

Edit `lib/pdf-processor.ts`:

```typescript
const options = {
  density: 200, // DPI (higher = better quality, slower)
  width: 1920,  // Output width
  height: 2560, // Output height
  format: 'png', // or 'webp'
}
```

### Customize Page Flip

Edit `components/magazine/magazine-viewer.tsx`:

```typescript
<HTMLFlipBook
  width={550}          // Page width
  height={733}         // Page height
  flippingTime={600}   // Animation duration (ms)
  drawShadow={true}    // Page shadow
  // ... other props
>
```

## 📦 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Restart a service
docker-compose restart app

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Access database
docker-compose exec postgres psql -U postgres -d magazine_platform

# Rebuild after changes
docker-compose up -d --build
```

## 🐛 Troubleshooting

### PDF Processing Fails

```bash
# Install required packages on VPS
sudo apt install -y graphicsmagick poppler-utils

# Or in Docker, add to Dockerfile:
RUN apk add --no-cache graphicsmagick poppler-utils
```

### Upload Size Limit

Edit `next.config.js`:

```javascript
experimental: {
  serverActions: {
    bodySizeLimit: '100mb', // Increase if needed
  },
}
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps

# Check connection
docker-compose exec postgres pg_isready

# View database logs
docker-compose logs postgres
```

### Nginx Not Working

```bash
# Check nginx configuration
docker-compose exec nginx nginx -t

# View nginx logs
docker-compose logs nginx

# Restart nginx
docker-compose restart nginx
```

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Generate strong NEXTAUTH_SECRET
- [ ] Use strong database password
- [ ] Setup firewall (ufw)
- [ ] Enable fail2ban
- [ ] Regular backups
- [ ] Keep Docker images updated
- [ ] Monitor logs

## 📊 Monitoring

```bash
# View container stats
docker stats

# View application logs
docker-compose logs -f --tail=100 app

# Monitor disk usage
df -h

# Database size
docker-compose exec postgres psql -U postgres -d magazine_platform -c "SELECT pg_size_pretty(pg_database_size('magazine_platform'));"
```

## 🔄 Updates

```bash
# Pull latest code
git pull

# Install dependencies
docker-compose exec app npm install

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Rebuild
docker-compose up -d --build
```

## 📝 License

MIT

## 👨‍💻 Developer

Built by Alfi for Tada Todays

---

## 🆘 Support

If you encounter any issues:

1. Check logs: `docker-compose logs -f app`
2. Check database: `docker-compose exec postgres psql -U postgres`
3. Check environment variables in `.env`
4. Review this README

---

**Ready to launch your magazine platform! 🚀**

For questions, open an issue or contact the developer.

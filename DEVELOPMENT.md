# 💻 Local Development Guide

Complete guide for developing the Magazine Platform locally.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- npm or yarn
- Git

### 1. Install Dependencies

```bash
# Install all dependencies
npm install

# This will install:
# - Next.js & React
# - Prisma & PostgreSQL client
# - UI components (Radix, Tailwind)
# - PDF processing libs
# - Authentication (NextAuth)
```

### 2. Setup PostgreSQL Database

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE magazine_platform;
CREATE USER magazine_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE magazine_platform TO magazine_user;
\q
```

#### Option B: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run -d \
  --name magazine-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=magazine_platform \
  -p 5432:5432 \
  postgres:16-alpine
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env
nano .env
```

Update these values:

```env
# Database (adjust for your setup)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/magazine_platform"

# NextAuth (generate: openssl rand -base64 32)
NEXTAUTH_SECRET="your_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# Admin user
ADMIN_EMAIL="admin@localhost"
ADMIN_PASSWORD="admin123"

# Storage
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=52428800

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Seed admin user
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit:
- **App**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Login**: admin@localhost / admin123

## 🛠️ Development Workflow

### File Structure

```
app/
├── admin/              # Admin pages
├── api/                # API routes
├── magazine/[slug]/    # Magazine viewer
└── page.tsx            # Homepage

components/
├── magazine/           # Magazine components
└── ui/                 # Reusable UI

lib/
├── auth.ts            # Auth config
├── prisma.ts          # DB client
└── pdf-processor.ts   # PDF utilities
```

### Adding New Pages

```bash
# Example: Add an "About" page
mkdir app/about
touch app/about/page.tsx
```

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
    </div>
  )
}
```

### Adding New API Routes

```bash
# Example: Get magazine stats
mkdir -p app/api/stats
touch app/api/stats/route.ts
```

```typescript
// app/api/stats/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const totalMagazines = await prisma.magazine.count()
  return NextResponse.json({ totalMagazines })
}
```

### Adding New Components

```bash
# Create component
touch components/ui/badge.tsx
```

```typescript
// components/ui/badge.tsx
interface BadgeProps {
  children: React.ReactNode
}

export function Badge({ children }: BadgeProps) {
  return (
    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
      {children}
    </span>
  )
}
```

## 🎨 Styling

### Tailwind CSS

```typescript
// Use Tailwind utility classes
<div className="bg-white p-4 rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-slate-900">Title</h2>
</div>
```

### Custom Styles

```css
/* app/globals.css */
.my-custom-class {
  @apply bg-blue-500 text-white p-4 rounded;
}
```

### CSS Variables

```css
/* Defined in app/globals.css */
:root {
  --primary: 222.2 47.4% 11.2%;
  --foreground: 222.2 84% 4.9%;
}

/* Use in components */
<div className="bg-primary text-primary-foreground">
```

## 🗄️ Working with Database

### Prisma Studio

Visual database editor:

```bash
npx prisma studio
```

Opens at http://localhost:5555

### Database Commands

```bash
# Create migration
npx prisma migrate dev --name add_feature

# Reset database
npx prisma migrate reset

# Push schema changes (without migration)
npx prisma db push

# Generate client after schema changes
npx prisma generate
```

### Querying Database

```typescript
import { prisma } from '@/lib/prisma'

// Find all published magazines
const magazines = await prisma.magazine.findMany({
  where: { published: true },
  include: { pages: true },
})

// Create new magazine
const magazine = await prisma.magazine.create({
  data: {
    title: 'New Magazine',
    slug: 'new-magazine',
    userId: session.user.id,
  },
})

// Update magazine
await prisma.magazine.update({
  where: { id: magazine.id },
  data: { published: true },
})

// Delete magazine
await prisma.magazine.delete({
  where: { id: magazine.id },
})
```

## 🧪 Testing

### Test PDF Upload

```bash
# Download test PDF
curl -o test.pdf https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf

# Or create a simple PDF
# Use any PDF from your computer
```

### Test Magazine Viewer

1. Upload a magazine
2. Go to homepage
3. Click on magazine
4. Test interactions:
   - Page flipping (arrows, click edges)
   - Zoom in/out
   - Fullscreen
   - Mobile gestures

## 🐛 Debugging

### View Logs

```bash
# Next.js dev logs
npm run dev

# Database queries (enable in prisma/schema.prisma)
log = ["query", "info", "warn", "error"]
```

### Debug Points

Add `console.log()` in:
- API routes (`app/api/*/route.ts`)
- Server components (`app/*/page.tsx`)
- Client components (use browser console)

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Database connection error:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Or for Docker
docker ps | grep postgres
```

**PDF processing fails:**
```bash
# Install GraphicsMagick (Ubuntu)
sudo apt install graphicsmagick

# Install Poppler utils
sudo apt install poppler-utils
```

## 📦 Environment Variables Reference

```env
# Database
DATABASE_URL              # PostgreSQL connection string
                         # Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Authentication
NEXTAUTH_SECRET          # JWT signing secret (32+ chars)
NEXTAUTH_URL            # Full app URL with protocol

# Admin User (for seeding)
ADMIN_EMAIL             # Admin email address
ADMIN_PASSWORD          # Admin password

# File Upload
UPLOAD_DIR              # Directory for uploads (relative to project root)
MAX_FILE_SIZE           # Max upload size in bytes

# App Config
NEXT_PUBLIC_APP_URL     # Public URL (used in client-side code)
```

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ...

# Commit
git add .
git commit -m "Add new feature"

# Push
git push origin feature/new-feature

# Create pull request on GitHub
```

### Git Ignore

`.gitignore` excludes:
- `node_modules/`
- `.next/`
- `.env`
- `public/uploads/*`

## 📝 Code Style

### TypeScript

```typescript
// Use explicit types
interface MagazineProps {
  title: string
  pages: number
}

function Magazine({ title, pages }: MagazineProps) {
  // ...
}

// Async/await over promises
async function fetchMagazine(id: string) {
  const magazine = await prisma.magazine.findUnique({
    where: { id },
  })
  return magazine
}
```

### React

```typescript
// Server Components (default)
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// Client Components (use 'use client')
'use client'
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## 🚀 Building for Production

```bash
# Build the app
npm run build

# Test production build locally
npm start

# Runs on http://localhost:3000
```

## 📚 Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [NextAuth Docs](https://authjs.dev)

## 🆘 Getting Help

1. Check application logs
2. Review error messages
3. Check database with Prisma Studio
4. Consult README.md
5. Check documentation links above

---

Happy coding! 🎉

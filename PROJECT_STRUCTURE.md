# 📁 Project Structure

```
magazine-platform/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 admin/                    # Admin dashboard routes
│   │   ├── 📁 login/               # Login page
│   │   │   └── page.tsx
│   │   ├── 📁 upload/              # Magazine upload page
│   │   │   └── page.tsx
│   │   └── page.tsx                # Admin dashboard
│   ├── 📁 api/                      # API routes
│   │   ├── 📁 auth/[...nextauth]/  # NextAuth API
│   │   │   └── route.ts
│   │   └── 📁 magazines/
│   │       └── 📁 upload/          # Magazine upload API
│   │           └── route.ts
│   ├── 📁 magazine/[slug]/         # Magazine viewer (dynamic route)
│   │   └── page.tsx
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Homepage
│
├── 📁 components/                   # React components
│   ├── 📁 magazine/                # Magazine-specific components
│   │   └── magazine-viewer.tsx    # Page flip viewer
│   └── 📁 ui/                      # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── progress.tsx
│
├── 📁 lib/                          # Utility functions & configs
│   ├── auth.ts                     # NextAuth configuration
│   ├── pdf-processor.ts            # PDF processing utilities
│   ├── prisma.ts                   # Prisma client
│   └── utils.ts                    # Helper functions
│
├── 📁 prisma/                       # Database schema & migrations
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Database seeder
│
├── 📁 public/                       # Static files
│   └── 📁 uploads/                 # Uploaded magazines
│       └── 📁 magazines/
│           └── 📁 [magazineId]/
│               ├── original.pdf
│               └── 📁 pages/
│                   ├── page-1.webp
│                   ├── page-2.webp
│                   └── ...
│
├── 📄 .dockerignore                 # Docker ignore file
├── 📄 .env.example                  # Environment variables template
├── 📄 .gitignore                    # Git ignore file
├── 📄 deploy.sh                     # Deployment script
├── 📄 docker-compose.yml            # Docker Compose config
├── 📄 Dockerfile                    # Docker build instructions
├── 📄 middleware.ts                 # Next.js middleware (auth)
├── 📄 next.config.js                # Next.js configuration
├── 📄 nginx.conf                    # Nginx reverse proxy config
├── 📄 package.json                  # Node.js dependencies
├── 📄 postcss.config.js             # PostCSS configuration
├── 📄 README.md                     # Main documentation
├── 📄 tailwind.config.js            # Tailwind CSS config
└── 📄 tsconfig.json                 # TypeScript config
```

## 🗂️ Directory Breakdown

### `/app` - Application Routes

The main application directory using Next.js 14 App Router.

**Public Routes:**
- `/` - Homepage with magazine grid
- `/magazine/[slug]` - Magazine viewer with page flipping

**Admin Routes:**
- `/admin/login` - Admin authentication
- `/admin` - Dashboard (protected)
- `/admin/upload` - Magazine upload (protected)

**API Routes:**
- `/api/auth/[...nextauth]` - NextAuth authentication
- `/api/magazines/upload` - Magazine upload handler

### `/components` - React Components

**Magazine Components:**
- `magazine-viewer.tsx` - Main page-flipping component with controls

**UI Components (shadcn/ui):**
- `button.tsx` - Button component with variants
- `card.tsx` - Card layout components
- `input.tsx` - Form input component
- `label.tsx` - Form label component
- `progress.tsx` - Progress bar for uploads

### `/lib` - Utilities & Configuration

**Core Files:**
- `auth.ts` - NextAuth v5 configuration with Credentials provider
- `prisma.ts` - Singleton Prisma client instance
- `pdf-processor.ts` - PDF to image conversion logic
- `utils.ts` - Helper functions (cn, formatDate, etc.)

### `/prisma` - Database

**Schema:**
- `schema.prisma` - Defines database models:
  - `User` - Admin users
  - `Magazine` - Magazine metadata
  - `MagazinePage` - Individual pages
  - `MagazineView` - View tracking

**Seeding:**
- `seed.ts` - Creates initial admin user

## 🔄 Data Flow

### Magazine Upload Flow

```
1. User uploads PDF at /admin/upload
   ↓
2. File sent to /api/magazines/upload
   ↓
3. PDF validated (type, size)
   ↓
4. Magazine record created in DB
   ↓
5. PDF processed (converted to images)
   ↓
6. Pages saved to /public/uploads/magazines/[id]/pages/
   ↓
7. MagazinePage records created
   ↓
8. Magazine updated with metadata
   ↓
9. Success response → Redirect to dashboard
```

### Magazine Viewing Flow

```
1. User visits /magazine/[slug]
   ↓
2. Server fetches magazine + pages from DB
   ↓
3. View tracking record created
   ↓
4. MagazineViewer component renders
   ↓
5. react-pageflip library handles interactions
   ↓
6. Images loaded on-demand for performance
```

## 🔐 Authentication Flow

```
1. User submits login form
   ↓
2. Credentials sent to NextAuth
   ↓
3. NextAuth validates against User table
   ↓
4. JWT token created and stored in session
   ↓
5. Middleware protects /admin routes
   ↓
6. User ID from session used for queries
```

## 📦 Key Dependencies

**Frontend:**
- `next` - React framework
- `react-pageflip` - Page flipping library
- `framer-motion` - Animations
- `react-dropzone` - File upload
- `tailwindcss` - CSS framework
- `@radix-ui/*` - Headless UI primitives

**Backend:**
- `@prisma/client` - Database ORM
- `next-auth` - Authentication
- `bcryptjs` - Password hashing
- `pdf-lib` - PDF manipulation
- `pdf2pic` - PDF to image conversion
- `sharp` - Image optimization

**Development:**
- `typescript` - Type safety
- `eslint` - Code linting
- `prisma` - Database migrations
- `ts-node` - TypeScript execution

## 🎨 Styling System

**Tailwind CSS:**
- Utility-first CSS framework
- Custom theme in `tailwind.config.js`
- CSS variables in `app/globals.css`

**Component Pattern:**
- shadcn/ui components in `/components/ui`
- Composable, accessible, customizable
- Uses Radix UI primitives

## 🗄️ Database Schema

```prisma
User (Admin)
├── id: String (cuid)
├── email: String (unique)
├── password: String (hashed)
├── role: Enum (ADMIN)
└── magazines: Magazine[]

Magazine
├── id: String (cuid)
├── title: String
├── slug: String (unique)
├── description: String?
├── coverImage: String?
├── pdfPath: String
├── totalPages: Int
├── published: Boolean
├── userId: String (FK)
├── pages: MagazinePage[]
└── views: MagazineView[]

MagazinePage
├── id: String (cuid)
├── magazineId: String (FK)
├── pageNumber: Int
└── imagePath: String

MagazineView (Analytics)
├── id: String (cuid)
├── magazineId: String (FK)
├── viewedAt: DateTime
├── ipAddress: String?
└── userAgent: String?
```

## 🚀 Deployment Architecture

```
Internet
   ↓
Nginx (Port 80/443) - Reverse Proxy & SSL
   ↓
Next.js App (Port 3000) - Docker Container
   ↓
PostgreSQL (Port 5432) - Docker Container
   ↓
Persistent Volumes
   ├── postgres_data (Database)
   └── uploads_data (Magazine files)
```

## 📝 Environment Variables

```env
# Database
DATABASE_URL                 # PostgreSQL connection string

# Authentication
NEXTAUTH_SECRET             # JWT secret
NEXTAUTH_URL                # Application URL

# Admin User
ADMIN_EMAIL                 # Default admin email
ADMIN_PASSWORD              # Default admin password

# Storage
UPLOAD_DIR                  # Upload directory path
MAX_FILE_SIZE               # Max upload size in bytes

# App Config
NEXT_PUBLIC_APP_URL         # Public application URL
```

## 🔧 Configuration Files

- **next.config.js** - Next.js settings (images, output, etc.)
- **tailwind.config.js** - Tailwind theme & plugins
- **tsconfig.json** - TypeScript compiler options
- **postcss.config.js** - PostCSS plugins
- **docker-compose.yml** - Multi-container setup
- **Dockerfile** - Application container
- **nginx.conf** - Web server configuration

## 📊 File Size Limits

- **PDF Upload**: 50MB (configurable)
- **Converted Images**: ~500KB per page (WebP)
- **Database**: Metadata only (~10KB per magazine)

## 🔄 Update Process

1. Pull latest code
2. Install dependencies
3. Run migrations
4. Rebuild Docker images
5. Restart containers

---

This structure is designed for scalability, maintainability, and ease of deployment.

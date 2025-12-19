# 🎯 Getting Started

Welcome to the Magazine Platform! Choose your path below.

## 🏃‍♂️ Quick Start Paths

### 👨‍💻 For Local Development

**Want to develop and customize the platform?**

Follow → [DEVELOPMENT.md](DEVELOPMENT.md)

**Time**: ~15 minutes
**Requirements**: Node.js, PostgreSQL
**Result**: Running on http://localhost:3000

---

### 🚀 For VPS Deployment

**Want to deploy to your VPS immediately?**

Follow → [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md)

**Time**: ~30 minutes
**Requirements**: VPS, Docker, Domain
**Result**: Live at https://majalah.tadatodays.com

---

### 📖 For Understanding

**Want to understand the codebase first?**

Read → [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

**Learn about**:
- Directory structure
- Data flow
- Key components
- Architecture decisions

---

## 📂 Documentation Files

| File | Purpose | For |
|------|---------|-----|
| **README.md** | Complete documentation | Everyone |
| **DEVELOPMENT.md** | Local dev setup | Developers |
| **VPS_DEPLOYMENT.md** | Production deployment | DevOps |
| **PROJECT_STRUCTURE.md** | Code organization | Developers |
| **GETTING_STARTED.md** | This file! | You |

---

## ⚡ Ultra Quick Start (Docker)

Have Docker installed? Deploy in 5 commands:

```bash
# 1. Setup environment
cp .env.example .env
nano .env  # Edit with your values

# 2. Deploy
chmod +x deploy.sh
./deploy.sh

# 3. Done!
# Visit: https://your-domain.com
```

---

## 🎓 Learning Path

### Beginner Developer
1. Read [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
2. Follow [DEVELOPMENT.md](DEVELOPMENT.md)
3. Experiment locally
4. Deploy with Docker

### Experienced Developer
1. Clone repo
2. `npm install && cp .env.example .env`
3. Edit `.env`
4. `npx prisma migrate dev && npm run dev`
5. Start coding!

### DevOps/Deployment Focus
1. Review [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md)
2. Prepare VPS
3. Run `./deploy.sh`
4. Monitor with `docker-compose logs -f`

---

## 🔑 Key Features

### For Users
- 📖 Magazine page flipping effect
- 🔍 Full-screen reading mode
- 📱 Mobile responsive
- 🎨 Beautiful UI

### For Admins
- 📤 Easy PDF upload
- 📊 View analytics
- ✅ Publish/unpublish
- 🖼️ Automatic page conversion

### For Developers
- ⚡ Next.js 14 App Router
- 🎨 Tailwind CSS + shadcn/ui
- 🗄️ PostgreSQL + Prisma
- 🐳 Docker ready
- 🔐 NextAuth v5
- 📝 TypeScript

---

## 🛠️ Tech Stack at a Glance

```
Frontend:  Next.js + React + TypeScript
Styling:   Tailwind CSS + shadcn/ui
Backend:   Next.js API Routes
Database:  PostgreSQL + Prisma ORM
Auth:      NextAuth.js v5
PDF:       pdf-lib + pdf2pic + sharp
Flip:      react-pageflip
Deploy:    Docker + Nginx
```

---

## 📋 Prerequisites

### Local Development
- ✅ Node.js 20+
- ✅ PostgreSQL 14+
- ✅ npm/yarn
- ✅ 2GB+ RAM

### VPS Deployment
- ✅ Ubuntu 20.04+ VPS
- ✅ 2GB+ RAM, 20GB+ storage
- ✅ Docker + Docker Compose
- ✅ Domain with DNS configured
- ✅ Port 80, 443 open

---

## 🎯 What to Do First?

### I want to customize the design
→ Start with [DEVELOPMENT.md](DEVELOPMENT.md)
→ Edit components in `components/`
→ Modify styles in `app/globals.css`

### I want to deploy to production
→ Jump to [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md)
→ Follow step-by-step guide
→ Run `./deploy.sh`

### I want to understand the code
→ Read [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
→ Explore `app/` directory
→ Check `lib/` utilities

### I want to add features
→ Setup local dev [DEVELOPMENT.md](DEVELOPMENT.md)
→ Create feature branch
→ Code & test
→ Deploy changes

---

## 🆘 Common Questions

**Q: Do I need to know Docker?**
A: No! Just follow the deployment script. Docker handles everything.

**Q: Can I use this without VPS?**
A: Yes! Deploy to Vercel, Railway, or any Node.js hosting.

**Q: How do I customize the design?**
A: Edit components in `components/` and styles in Tailwind classes.

**Q: Is it production-ready?**
A: Yes! Includes auth, database, file handling, and deployment configs.

**Q: Can I use MySQL instead of PostgreSQL?**
A: Yes, but you'll need to update `prisma/schema.prisma` datasource.

**Q: How do I backup?**
A: Database dumps + `/public/uploads` folder. See VPS_DEPLOYMENT.md backup section.

---

## 🎉 Next Steps

1. **Choose your path** (Development or Deployment)
2. **Follow the guide** (Step by step)
3. **Upload a magazine** (Test it out)
4. **Customize** (Make it yours!)

---

## 📞 Support

- 📖 Check documentation files
- 🐛 Review error logs
- 📚 Consult README.md
- 💬 Open GitHub issue

---

**Ready to start? Pick your guide above! 🚀**

Happy building! 🎨📚

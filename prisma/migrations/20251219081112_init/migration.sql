-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Magazine" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "pdfPath" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "totalPages" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Magazine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagazinePage" (
    "id" TEXT NOT NULL,
    "magazineId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "imagePath" TEXT NOT NULL,

    CONSTRAINT "MagazinePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagazineView" (
    "id" TEXT NOT NULL,
    "magazineId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "MagazineView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Magazine_slug_key" ON "Magazine"("slug");

-- CreateIndex
CREATE INDEX "Magazine_userId_idx" ON "Magazine"("userId");

-- CreateIndex
CREATE INDEX "Magazine_slug_idx" ON "Magazine"("slug");

-- CreateIndex
CREATE INDEX "Magazine_published_idx" ON "Magazine"("published");

-- CreateIndex
CREATE INDEX "MagazinePage_magazineId_idx" ON "MagazinePage"("magazineId");

-- CreateIndex
CREATE UNIQUE INDEX "MagazinePage_magazineId_pageNumber_key" ON "MagazinePage"("magazineId", "pageNumber");

-- CreateIndex
CREATE INDEX "MagazineView_magazineId_idx" ON "MagazineView"("magazineId");

-- CreateIndex
CREATE INDEX "MagazineView_viewedAt_idx" ON "MagazineView"("viewedAt");

-- AddForeignKey
ALTER TABLE "Magazine" ADD CONSTRAINT "Magazine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagazinePage" ADD CONSTRAINT "MagazinePage_magazineId_fkey" FOREIGN KEY ("magazineId") REFERENCES "Magazine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagazineView" ADD CONSTRAINT "MagazineView_magazineId_fkey" FOREIGN KEY ("magazineId") REFERENCES "Magazine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

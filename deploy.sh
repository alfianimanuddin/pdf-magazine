#!/bin/bash

# Magazine Platform - Deployment Script
# This script helps deploy the application to VPS

set -e

echo "📚 Magazine Platform - Deployment Script"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Load environment variables
source .env

echo "🔍 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    exit 1
fi

echo "✅ All prerequisites met"
echo ""

# Build and start containers
echo "🚀 Building and starting containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run migrations
echo "🔄 Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Seed database
echo "🌱 Seeding database with admin user..."
docker-compose exec -T app npx prisma db seed

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🌐 Access your application:"
echo "   Website: ${NEXT_PUBLIC_APP_URL}"
echo "   Admin: ${NEXT_PUBLIC_APP_URL}/admin"
echo "   Login: ${ADMIN_EMAIL}"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f app"
echo ""
echo "🔧 Useful commands:"
echo "   docker-compose ps          - View container status"
echo "   docker-compose logs        - View all logs"
echo "   docker-compose restart     - Restart all services"
echo "   docker-compose down        - Stop all services"
echo ""

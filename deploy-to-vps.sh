#!/bin/bash

# DPMD Backend Deployment Script for VPS
# VPS IP: 72.61.143.224
# Target: /var/www/dpmd-backend

echo "========================================="
echo "🚀 DPMD Backend Deployment to VPS"
echo "========================================="

# Configuration
VPS_USER="root"
VPS_IP="72.61.143.224"
VPS_PATH="/var/www/dpmd-backend"
BRANCH="main"

echo ""
echo "📋 Deployment Info:"
echo "   VPS: $VPS_USER@$VPS_IP"
echo "   Path: $VPS_PATH"
echo "   Branch: $BRANCH"
echo ""

# Step 1: SSH to VPS and pull latest code
echo "1️⃣  Pulling latest code from GitHub..."
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
cd /var/www/dpmd-backend

# Pull latest code
echo "   📥 Git pull..."
git pull origin main

# Install/update dependencies
echo "   📦 Installing dependencies..."
npm install --production

# Copy production environment if not exists
if [ ! -f .env ]; then
    echo "   📝 Creating .env from .env.production..."
    cp .env.production .env
fi

# Run Prisma generate
echo "   🔧 Generating Prisma Client..."
npx prisma generate

# Restart PM2
echo "   🔄 Restarting PM2..."
pm2 restart dpmd-backend || pm2 start src/server.js --name dpmd-backend

# Save PM2 configuration
pm2 save

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📝 Recent logs:"
pm2 logs dpmd-backend --lines 20 --nostream

ENDSSH

echo ""
echo "========================================="
echo "✅ Deployment to VPS completed!"
echo "========================================="
echo ""
echo "🔗 API URL: https://api.dpmdbogorkab.id"
echo ""
echo "📊 Next steps:"
echo "   1. Test API: curl https://api.dpmdbogorkab.id/api/health"
echo "   2. Check logs: ssh $VPS_USER@$VPS_IP 'pm2 logs dpmd-backend'"
echo "   3. Monitor: ssh $VPS_USER@$VPS_IP 'pm2 monit'"
echo ""

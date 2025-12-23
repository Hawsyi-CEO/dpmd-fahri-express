#!/bin/bash

# DPMD Backend Initial Setup on VPS
# Run this script ONLY ONCE for first-time setup

echo "========================================="
echo "🔧 DPMD Backend Initial VPS Setup"
echo "========================================="

VPS_USER="root"
VPS_IP="72.61.143.224"
VPS_PATH="/var/www/dpmd-backend"
REPO_URL="https://github.com/Hawsyi-CEO/dpmd-fahri-express.git"

echo ""
read -p "⚠️  This will setup backend on VPS. Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled"
    exit 1
fi

echo ""
echo "📋 Setup Info:"
echo "   VPS: $VPS_USER@$VPS_IP"
echo "   Path: $VPS_PATH"
echo "   Repo: $REPO_URL"
echo ""

# SSH to VPS and run setup
ssh $VPS_USER@$VPS_IP << ENDSSH

echo "1️⃣  Creating directory..."
mkdir -p $VPS_PATH
cd $VPS_PATH

echo "2️⃣  Cloning repository..."
if [ -d ".git" ]; then
    echo "   Repository already exists, pulling latest..."
    git pull origin main
else
    git clone $REPO_URL .
fi

echo "3️⃣  Installing Node.js dependencies..."
npm install --production

echo "4️⃣  Setting up environment..."
if [ ! -f .env ]; then
    cp .env.production .env
    echo "   ⚠️  IMPORTANT: Edit .env file with production database credentials!"
    echo "   Run: nano $VPS_PATH/.env"
fi

echo "5️⃣  Creating storage directories..."
mkdir -p storage/uploads
mkdir -p storage/backups
mkdir -p storage/produk_hukum
mkdir -p logs
chmod -R 755 storage
chmod -R 755 logs

echo "6️⃣  Generating Prisma Client..."
npx prisma generate

echo "7️⃣  Setting up PM2..."
pm2 delete dpmd-backend 2>/dev/null || true
pm2 start src/server.js --name dpmd-backend
pm2 save
pm2 startup

echo ""
echo "========================================="
echo "✅ Initial setup completed!"
echo "========================================="
echo ""
echo "📝 Manual steps required:"
echo ""
echo "1. Edit environment variables:"
echo "   ssh $VPS_USER@$VPS_IP"
echo "   nano $VPS_PATH/.env"
echo ""
echo "2. Update database credentials in .env"
echo ""
echo "3. Create database table push_subscriptions:"
echo "   Run migration: node migrations/create-push-subscriptions-table.sql"
echo ""
echo "4. Restart backend:"
echo "   pm2 restart dpmd-backend"
echo ""
echo "5. Check status:"
echo "   pm2 status"
echo "   pm2 logs dpmd-backend"
echo ""

ENDSSH

echo ""
echo "🎉 Setup script completed!"
echo ""
echo "🔗 Next: Test your API"
echo "   curl https://api.dpmdbogorkab.id/api/health"
echo ""

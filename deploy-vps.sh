#!/bin/bash
# Deployment Script for VPS Backend Update
# Date: December 26, 2025

echo "🚀 Starting VPS Backend Deployment..."
echo ""

# Navigate to backend directory
cd /var/www/dpmd-backend || exit 1

echo "📁 Current directory: $(pwd)"
echo ""

# Step 1: Stash any local changes
echo "1️⃣ Stashing local changes..."
git stash
echo ""

# Step 2: Pull latest code from GitHub
echo "2️⃣ Pulling latest code from GitHub..."
git pull origin main
echo ""

# Step 3: Check if storage directories exist
echo "3️⃣ Setting up storage directories..."
mkdir -p storage/avatars
mkdir -p storage/uploads
mkdir -p storage/uploads/pengurus_files
chmod -R 755 storage/
echo "✅ Storage directories ready"
echo ""

# Step 4: Check if avatar column exists in users table
echo "4️⃣ Checking database schema..."
AVATAR_EXISTS=$(mysql -u dpmd_user -p'DpmdBogor2025!' dpmd -se "SHOW COLUMNS FROM users LIKE 'avatar';" | wc -l)

if [ "$AVATAR_EXISTS" -eq 0 ]; then
    echo "⚠️  Avatar column not found. Adding to users table..."
    mysql -u dpmd_user -p'DpmdBogor2025!' dpmd -e "ALTER TABLE users ADD COLUMN avatar VARCHAR(255) NULL AFTER role;"
    echo "✅ Avatar column added successfully"
else
    echo "✅ Avatar column already exists"
fi
echo ""

# Step 5: Set proper ownership
echo "5️⃣ Setting file ownership..."
chown -R www-data:www-data storage/
echo "✅ Ownership set to www-data"
echo ""

# Step 6: Restart PM2 service
echo "6️⃣ Restarting backend service..."
pm2 restart dpmd-api
echo ""

# Step 7: Check service status
echo "7️⃣ Checking service status..."
pm2 list | grep dpmd-api
echo ""

# Step 8: Display logs
echo "8️⃣ Showing recent logs..."
pm2 logs dpmd-api --lines 10 --nostream
echo ""

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Summary:"
echo "   - Code updated from GitHub"
echo "   - Storage directories created"
echo "   - Database schema checked/updated"
echo "   - Backend service restarted"
echo ""
echo "🔗 Test avatar upload at: https://api.dpmdbogorkab.id/api/users/{user_id}/avatar"
echo ""

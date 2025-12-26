#!/bin/bash
# Script to fix avatar upload issue on VPS
# Run this on the VPS server

echo "========================================="
echo "🔧 Fixing Avatar Upload on VPS"
echo "========================================="
echo ""

# Change to backend directory
cd /var/www/dpmd-backend || cd /var/www/dpmd-fahri-express || {
    echo "❌ Backend directory not found"
    exit 1
}

echo "📍 Current directory: $(pwd)"
echo ""

# 1. Create storage directories with proper structure
echo "1️⃣  Creating storage directories..."
mkdir -p storage/avatars
mkdir -p storage/uploads
mkdir -p storage/produk_hukum
mkdir -p public/storage/avatars
mkdir -p public/storage/uploads
mkdir -p public/storage/produk_hukum

# 2. Set proper permissions
echo "2️⃣  Setting permissions..."
chmod -R 755 storage/
chmod -R 755 public/storage/

# 3. Set ownership to the correct user
echo "3️⃣  Setting ownership..."
# Detect the user running PM2
PM2_USER=$(pm2 jlist | grep -o '"user":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$PM2_USER" ]; then
    PM2_USER=$(whoami)
fi

echo "   Setting owner to: $PM2_USER"
chown -R $PM2_USER:$PM2_USER storage/
chown -R $PM2_USER:$PM2_USER public/storage/

# 4. Create symbolic link if needed
echo "4️⃣  Creating symbolic links..."
if [ ! -L "public/storage" ]; then
    ln -sf ../storage public/storage 2>/dev/null || echo "   Symbolic link already exists or not needed"
fi

# 5. Check directory structure
echo ""
echo "5️⃣  Verifying directory structure..."
echo "   Storage directories:"
ls -la storage/
echo ""
echo "   Public storage directories:"
ls -la public/storage/ 2>/dev/null || echo "   (Public storage not linked)"

# 6. Check disk space
echo ""
echo "6️⃣  Checking disk space..."
df -h | grep -E "Filesystem|/$" | head -2

# 7. Test write permissions
echo ""
echo "7️⃣  Testing write permissions..."
TEST_FILE="storage/avatars/.write_test_$$"
if touch "$TEST_FILE" 2>/dev/null; then
    rm "$TEST_FILE"
    echo "   ✅ Write permission OK"
else
    echo "   ❌ Write permission FAILED"
    exit 1
fi

# 8. Check if Prisma schema is correct
echo ""
echo "8️⃣  Checking Prisma..."
if [ -f "prisma/schema.prisma" ]; then
    echo "   ✅ Prisma schema found"
    echo "   Regenerating Prisma client..."
    npx prisma generate
else
    echo "   ⚠️  Prisma schema not found"
fi

# 9. Restart the backend
echo ""
echo "9️⃣  Restarting backend..."
pm2 restart dpmd-api 2>/dev/null || pm2 restart dpmd-backend 2>/dev/null || pm2 restart all

echo ""
echo "========================================="
echo "✅ Avatar upload fix completed!"
echo "========================================="
echo ""
echo "📋 Summary:"
echo "   - Storage directories created"
echo "   - Permissions set to 755"
echo "   - Owner: $PM2_USER"
echo "   - Backend restarted"
echo ""
echo "🔍 To check backend logs:"
echo "   pm2 logs"
echo ""
echo "🔍 To check error logs:"
echo "   tail -50 logs/error.log"
echo ""

#!/bin/bash
# Quick Deploy Script untuk Fix Avatar Upload Error

echo "========================================="
echo "🚀 Deploying Avatar Upload Fix to VPS"
echo "========================================="
echo ""

# Configuration
VPS_USER="root"
VPS_IP="72.61.143.224"
VPS_PATH="/var/www/dpmd-backend"

echo "📋 Deployment Info:"
echo "   VPS: $VPS_USER@$VPS_IP"
echo "   Path: $VPS_PATH"
echo ""

# Step 1: Upload fix script to VPS
echo "1️⃣  Uploading fix script to VPS..."
scp fix-avatar-upload-vps.sh $VPS_USER@$VPS_IP:$VPS_PATH/

# Step 2: SSH and run deployment
echo ""
echo "2️⃣  Connecting to VPS and running fix..."
ssh $VPS_USER@$VPS_IP << ENDSSH
cd $VPS_PATH

# Pull latest code
echo "   📥 Pulling latest code..."
git pull origin main

# Make script executable
chmod +x fix-avatar-upload-vps.sh

# Run fix script
echo "   🔧 Running fix script..."
./fix-avatar-upload-vps.sh

# Final verification
echo ""
echo "   ✅ Deployment completed!"
echo ""
echo "   📊 PM2 Status:"
pm2 status

echo ""
echo "   📁 Storage Structure:"
ls -la storage/

ENDSSH

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "🔍 To verify:"
echo "   1. Login to app"
echo "   2. Go to Profile"
echo "   3. Upload avatar"
echo "   4. Should work without 500 error"
echo ""
echo "🔍 To check logs:"
echo "   ssh $VPS_USER@$VPS_IP"
echo "   pm2 logs dpmd-api"
echo ""

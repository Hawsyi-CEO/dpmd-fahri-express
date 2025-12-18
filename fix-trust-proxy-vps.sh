#!/bin/bash
# Quick fix untuk trust proxy error di VPS

echo "🔧 Fixing Express Rate Limit Trust Proxy Error..."

cd /var/www/dpmd-backend

# Backup server.js
cp src/server.js src/server.js.backup-trust-proxy

# Check current trust proxy setting
echo "Current server.js trust proxy setting:"
grep -n "trust proxy" src/server.js || echo "Not found"

echo ""
echo "📝 Manual fix required:"
echo "Edit src/server.js and change:"
echo ""
echo "FROM:"
echo "  app.set('trust proxy', true);"
echo ""
echo "TO:"
echo "  app.set('trust proxy', 1); // Trust first proxy (Nginx)"
echo ""
echo "Or remove rate limiting if not needed."
echo ""
echo "Then restart:"
echo "  pm2 restart dpmd-api"

#!/bin/bash
# VPS Deployment Script for DPMD Backend
# VPS IP: 72.61.143.224
# Domain: api.dpmdbogorkab.id

set -e

echo "🚀 Starting DPMD Backend Deployment..."
echo "VPS: 72.61.143.224"
echo "Domain: api.dpmdbogorkab.id"
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential

# Install other dependencies
echo "📦 Installing Git, Nginx, MySQL, Certbot..."
sudo apt install -y git nginx mysql-server certbot python3-certbot-nginx

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Verify installations
echo "✅ Verifying installations..."
node -v
npm -v
pm2 -v
nginx -v
mysql --version

# Setup MySQL
echo "🗄️ Setting up MySQL database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS dpmd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || true
sudo mysql -e "CREATE USER IF NOT EXISTS 'dpmd_user'@'localhost' IDENTIFIED BY 'DpmdBogor2025!';" || true
sudo mysql -e "GRANT ALL PRIVILEGES ON dpmd.* TO 'dpmd_user'@'localhost';" || true
sudo mysql -e "FLUSH PRIVILEGES;" || true
echo "✅ MySQL database created"

# Clone backend repository
echo "📥 Cloning backend repository..."
sudo mkdir -p /var/www
cd /var/www

if [ -d "dpmd-backend" ]; then
    echo "Directory exists, pulling latest changes..."
    cd dpmd-backend
    sudo git pull origin main
else
    echo "Cloning repository..."
    sudo git clone https://github.com/Hawsyi-CEO/dpmd-fahri-express.git dpmd-backend
    cd dpmd-backend
fi

# Set ownership
sudo chown -R $USER:$USER /var/www/dpmd-backend

# Install dependencies
echo "📦 Installing npm dependencies..."
npm ci --production

# Create .env file
echo "⚙️ Creating .env file..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=dpmd
DB_USER=dpmd_user
DB_PASSWORD=DpmdBogor2025!

JWT_SECRET=base64:vpA3CHUtaAUuSW8XJFH+6wLrwAaz7VCJC99ofWGffUE=
JWT_EXPIRES_IN=7d

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./storage/uploads

CORS_ORIGIN=https://dpmdbogorkab.id
EOF
echo "✅ .env file created"

# Create storage directories
echo "📁 Creating storage directories..."
mkdir -p storage/uploads
chmod -R 755 storage

# Run migrations if exists
if [ -f "database-express/migrate.js" ]; then
    echo "🔄 Running database migrations..."
    node database-express/migrate.js || echo "⚠️ Migrations not available or already run"
fi

# Test backend
echo "🧪 Testing backend..."
npm start &
BACKEND_PID=$!
sleep 5
curl http://localhost:3001/api/health || echo "⚠️ Backend health check failed, continuing..."
kill $BACKEND_PID 2>/dev/null || true

# Start with PM2
echo "🚀 Starting backend with PM2..."
pm2 delete dpmd-api 2>/dev/null || true
pm2 start npm --name dpmd-api -- start
pm2 save

# Setup PM2 startup
echo "⚙️ Configuring PM2 startup..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# Setup Nginx
echo "🌐 Configuring Nginx..."
sudo cp nginx-api.conf /etc/nginx/sites-available/api.dpmdbogorkab.id 2>/dev/null || true

# Remove default site if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Enable site
sudo ln -sf /etc/nginx/sites-available/api.dpmdbogorkab.id /etc/nginx/sites-enabled/

# Test Nginx config
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

# Setup firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 'Nginx Full' || true
sudo ufw allow 'OpenSSH' || true
sudo ufw --force enable || true

# Install SSL certificate
echo "🔐 Installing SSL certificate..."
sudo certbot --nginx -d api.dpmdbogorkab.id --non-interactive --agree-tos --email admin@dpmdbogorkab.id --redirect || echo "⚠️ SSL installation failed, you may need to configure DNS first"

# Final checks
echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
echo "🔗 Test URLs:"
echo "  - HTTP:  http://api.dpmdbogorkab.id/api/health"
echo "  - HTTPS: https://api.dpmdbogorkab.id/api/health"
echo ""
echo "📝 Useful Commands:"
echo "  - Check logs:    pm2 logs dpmd-api"
echo "  - Restart API:   pm2 restart dpmd-api"
echo "  - Nginx logs:    sudo tail -f /var/log/nginx/api.dpmdbogorkab.id.access.log"
echo "  - SSL renew:     sudo certbot renew --dry-run"
echo ""

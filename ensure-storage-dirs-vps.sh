#!/bin/bash
# Script to ensure storage directories exist on VPS

echo "📁 Checking and creating storage directories..."

# Create avatars directory
mkdir -p /var/www/dpmd-backend/storage/avatars
chmod 755 /var/www/dpmd-backend/storage/avatars

# Create uploads directory if not exists
mkdir -p /var/www/dpmd-backend/storage/uploads
chmod 755 /var/www/dpmd-backend/storage/uploads

# Create pengurus_files directory
mkdir -p /var/www/dpmd-backend/storage/uploads/pengurus_files
chmod 755 /var/www/dpmd-backend/storage/uploads/pengurus_files

# Set ownership to web server user
chown -R www-data:www-data /var/www/dpmd-backend/storage/

echo "✅ Storage directories created and permissions set"
echo ""
echo "Directory structure:"
ls -la /var/www/dpmd-backend/storage/

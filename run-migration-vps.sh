#!/bin/bash
# Script untuk menjalankan migrasi database di VPS
# Run this script ON THE VPS SERVER

set -e

echo "🔄 Starting Database Migration on VPS..."
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/dpmd-backend"
DB_NAME="dpmd"
DB_USER="dpmd_user"
DB_PASS="DpmdBogor2025!"
BACKUP_DIR="$HOME/db_backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

echo -e "${YELLOW}📍 Project Directory: $PROJECT_DIR${NC}"
echo ""

# Navigate to project directory
cd $PROJECT_DIR

# Step 1: Backup database
echo -e "${YELLOW}🔒 Step 1: Backing up database...${NC}"
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/dpmd_backup_$TIMESTAMP.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database backup created: $BACKUP_DIR/dpmd_backup_$TIMESTAMP.sql${NC}"
else
    echo -e "${RED}❌ Database backup failed!${NC}"
    exit 1
fi
echo ""

# Step 2: Pull latest code from GitHub
echo -e "${YELLOW}📥 Step 2: Pulling latest code from GitHub...${NC}"
git status

# Stash local changes if any
echo -e "${YELLOW}💾 Stashing local changes...${NC}"
git stash push -m "Auto-stash before migration $(date +%Y%m%d_%H%M%S)"

# Pull latest code
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Code updated successfully${NC}"
else
    echo -e "${RED}❌ Git pull failed!${NC}"
    echo -e "${YELLOW}ℹ️  Trying to apply stash back...${NC}"
    git stash pop
    exit 1
fi

# Apply stash back if needed
echo -e "${YELLOW}♻️  Applying stashed changes back...${NC}"
git stash pop || echo -e "${YELLOW}⚠️  No stash to apply or conflicts, continuing...${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Step 3: Installing dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ npm install failed!${NC}"
    exit 1
fi
echo ""

# Step 4: Run first migration (kelembagaan_activity_logs)
echo -e "${YELLOW}🔄 Step 4: Running migration - kelembagaan_activity_logs...${NC}"
if [ -f "database-express/migrations/20241212_create_kelembagaan_activity_logs.sql" ]; then
    mysql -u $DB_USER -p$DB_PASS $DB_NAME < database-express/migrations/20241212_create_kelembagaan_activity_logs.sql
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migration kelembagaan_activity_logs completed${NC}"
    else
        echo -e "${RED}❌ Migration failed! Check if table already exists${NC}"
    fi
else
    echo -e "${RED}❌ Migration file not found!${NC}"
    exit 1
fi
echo ""

# Step 5: Run second migration (produk_hukum_id)
echo -e "${YELLOW}🔄 Step 5: Running migration - add_produk_hukum_to_kelembagaan...${NC}"
if [ -f "database-express/migrations/add_produk_hukum_to_kelembagaan.sql" ]; then
    mysql -u $DB_USER -p$DB_PASS $DB_NAME < database-express/migrations/add_produk_hukum_to_kelembagaan.sql
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migration produk_hukum_id completed${NC}"
    else
        echo -e "${RED}❌ Migration failed! Check if columns already exist${NC}"
    fi
else
    echo -e "${RED}❌ Migration file not found!${NC}"
    exit 1
fi
echo ""

# Step 6: Verify migrations
echo -e "${YELLOW}🔍 Step 6: Verifying migrations...${NC}"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 'kelembagaan_activity_logs' as table_name, COUNT(*) as exists_check 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = '$DB_NAME' AND TABLE_NAME = 'kelembagaan_activity_logs'
UNION ALL
SELECT 'karang_tarunas.produk_hukum_id', COUNT(*) 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = '$DB_NAME' AND TABLE_NAME = 'karang_tarunas' AND COLUMN_NAME = 'produk_hukum_id'
UNION ALL
SELECT 'lpms.produk_hukum_id', COUNT(*) 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = '$DB_NAME' AND TABLE_NAME = 'lpms' AND COLUMN_NAME = 'produk_hukum_id'
UNION ALL
SELECT 'pkks.produk_hukum_id', COUNT(*) 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = '$DB_NAME' AND TABLE_NAME = 'pkks' AND COLUMN_NAME = 'produk_hukum_id'
UNION ALL
SELECT 'rts.produk_hukum_id', COUNT(*) 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = '$DB_NAME' AND TABLE_NAME = 'rts' AND COLUMN_NAME = 'produk_hukum_id'
UNION ALL
SELECT 'posyandus.produk_hukum_id', COUNT(*) 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = '$DB_NAME' AND TABLE_NAME = 'posyandus' AND COLUMN_NAME = 'produk_hukum_id';
"
echo ""

# Step 7: Regenerate Prisma Client
echo -e "${YELLOW}🔄 Step 7: Regenerating Prisma Client...${NC}"
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma Client regenerated${NC}"
else
    echo -e "${RED}❌ Prisma generate failed!${NC}"
    exit 1
fi
echo ""

# Step 8: Restart PM2 application
echo -e "${YELLOW}🔄 Step 8: Restarting PM2 application...${NC}"
pm2 restart dpmd-api
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application restarted${NC}"
else
    echo -e "${RED}❌ PM2 restart failed!${NC}"
    exit 1
fi
echo ""

# Step 9: Check PM2 status
echo -e "${YELLOW}📊 Step 9: Checking PM2 status...${NC}"
pm2 status
echo ""

# Step 10: Check logs
echo -e "${YELLOW}📝 Step 10: Recent application logs...${NC}"
pm2 logs dpmd-api --lines 20 --nostream
echo ""

echo "========================================"
echo -e "${GREEN}✅ Migration completed successfully!${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo "  - Database backup: $BACKUP_DIR/dpmd_backup_$TIMESTAMP.sql"
echo "  - Migrations applied: 2"
echo "  - Application restarted: dpmd-api"
echo ""
echo -e "${YELLOW}🔗 Test the API:${NC}"
echo "  curl https://api.dpmdbogorkab.id/api/health"
echo ""
echo -e "${YELLOW}📝 Useful commands:${NC}"
echo "  - View logs:     pm2 logs dpmd-api"
echo "  - Restart API:   pm2 restart dpmd-api"
echo "  - PM2 status:    pm2 status"
echo ""

#!/bin/bash

# Quick Deploy Script - Add Ketua Tim Role to VPS
# Author: DPMD Dev Team
# Date: 2024-12-26

echo "================================================"
echo "🚀 DPMD Backend - Add Ketua Tim Role"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# VPS Configuration
VPS_HOST="72.61.143.224"
VPS_USER="root"
BACKEND_PATH="/var/www/dpmd-backend"
PM2_APP_NAME="dpmd-api"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "   VPS Host: $VPS_HOST"
echo "   Backend Path: $BACKEND_PATH"
echo "   PM2 App: $PM2_APP_NAME"
echo ""

# Step 1: Check VPS connection
echo -e "${YELLOW}⏳ Step 1: Checking VPS connection...${NC}"
ssh -o ConnectTimeout=5 $VPS_USER@$VPS_HOST "echo 'Connected'" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ VPS connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to VPS${NC}"
    exit 1
fi
echo ""

# Step 2: Check if backend directory exists
echo -e "${YELLOW}⏳ Step 2: Checking backend directory...${NC}"
ssh $VPS_USER@$VPS_HOST "[ -d $BACKEND_PATH ] && echo 'exists' || echo 'not found'" | grep -q "exists"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend directory found${NC}"
else
    echo -e "${RED}❌ Backend directory not found: $BACKEND_PATH${NC}"
    exit 1
fi
echo ""

# Step 3: Create SQL script for ketua_tim role
echo -e "${YELLOW}⏳ Step 3: Creating test user for ketua_tim...${NC}"

# Note: Password hash for 'test123' - you should change this
PASSWORD_HASH='$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'

SQL_SCRIPT="
-- Check if ketua_tim user already exists
SELECT 'Checking for existing ketua_tim user...' as status;
SELECT COUNT(*) as count FROM users WHERE email = 'ketuatim@test.com';

-- Insert ketua_tim test user if not exists
INSERT INTO users (name, email, password, role, status, created_at, updated_at)
SELECT 'Test Ketua Tim', 'ketuatim@test.com', '$PASSWORD_HASH', 'ketua_tim', 'active', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ketuatim@test.com');

-- Verify insertion
SELECT id, name, email, role, status FROM users WHERE role = 'ketua_tim';
"

echo "$SQL_SCRIPT" > /tmp/add_ketua_tim.sql
echo -e "${GREEN}✅ SQL script created${NC}"
echo ""

# Step 4: Upload SQL script to VPS
echo -e "${YELLOW}⏳ Step 4: Uploading SQL script to VPS...${NC}"
scp /tmp/add_ketua_tim.sql $VPS_USER@$VPS_HOST:/tmp/
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SQL script uploaded${NC}"
else
    echo -e "${RED}❌ Failed to upload SQL script${NC}"
    exit 1
fi
echo ""

# Step 5: Show next steps
echo -e "${BLUE}📝 Next Steps (Manual):${NC}"
echo ""
echo "1. Connect to VPS:"
echo "   ssh $VPS_USER@$VPS_HOST"
echo ""
echo "2. Run SQL script:"
echo "   mysql -u your_db_user -p your_db_name < /tmp/add_ketua_tim.sql"
echo ""
echo "3. Restart PM2:"
echo "   cd $BACKEND_PATH"
echo "   pm2 restart $PM2_APP_NAME"
echo "   pm2 logs $PM2_APP_NAME --lines 50"
echo ""
echo "4. Test login:"
echo "   curl -X POST https://api.dpmdbogorkab.id/api/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"ketuatim@test.com\",\"password\":\"test123\"}'"
echo ""
echo -e "${YELLOW}⚠️  Note: Default password is 'test123' - CHANGE THIS IN PRODUCTION!${NC}"
echo ""

# Step 6: Offer automatic deployment
read -p "Do you want to execute automatic deployment now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏳ Starting automatic deployment...${NC}"
    echo ""
    
    # Ask for database credentials
    read -p "Enter MySQL username: " DB_USER
    read -sp "Enter MySQL password: " DB_PASS
    echo ""
    read -p "Enter database name: " DB_NAME
    echo ""
    
    # Execute SQL on VPS
    echo -e "${YELLOW}⏳ Executing SQL script...${NC}"
    ssh $VPS_USER@$VPS_HOST "mysql -u $DB_USER -p$DB_PASS $DB_NAME < /tmp/add_ketua_tim.sql"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SQL executed successfully${NC}"
    else
        echo -e "${RED}❌ SQL execution failed${NC}"
        exit 1
    fi
    echo ""
    
    # Restart PM2
    echo -e "${YELLOW}⏳ Restarting PM2...${NC}"
    ssh $VPS_USER@$VPS_HOST "cd $BACKEND_PATH && pm2 restart $PM2_APP_NAME"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PM2 restarted successfully${NC}"
    else
        echo -e "${RED}❌ PM2 restart failed${NC}"
        exit 1
    fi
    echo ""
    
    # Show PM2 status
    echo -e "${YELLOW}⏳ Checking PM2 status...${NC}"
    ssh $VPS_USER@$VPS_HOST "pm2 list | grep $PM2_APP_NAME"
    echo ""
    
    echo -e "${GREEN}✅ Deployment completed!${NC}"
    echo ""
    echo -e "${BLUE}🧪 Test the new role:${NC}"
    echo "curl -X POST https://api.dpmdbogorkab.id/api/auth/login \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"email\":\"ketuatim@test.com\",\"password\":\"test123\"}'"
    echo ""
else
    echo ""
    echo -e "${BLUE}ℹ️  Manual deployment selected${NC}"
    echo "   Please follow the steps above to complete deployment."
fi

echo ""
echo "================================================"
echo "✨ Script completed"
echo "================================================"

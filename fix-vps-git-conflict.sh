#!/bin/bash
# Script untuk fix Git conflict di VPS sebelum menjalankan migrasi

set -e

echo "🔧 Fixing Git Conflicts on VPS..."
echo "=================================="
echo ""

PROJECT_DIR="/var/www/dpmd-backend"
cd $PROJECT_DIR

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Current Git Status:${NC}"
git status --short
echo ""

# Option 1: Stash all changes
echo -e "${YELLOW}Option 1: Stashing all local changes...${NC}"
git stash push -m "VPS local changes backup $(date +%Y%m%d_%H%M%S)"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Changes stashed successfully${NC}"
else
    echo -e "${RED}❌ Stash failed${NC}"
fi
echo ""

# Clean untracked files
echo -e "${YELLOW}Cleaning untracked files...${NC}"
git clean -fd
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Untracked files cleaned${NC}"
else
    echo -e "${RED}❌ Clean failed${NC}"
fi
echo ""

# Pull latest code
echo -e "${YELLOW}Pulling latest code from GitHub...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Code pulled successfully${NC}"
else
    echo -e "${RED}❌ Pull failed${NC}"
    exit 1
fi
echo ""

# List stashed changes
echo -e "${YELLOW}Stashed changes:${NC}"
git stash list
echo ""

echo -e "${GREEN}✅ Git conflicts resolved!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  1. Review stashed changes: git stash show stash@{0}"
echo "  2. Apply stash if needed:  git stash pop"
echo "  3. Run migration script:   bash /root/run-migration-vps.sh"
echo ""

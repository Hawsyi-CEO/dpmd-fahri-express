# Quick Deploy Script - Add Ketua Tim Role to VPS
# Author: DPMD Dev Team
# Date: 2024-12-26
# PowerShell Version

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🚀 DPMD Backend - Add Ketua Tim Role" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# VPS Configuration
$VPS_HOST = "72.61.143.224"
$VPS_USER = "root"
$BACKEND_PATH = "/var/www/dpmd-backend"
$PM2_APP_NAME = "dpmd-api"

Write-Host "📋 Deployment Configuration:" -ForegroundColor Blue
Write-Host "   VPS Host: $VPS_HOST"
Write-Host "   Backend Path: $BACKEND_PATH"
Write-Host "   PM2 App: $PM2_APP_NAME"
Write-Host ""

# Step 1: Check SSH connectivity
Write-Host "⏳ Step 1: Checking VPS connection..." -ForegroundColor Yellow
try {
    $testConnection = ssh -o ConnectTimeout=5 "${VPS_USER}@${VPS_HOST}" "echo 'Connected'" 2>$null
    if ($testConnection -eq "Connected") {
        Write-Host "✅ VPS connection successful" -ForegroundColor Green
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Host "❌ Cannot connect to VPS" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Check backend directory
Write-Host "⏳ Step 2: Checking backend directory..." -ForegroundColor Yellow
$dirCheck = ssh "${VPS_USER}@${VPS_HOST}" "[ -d $BACKEND_PATH ] && echo 'exists' || echo 'not found'"
if ($dirCheck -match "exists") {
    Write-Host "✅ Backend directory found" -ForegroundColor Green
} else {
    Write-Host "❌ Backend directory not found: $BACKEND_PATH" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Create SQL script
Write-Host "⏳ Step 3: Creating SQL script for ketua_tim..." -ForegroundColor Yellow

$PASSWORD_HASH = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'

$SQL_SCRIPT = @"
-- Check if ketua_tim user already exists
SELECT 'Checking for existing ketua_tim user...' as status;
SELECT COUNT(*) as count FROM users WHERE email = 'ketuatim@test.com';

-- Insert ketua_tim test user if not exists
INSERT INTO users (name, email, password, role, status, created_at, updated_at)
SELECT 'Test Ketua Tim', 'ketuatim@test.com', '$PASSWORD_HASH', 'ketua_tim', 'active', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ketuatim@test.com');

-- Verify insertion
SELECT id, name, email, role, status FROM users WHERE role = 'ketua_tim';
"@

$SQL_SCRIPT | Out-File -FilePath "$env:TEMP\add_ketua_tim.sql" -Encoding UTF8
Write-Host "✅ SQL script created" -ForegroundColor Green
Write-Host ""

# Step 4: Upload SQL script
Write-Host "⏳ Step 4: Uploading SQL script to VPS..." -ForegroundColor Yellow
scp "$env:TEMP\add_ketua_tim.sql" "${VPS_USER}@${VPS_HOST}:/tmp/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SQL script uploaded" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to upload SQL script" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Show manual steps
Write-Host "📝 Next Steps (Manual):" -ForegroundColor Blue
Write-Host ""
Write-Host "1. Connect to VPS:"
Write-Host "   ssh ${VPS_USER}@${VPS_HOST}"
Write-Host ""
Write-Host "2. Run SQL script:"
Write-Host "   mysql -u your_db_user -p your_db_name < /tmp/add_ketua_tim.sql"
Write-Host ""
Write-Host "3. Restart PM2:"
Write-Host "   cd $BACKEND_PATH"
Write-Host "   pm2 restart $PM2_APP_NAME"
Write-Host "   pm2 logs $PM2_APP_NAME --lines 50"
Write-Host ""
Write-Host "4. Test login:"
Write-Host "   curl -X POST https://api.dpmdbogorkab.id/api/auth/login \"
Write-Host "     -H 'Content-Type: application/json' \"
Write-Host "     -d '{`"email`":`"ketuatim@test.com`",`"password`":`"test123`"}'"
Write-Host ""
Write-Host "⚠️  Note: Default password is 'test123' - CHANGE THIS IN PRODUCTION!" -ForegroundColor Yellow
Write-Host ""

# Step 6: Offer automatic deployment
$response = Read-Host "Do you want to execute automatic deployment now? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "⏳ Starting automatic deployment..." -ForegroundColor Yellow
    Write-Host ""
    
    # Ask for database credentials
    $DB_USER = Read-Host "Enter MySQL username"
    $DB_PASS = Read-Host "Enter MySQL password" -AsSecureString
    $DB_PASS_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASS))
    $DB_NAME = Read-Host "Enter database name"
    Write-Host ""
    
    # Execute SQL on VPS
    Write-Host "⏳ Executing SQL script..." -ForegroundColor Yellow
    ssh "${VPS_USER}@${VPS_HOST}" "mysql -u $DB_USER -p$DB_PASS_Plain $DB_NAME < /tmp/add_ketua_tim.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SQL executed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ SQL execution failed" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
    
    # Restart PM2
    Write-Host "⏳ Restarting PM2..." -ForegroundColor Yellow
    ssh "${VPS_USER}@${VPS_HOST}" "cd $BACKEND_PATH && pm2 restart $PM2_APP_NAME"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PM2 restarted successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ PM2 restart failed" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
    
    # Show PM2 status
    Write-Host "⏳ Checking PM2 status..." -ForegroundColor Yellow
    ssh "${VPS_USER}@${VPS_HOST}" "pm2 list | grep $PM2_APP_NAME"
    Write-Host ""
    
    Write-Host "✅ Deployment completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🧪 Test the new role:" -ForegroundColor Blue
    Write-Host "curl -X POST https://api.dpmdbogorkab.id/api/auth/login \"
    Write-Host "  -H 'Content-Type: application/json' \"
    Write-Host "  -d '{`"email`":`"ketuatim@test.com`",`"password`":`"test123`"}'"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ℹ️  Manual deployment selected" -ForegroundColor Blue
    Write-Host "   Please follow the steps above to complete deployment."
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✨ Script completed" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# PowerShell script to execute cleanup-positions.sql using Laragon MySQL
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  CLEANUP POSITION TABLES" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Laragon MySQL path
$mysqlPath = "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe"
$dbName = "dpmd"
$sqlFile = "cleanup-positions.sql"

# Check if MySQL exists
if (!(Test-Path $mysqlPath)) {
    Write-Host "❌ MySQL not found at: $mysqlPath" -ForegroundColor Red
    Write-Host "Please update the path in this script" -ForegroundColor Yellow
    exit 1
}

# Check if SQL file exists
if (!(Test-Path $sqlFile)) {
    Write-Host "❌ SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "📁 MySQL Path: $mysqlPath" -ForegroundColor Gray
Write-Host "📁 Database: $dbName" -ForegroundColor Gray
Write-Host "📁 SQL File: $sqlFile" -ForegroundColor Gray
Write-Host ""

# Backup first
Write-Host "📦 Creating backup first..." -ForegroundColor Yellow
$backupFile = "backup_before_cleanup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
& $mysqlPath -u root $dbName --execute="SELECT 'Backup created' AS status;" > $null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database connection successful" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to connect to database" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⚠️  WARNING: This will DROP the following:" -ForegroundColor Yellow
Write-Host "   - positions table" -ForegroundColor Red
Write-Host "   - position_history table" -ForegroundColor Red
Write-Host "   - position_id column from users table" -ForegroundColor Red
Write-Host ""

$confirmation = Read-Host "Are you sure you want to continue? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "❌ Operation cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🗑️  Executing cleanup script..." -ForegroundColor Yellow

# Execute SQL file
Get-Content $sqlFile | & $mysqlPath -u root $dbName

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "====================================================" -ForegroundColor Green
    Write-Host "  ✅ CLEANUP SUCCESSFUL!" -ForegroundColor Green
    Write-Host "====================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update Prisma schema (remove position models)" -ForegroundColor White
    Write-Host "2. Run: npx prisma generate" -ForegroundColor White
    Write-Host "3. Restart backend server" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Cleanup failed with errors" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    Write-Host ""
}

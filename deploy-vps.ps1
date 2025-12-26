# PowerShell Script for VPS Deployment
# Run this from Windows PowerShell

Write-Host "🚀 VPS Backend Deployment" -ForegroundColor Green
Write-Host ""
Write-Host "VPS IP: 72.61.143.224" -ForegroundColor Cyan
Write-Host "Password: Hawsyidigital@123" -ForegroundColor Yellow
Write-Host ""
Write-Host "================================" -ForegroundColor Gray
Write-Host "DEPLOYMENT COMMANDS" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Gray
Write-Host ""

$commands = @"
cd /var/www/dpmd-backend && \
git stash && \
git pull origin main && \
mkdir -p storage/avatars storage/uploads/pengurus_files && \
chmod -R 755 storage/ && \
chown -R www-data:www-data storage/ && \
pm2 restart dpmd-api && \
pm2 list
"@

Write-Host "Copy and run this command in SSH session:" -ForegroundColor Yellow
Write-Host ""
Write-Host $commands -ForegroundColor White
Write-Host ""
Write-Host "================================" -ForegroundColor Gray
Write-Host ""
Write-Host "To connect to VPS, run:" -ForegroundColor Cyan
Write-Host "ssh root@72.61.143.224" -ForegroundColor White
Write-Host ""
Write-Host "Then paste the commands above." -ForegroundColor Cyan
Write-Host ""

# Try to connect automatically (requires user interaction for password)
Write-Host "Press Enter to connect to VPS..." -ForegroundColor Yellow
Read-Host

ssh root@72.61.143.224

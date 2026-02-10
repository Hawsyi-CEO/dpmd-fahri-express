/**
 * Upload Monitor Utility
 * Untuk memantau status upload massal Bankeu
 * Usage: node src/utils/uploadMonitor.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

async function getDbConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
}

async function getUploadStats() {
  const conn = await getDbConnection();
  
  try {
    // Total proposals hari ini
    const [todayCount] = await conn.query(`
      SELECT COUNT(*) as total 
      FROM bankeu_proposals 
      WHERE DATE(created_at) = CURDATE()
    `);

    // Per jam hari ini
    const [hourlyStats] = await conn.query(`
      SELECT 
        HOUR(created_at) as jam,
        COUNT(*) as jumlah
      FROM bankeu_proposals 
      WHERE DATE(created_at) = CURDATE()
      GROUP BY HOUR(created_at)
      ORDER BY jam
    `);

    // Per 5 menit terakhir
    const [last5Min] = await conn.query(`
      SELECT COUNT(*) as total 
      FROM bankeu_proposals 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    `);

    // Per menit terakhir
    const [lastMin] = await conn.query(`
      SELECT COUNT(*) as total 
      FROM bankeu_proposals 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
    `);

    // Status breakdown
    const [statusBreakdown] = await conn.query(`
      SELECT 
        status,
        COUNT(*) as jumlah
      FROM bankeu_proposals 
      WHERE DATE(created_at) = CURDATE()
      GROUP BY status
    `);

    // Active DB connections
    const [connections] = await conn.query(`SHOW STATUS LIKE 'Threads_connected'`);
    const [maxConn] = await conn.query(`SHOW VARIABLES LIKE 'max_connections'`);

    // Desa yang sudah upload hari ini
    const [desaCount] = await conn.query(`
      SELECT COUNT(DISTINCT desa_id) as total 
      FROM bankeu_proposals 
      WHERE DATE(created_at) = CURDATE()
    `);

    return {
      todayTotal: todayCount[0].total,
      last5Min: last5Min[0].total,
      lastMin: lastMin[0].total,
      hourlyStats,
      statusBreakdown,
      dbConnections: parseInt(connections[0].Value),
      maxConnections: parseInt(maxConn[0].Value),
      desaCount: desaCount[0].total
    };
  } finally {
    await conn.end();
  }
}

function getFolderSize(dirPath) {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    }
  } catch (err) {
    return 0;
  }
  
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[H');
}

async function displayMonitor() {
  clearScreen();
  
  console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║        📊 BANKEU UPLOAD MONITOR - DPMD Kab. Bogor         ║${colors.reset}`);
  console.log(`${colors.cyan}╠════════════════════════════════════════════════════════════╣${colors.reset}`);
  console.log(`${colors.cyan}║${colors.reset}  Last Update: ${new Date().toLocaleString('id-ID')}              ${colors.cyan}║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');

  try {
    const stats = await getUploadStats();
    
    // Upload Rate
    console.log(`${colors.yellow}📈 UPLOAD RATE${colors.reset}`);
    console.log(`   ├─ Per Menit Terakhir : ${colors.green}${stats.lastMin} proposal${colors.reset}`);
    console.log(`   ├─ Per 5 Menit        : ${colors.green}${stats.last5Min} proposal${colors.reset}`);
    console.log(`   └─ Total Hari Ini     : ${colors.green}${stats.todayTotal} proposal${colors.reset}`);
    console.log('');

    // Desa Stats
    console.log(`${colors.yellow}🏘️  DESA AKTIF HARI INI${colors.reset}`);
    console.log(`   └─ ${colors.green}${stats.desaCount} desa${colors.reset} sudah upload`);
    console.log('');

    // Database Health
    const connPercent = ((stats.dbConnections / stats.maxConnections) * 100).toFixed(1);
    const connColor = connPercent > 80 ? colors.red : connPercent > 50 ? colors.yellow : colors.green;
    console.log(`${colors.yellow}💾 DATABASE HEALTH${colors.reset}`);
    console.log(`   ├─ Connections: ${connColor}${stats.dbConnections}/${stats.maxConnections}${colors.reset} (${connPercent}%)`);
    console.log(`   └─ Status: ${connPercent < 80 ? colors.green + '✅ Healthy' : colors.red + '⚠️ High Load'}${colors.reset}`);
    console.log('');

    // Storage
    const bankeuFolder = path.join(__dirname, '../../storage/uploads/bankeu');
    const folderSize = getFolderSize(bankeuFolder);
    console.log(`${colors.yellow}📁 STORAGE${colors.reset}`);
    console.log(`   └─ Bankeu Folder: ${colors.blue}${formatBytes(folderSize)}${colors.reset}`);
    console.log('');

    // Hourly breakdown
    if (stats.hourlyStats.length > 0) {
      console.log(`${colors.yellow}⏰ UPLOAD PER JAM (Hari Ini)${colors.reset}`);
      stats.hourlyStats.forEach(h => {
        const bar = '█'.repeat(Math.min(Math.ceil(h.jumlah / 10), 30));
        console.log(`   ${String(h.jam).padStart(2, '0')}:00 │${colors.blue}${bar}${colors.reset} ${h.jumlah}`);
      });
      console.log('');
    }

    // Status breakdown
    if (stats.statusBreakdown.length > 0) {
      console.log(`${colors.yellow}📋 STATUS BREAKDOWN${colors.reset}`);
      stats.statusBreakdown.forEach(s => {
        let statusColor = colors.reset;
        if (s.status === 'draft') statusColor = colors.yellow;
        else if (s.status === 'submitted') statusColor = colors.blue;
        else if (s.status === 'verified') statusColor = colors.green;
        else if (s.status === 'rejected') statusColor = colors.red;
        console.log(`   ├─ ${statusColor}${s.status}${colors.reset}: ${s.jumlah}`);
      });
      console.log('');
    }

  } catch (error) {
    console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
  }

  console.log(`${colors.magenta}Press Ctrl+C to exit. Refreshing every 5 seconds...${colors.reset}`);
}

// Main loop
async function main() {
  console.log('Starting Bankeu Upload Monitor...');
  
  // Initial display
  await displayMonitor();
  
  // Refresh every 5 seconds
  setInterval(async () => {
    await displayMonitor();
  }, 5000);
}

main().catch(console.error);

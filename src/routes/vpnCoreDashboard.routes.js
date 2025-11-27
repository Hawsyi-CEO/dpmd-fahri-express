const express = require('express');
const router = express.Router();
const { vpnAuth } = require('../middlewares/auth');

// Import existing controllers
const kepalaDinasController = require('../controllers/kepalaDinas.controller');
const addController = require('../controllers/add.controller');
const ddController = require('../controllers/dd.controller');
const bhprdController = require('../controllers/bhprd.controller');
const perjadinController = require('../controllers/perjalananDinas.controller');
const ddEarmarkedT1Controller = require('../controllers/dd-earmarked-t1.controller');
const ddEarmarkedT2Controller = require('../controllers/dd-earmarked-t2.controller');
const ddNonEarmarkedT1Controller = require('../controllers/dd-nonearmarked-t1.controller');
const ddNonEarmarkedT2Controller = require('../controllers/dd-nonearmarked-t2.controller');
const insentifDdController = require('../controllers/insentif-dd.controller');
const bhprdT1Controller = require('../controllers/bhprd-t1.controller');
const bhprdT2Controller = require('../controllers/bhprd-t2.controller');
const bhprdT3Controller = require('../controllers/bhprd-t3.controller');
const bankeuT1Controller = require('../controllers/bankeu-t1.controller');
const bankeuT2Controller = require('../controllers/bankeu-t2.controller');

// Apply VPN auth middleware to all routes
router.use(vpnAuth);

// ======================
// KEPALA DINAS / MAIN DASHBOARD
// ======================
router.get('/dashboard', kepalaDinasController.getDashboardStats);
router.get('/add/data', addController.getAddData);
router.get('/add/info', addController.getAddInfo);
router.get('/dd/data', ddController.getDdData);
router.get('/bhprd/data', bhprdController.getBhprdData);
router.get('/bhprd/info', bhprdController.getBhprdInfo);

// ======================
// DD DETAILED DATA (All Tabs)
// ======================
router.get('/dd-earmarked-t1/data', ddEarmarkedT1Controller.getDdEarmarkedT1Data);
router.get('/dd-earmarked-t1/info', ddEarmarkedT1Controller.getDdEarmarkedT1Info);
router.get('/dd-earmarked-t2/data', ddEarmarkedT2Controller.getDdEarmarkedT2Data);
router.get('/dd-earmarked-t2/info', ddEarmarkedT2Controller.getDdEarmarkedT2Info);
router.get('/dd-nonearmarked-t1/data', ddNonEarmarkedT1Controller.getDdNonEarmarkedT1Data);
router.get('/dd-nonearmarked-t1/info', ddNonEarmarkedT1Controller.getDdNonEarmarkedT1Info);
router.get('/dd-nonearmarked-t2/data', ddNonEarmarkedT2Controller.getDdNonEarmarkedT2Data);
router.get('/dd-nonearmarked-t2/info', ddNonEarmarkedT2Controller.getDdNonEarmarkedT2Info);
router.get('/insentif-dd/data', insentifDdController.getInsentifDdData);
router.get('/insentif-dd/info', insentifDdController.getInsentifDdInfo);

// ======================
// BHPRD DETAILED DATA (All Tahap)
// ======================
router.get('/bhprd-t1/data', bhprdT1Controller.getBhprdT1Data);
router.get('/bhprd-t1/info', bhprdT1Controller.getBhprdT1Info);
router.get('/bhprd-t2/data', bhprdT2Controller.getBhprdT2Data);
router.get('/bhprd-t2/info', bhprdT2Controller.getBhprdT2Info);
router.get('/bhprd-t3/data', bhprdT3Controller.getBhprdT3Data);
router.get('/bhprd-t3/info', bhprdT3Controller.getBhprdT3Info);

// ======================
// BANKEU (Bantuan Keuangan) DETAILED DATA
// ======================
router.get('/bankeu-t1/data', bankeuT1Controller.getBankeuT1Data);
router.get('/bankeu-t1/info', bankeuT1Controller.getBankeuT1Info);
router.get('/bankeu-t2/data', bankeuT2Controller.getBankeuT2Data);
router.get('/bankeu-t2/info', bankeuT2Controller.getBankeuT2Info);

// ======================
// PERJADIN (Travel Orders) ENDPOINTS
// ======================
router.get('/perjadin/dashboard', perjadinController.getDashboardStats);
router.get('/perjadin/dashboard/weekly-schedule', perjadinController.getWeeklySchedule);
router.get('/perjadin/statistik', perjadinController.getStatistik);
router.get('/perjadin/kegiatan', perjadinController.getAllKegiatan);
router.get('/perjadin/kegiatan/:id', perjadinController.getKegiatanById);

module.exports = router;

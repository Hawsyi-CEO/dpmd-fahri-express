/**
 * Kelembagaan Controllers Index
 * Central export point for all kelembagaan controllers
 */

const rwController = require('./rw.controller');
const rtController = require('./rt.controller');
const posyanduController = require('./posyandu.controller');
const { 
  karangTarunaController, 
  lpmController, 
  pkkController, 
  satlinmasController 
} = require('./singleton.controller');
const summaryController = require('./summary.controller');
const pengurusController = require('./pengurus.controller');

module.exports = {
  // Multi-instance controllers
  rwController,
  rtController,
  posyanduController,
  
  // Singleton controllers
  karangTarunaController,
  lpmController,
  pkkController,
  satlinmasController,
  
  // Summary & aggregation
  summaryController,
  
  // Pengurus management
  pengurusController
};

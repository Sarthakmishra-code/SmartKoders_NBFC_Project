import express from 'express';
import axios from 'axios';
import { getDatabase } from '../utils/initDatabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    await db.get('SELECT 1');
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'operational',
        database: 'connected'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

router.get('/ml', async (req, res) => {
  try {
    const mlServiceURL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.get(`${mlServiceURL}/health`, { timeout: 5000 });
    
    res.json({
      success: true,
      mlService: 'operational',
      details: response.data
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      mlService: 'unavailable',
      error: error.message
    });
  }
});

export default router;
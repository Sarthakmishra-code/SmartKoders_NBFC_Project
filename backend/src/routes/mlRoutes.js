import express from 'express';
import {
  predictLoanEligibility,
  checkMLHealth,
  genericPredict
} from '../controllers/mlController.js';

const router = express.Router();

/**
 * Main ML prediction endpoint
 * Uses trained XGBoost loan eligibility model
 */
router.post('/predict', predictLoanEligibility);

/**
 * ML service health check
 */
router.get('/health', checkMLHealth);

/**
 * Generic passthrough prediction (debug/testing)
 */
router.post('/predict-generic', genericPredict);

export default router;

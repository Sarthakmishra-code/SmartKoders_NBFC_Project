import express from 'express';
import {
  getAnalytics,
  getAllApplications,
  getAgentLogs,
  updateApplicationStatus
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/analytics', getAnalytics);
router.get('/applications', getAllApplications);
router.get('/agent-logs', getAgentLogs);
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;
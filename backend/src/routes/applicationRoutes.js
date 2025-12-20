import express from 'express';
import {
  createApplication,
  getApplication,
  getUserApplications,
  updateApplication,
  deleteApplication,
  runEligibilityCheck,
  runUnderwriting,
  makeFinalDecision,
  getOfferLetter
} from '../controllers/applicationController.js';

const router = express.Router();

router.post('/', createApplication);
router.get('/:id', getApplication);
router.get('/user/:userId', getUserApplications);
router.patch('/:id', updateApplication);
router.delete('/:id', deleteApplication);
router.post('/:id/eligibility', runEligibilityCheck);
router.post('/:id/underwriting', runUnderwriting);
router.post('/:id/decision', makeFinalDecision);
router.get('/:id/offer-letter', getOfferLetter);

export default router;
import express from 'express';
import {
  uploadDocument,
  getDocument,
  getApplicationDocuments,
  verifyDocument,
  deleteDocument
} from '../controllers/documentController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/:id', getDocument);
router.get('/application/:applicationId', getApplicationDocuments);
router.post('/verify/:id', verifyDocument);
router.delete('/:id', deleteDocument);

export default router;

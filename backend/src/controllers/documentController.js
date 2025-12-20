import { getDatabase } from '../utils/initDatabase.js';
import VerificationAgent from '../agents/VerificationAgent.js';
import path from 'path';
import fs from 'fs/promises';

const verificationAgent = new VerificationAgent();

export const uploadDocument = async (req, res) => {
  try {
    const { applicationId, documentType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!applicationId || !documentType) {
      return res.status(400).json({
        success: false,
        message: 'applicationId and documentType are required'
      });
    }

    const db = await getDatabase();

    // Check if application exists
    const application = await db.get(
      'SELECT * FROM loan_applications WHERE id = ?',
      [applicationId]
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Save document record
    const result = await db.run(
      `INSERT INTO documents (application_id, document_type, file_path, original_name)
       VALUES (?, ?, ?, ?)`,
      [applicationId, documentType, req.file.path, req.file.originalname]
    );

    const document = await db.get(
      'SELECT * FROM documents WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

export const getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const document = await db.get('SELECT * FROM documents WHERE id = ?', [id]);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      document
    });

  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message
    });
  }
};

export const getApplicationDocuments = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const db = await getDatabase();

    const documents = await db.all(
      'SELECT * FROM documents WHERE application_id = ? ORDER BY uploaded_at DESC',
      [applicationId]
    );

    res.json({
      success: true,
      count: documents.length,
      documents
    });

  } catch (error) {
    console.error('Get application documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

export const verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const document = await db.get('SELECT * FROM documents WHERE id = ?', [id]);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    let verificationResult;

    switch (document.document_type) {
      case 'pan':
        const { panNumber } = req.body;
        verificationResult = await verificationAgent.verifyPAN(panNumber, id);
        break;

      case 'salary_slip':
        verificationResult = await verificationAgent.verifySalarySlip(document.file_path, id);
        break;

      case 'bank_statement':
        verificationResult = await verificationAgent.verifyBankStatement(document.file_path, id);
        break;

      case 'identity_proof':
        const { idType = 'aadhaar' } = req.body;
        verificationResult = await verificationAgent.verifyIdentityProof(document.file_path, id, idType);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported document type'
        });
    }

    res.json(verificationResult);

  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({
      success: false,
      message: 'Document verification failed',
      error: error.message
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const document = await db.get('SELECT * FROM documents WHERE id = ?', [id]);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file
    try {
      await fs.unlink(document.file_path);
    } catch (error) {
      console.warn('Failed to delete file:', error);
    }

    // Delete database record
    await db.run('DELETE FROM documents WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};
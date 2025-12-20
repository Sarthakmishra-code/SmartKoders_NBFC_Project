import { getDatabase } from '../utils/initDatabase.js';
import fs from 'fs/promises';
import path from 'path';

class VerificationAgent {
  constructor() {
    this.supportedDocTypes = ['pan', 'salary_slip', 'bank_statement', 'identity_proof'];
  }

  /**
   * Verify PAN card
   */
  async verifyPAN(panNumber, documentId = null) {
    const startTime = Date.now();
    
    try {
      // PAN format validation
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      
      if (!panRegex.test(panNumber)) {
        return {
          success: false,
          valid: false,
          message: 'Invalid PAN format. PAN should be in format: ABCDE1234F',
          executionTime: Date.now() - startTime
        };
      }

      // Mock PAN verification (In production, call actual PAN verification API)
      const isValid = await this.mockPANVerification(panNumber);
      
      const result = {
        success: true,
        valid: isValid,
        panNumber,
        verificationType: 'format_and_mock_api',
        message: isValid 
          ? '✅ PAN verified successfully' 
          : '❌ PAN verification failed',
        executionTime: Date.now() - startTime
      };

      if (documentId) {
        await this.updateDocumentStatus(documentId, isValid ? 'verified' : 'rejected', result);
      }

      return result;

    } catch (error) {
      console.error('PAN verification error:', error);
      return {
        success: false,
        valid: false,
        message: 'PAN verification failed',
        error: error.message
      };
    }
  }

  /**
   * Extract and verify salary slip data
   */
  async verifySalarySlip(filePath, documentId) {
    const startTime = Date.now();
    
    try {
      // Mock OCR extraction (In production, use Tesseract.js or external OCR API)
      const extractedData = await this.mockSalarySlipOCR(filePath);
      
      // Validation checks
      const validations = {
        hasEmployerName: !!extractedData.employerName,
        hasEmployeeName: !!extractedData.employeeName,
        hasSalaryAmount: extractedData.grossSalary > 0,
        hasDate: !!extractedData.salaryMonth,
        salaryReasonable: extractedData.grossSalary >= 10000 && extractedData.grossSalary <= 10000000
      };

      const isValid = Object.values(validations).every(v => v === true);
      const qualityScore = (Object.values(validations).filter(v => v).length / Object.keys(validations).length) * 100;

      const result = {
        success: true,
        valid: isValid,
        extractedData,
        validations,
        qualityScore: Math.round(qualityScore),
        message: isValid 
          ? '✅ Salary slip verified successfully' 
          : '⚠️ Salary slip has some issues',
        executionTime: Date.now() - startTime
      };

      await this.updateDocumentStatus(
        documentId, 
        isValid ? 'verified' : 'rejected',
        result
      );

      return result;

    } catch (error) {
      console.error('Salary slip verification error:', error);
      return {
        success: false,
        valid: false,
        message: 'Failed to verify salary slip',
        error: error.message
      };
    }
  }

  /**
   * Verify bank statement
   */
  async verifyBankStatement(filePath, documentId) {
    const startTime = Date.now();
    
    try {
      // Mock bank statement analysis
      const extractedData = await this.mockBankStatementAnalysis(filePath);
      
      // Calculate average monthly income
      const avgIncome = extractedData.monthlyCredits.reduce((a, b) => a + b, 0) / extractedData.monthlyCredits.length;
      
      // Check for red flags
      const redFlags = {
        insufficientBalance: extractedData.averageBalance < 5000,
        highBounceRate: extractedData.bounceCount > 2,
        irregularIncome: this.calculateCoefficientOfVariation(extractedData.monthlyCredits) > 0.5
      };

      const hasRedFlags = Object.values(redFlags).some(v => v === true);
      const isValid = !hasRedFlags && avgIncome >= 15000;

      const result = {
        success: true,
        valid: isValid,
        extractedData: {
          ...extractedData,
          averageMonthlyIncome: Math.round(avgIncome)
        },
        redFlags,
        message: isValid 
          ? '✅ Bank statement verified successfully' 
          : '⚠️ Bank statement shows some concerns',
        executionTime: Date.now() - startTime
      };

      await this.updateDocumentStatus(
        documentId,
        isValid ? 'verified' : 'rejected',
        result
      );

      return result;

    } catch (error) {
      console.error('Bank statement verification error:', error);
      return {
        success: false,
        valid: false,
        message: 'Failed to verify bank statement',
        error: error.message
      };
    }
  }

  /**
   * Verify identity proof (Aadhaar/Passport/DL)
   */
  async verifyIdentityProof(filePath, documentId, idType = 'aadhaar') {
    const startTime = Date.now();
    
    try {
      // Mock identity verification
      const extractedData = await this.mockIdentityOCR(filePath, idType);
      
      const validations = {
        hasName: !!extractedData.name,
        hasIdNumber: !!extractedData.idNumber,
        hasAddress: !!extractedData.address,
        validFormat: this.validateIdFormat(extractedData.idNumber, idType)
      };

      const isValid = Object.values(validations).every(v => v === true);

      const result = {
        success: true,
        valid: isValid,
        extractedData,
        validations,
        message: isValid 
          ? '✅ Identity proof verified successfully' 
          : '⚠️ Identity proof has validation issues',
        executionTime: Date.now() - startTime
      };

      await this.updateDocumentStatus(
        documentId,
        isValid ? 'verified' : 'rejected',
        result
      );

      return result;

    } catch (error) {
      console.error('Identity proof verification error:', error);
      return {
        success: false,
        valid: false,
        message: 'Failed to verify identity proof',
        error: error.message
      };
    }
  }

  /**
   * Check overall verification status for an application
   */
  async checkVerificationStatus(applicationId) {
    const db = await getDatabase();
    
    try {
      const documents = await db.all(
        'SELECT * FROM documents WHERE application_id = ?',
        [applicationId]
      );

      if (documents.length === 0) {
        return {
          success: true,
          allVerified: false,
          message: '📄 No documents uploaded yet. Please upload required documents.',
          documents: []
        };
      }

      const verified = documents.filter(d => d.verification_status === 'verified').length;
      const pending = documents.filter(d => d.verification_status === 'pending').length;
      const rejected = documents.filter(d => d.verification_status === 'rejected').length;

      const allVerified = verified === documents.length;

      return {
        success: true,
        allVerified,
        summary: {
          total: documents.length,
          verified,
          pending,
          rejected
        },
        message: allVerified 
          ? '✅ All documents verified successfully!'
          : `📊 Verification Status: ${verified}/${documents.length} verified`,
        documents: documents.map(d => ({
          type: d.document_type,
          status: d.verification_status,
          uploadedAt: d.uploaded_at
        }))
      };

    } catch (error) {
      console.error('Status check error:', error);
      return {
        success: false,
        message: 'Failed to check verification status',
        error: error.message
      };
    }
  }

  /**
   * Log agent action
   */
  async logAction(applicationId, action, inputData, outputData, success = true, errorMessage = null, executionTime = 0) {
    const db = await getDatabase();
    
    try {
      await db.run(
        `INSERT INTO agent_actions (application_id, agent_name, action, input_data, output_data, success, error_message, execution_time_ms)
         VALUES (?, 'VerificationAgent', ?, ?, ?, ?, ?, ?)`,
        [
          applicationId,
          action,
          JSON.stringify(inputData),
          JSON.stringify(outputData),
          success ? 1 : 0,
          errorMessage,
          executionTime
        ]
      );
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }

  // ============= HELPER METHODS (Mock implementations) =============

  async mockPANVerification(panNumber) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock verification: Check if 4th character is 'P' (Personal PAN)
    return panNumber.charAt(3) === 'P';
  }

  async mockSalarySlipOCR(filePath) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      employerName: 'Tech Solutions Pvt Ltd',
      employeeName: 'John Doe',
      employeeId: 'EMP12345',
      grossSalary: 75000,
      netSalary: 65000,
      salaryMonth: '2024-11',
      deductions: 10000
    };
  }

  async mockBankStatementAnalysis(filePath) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      accountNumber: 'XXXX1234',
      bankName: 'HDFC Bank',
      monthlyCredits: [50000, 52000, 48000],
      monthlyDebits: [35000, 38000, 32000],
      averageBalance: 45000,
      bounceCount: 0,
      analysisMonths: 3
    };
  }

  async mockIdentityOCR(filePath, idType) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      name: 'John Doe',
      idNumber: idType === 'aadhaar' ? '1234-5678-9012' : 'A1234567',
      address: '123, MG Road, Bangalore, Karnataka - 560001',
      dateOfBirth: '1990-05-15',
      idType
    };
  }

  validateIdFormat(idNumber, idType) {
    const patterns = {
      aadhaar: /^\d{4}-?\d{4}-?\d{4}$/,
      passport: /^[A-Z]\d{7}$/,
      driving_license: /^[A-Z]{2}\d{13}$/
    };

    return patterns[idType] ? patterns[idType].test(idNumber) : true;
  }

  calculateCoefficientOfVariation(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return stdDev / mean;
  }

  async updateDocumentStatus(documentId, status, verificationData) {
    const db = await getDatabase();
    
    await db.run(
      `UPDATE documents 
       SET verification_status = ?, extracted_data = ?, verification_notes = ?
       WHERE id = ?`,
      [
        status,
        JSON.stringify(verificationData.extractedData || {}),
        verificationData.message,
        documentId
      ]
    );
  }
}

export default VerificationAgent;
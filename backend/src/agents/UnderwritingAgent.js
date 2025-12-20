import { getDatabase } from '../utils/initDatabase.js';
import axios from 'axios';

class UnderwritingAgent {
  constructor() {
    this.mlServiceURL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.minCreditScore = parseInt(process.env.MIN_CREDIT_SCORE) || 650;
    this.maxDTI = parseFloat(process.env.MAX_DTI_RATIO) || 50;
  }

  /**
   * Assess loan eligibility for an application
   */
  async assessEligibility(applicationId) {
    const startTime = Date.now();
    const db = await getDatabase();

    try {
      // Get application data
      const application = await db.get(
        'SELECT * FROM loan_applications WHERE id = ?',
        [applicationId]
      );

      if (!application) {
        return {
          success: false,
          message: 'Application not found'
        };
      }

      // Get credit score from ML service
      const creditScore = await this.getCreditScore(application);
      
      // Calculate DTI
      const dti = this.calculateDTI(
        application.monthly_income,
        application.existing_emi,
        application.loan_amount,
        application.tenure_months
      );

      // Calculate EMI
      const interestRate = this.determineInterestRate(creditScore);
      const emi = this.calculateEMI(
        application.loan_amount,
        interestRate,
        application.tenure_months
      );

      // Assess risk
      const riskAssessment = this.assessRisk(creditScore, dti, application.monthly_income);

      // Determine max loan amount
      const maxLoanAmount = this.calculateMaxLoanAmount(
        application.monthly_income,
        application.existing_emi,
        creditScore
      );

      // Update application
      await db.run(
        `UPDATE loan_applications 
         SET credit_score = ?, dti_ratio = ?, interest_rate = ?, monthly_emi = ?, 
             risk_category = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [creditScore, dti, interestRate, emi, riskAssessment.category, applicationId]
      );

      const result = {
        success: true,
        eligible: creditScore >= this.minCreditScore && dti <= this.maxDTI,
        creditScore,
        dtiRatio: Math.round(dti * 100) / 100,
        interestRate,
        monthlyEMI: Math.round(emi),
        riskCategory: riskAssessment.category,
        maxLoanAmount: Math.round(maxLoanAmount),
        message: this.formatEligibilityMessage(creditScore, dti, riskAssessment),
        executionTime: Date.now() - startTime
      };

      await this.logAction(applicationId, 'eligibility_assessment', application, result, true, null, Date.now() - startTime);

      return result;

    } catch (error) {
      console.error('Eligibility assessment error:', error);
      
      await this.logAction(applicationId, 'eligibility_assessment', {}, {}, false, error.message, Date.now() - startTime);

      return {
        success: false,
        message: 'Failed to assess eligibility',
        error: error.message
      };
    }
  }

  /**
   * Get credit score from ML service or calculate locally
   */
  async getCreditScore(application) {
    try {
      // Try to get from ML service
      const response = await axios.post(
        `${this.mlServiceURL}/predict/credit-score`,
        {
          monthly_income: application.monthly_income,
          existing_loans: application.existing_emi > 0 ? 1 : 0,
          loan_amount: application.loan_amount,
          employment_type: application.employment_type || 'salaried',
          tenure_months: application.tenure_months
        },
        { timeout: 5000 }
      );

      return response.data.credit_score;

    } catch (error) {
      console.warn('ML service unavailable, using fallback credit score calculation');
      return this.calculateCreditScoreFallback(application);
    }
  }

  /**
   * Fallback credit score calculation
   */
  calculateCreditScoreFallback(application) {
    let score = 700; // Base score

    // Income factor
    if (application.monthly_income >= 100000) score += 50;
    else if (application.monthly_income >= 50000) score += 30;
    else if (application.monthly_income < 25000) score -= 50;

    // Loan amount to income ratio
    const loanToIncomeRatio = application.loan_amount / (application.monthly_income * 12);
    if (loanToIncomeRatio > 5) score -= 40;
    else if (loanToIncomeRatio > 3) score -= 20;

    // Existing EMI factor
    if (application.existing_emi > 0) {
      const emiToIncomeRatio = application.existing_emi / application.monthly_income;
      if (emiToIncomeRatio > 0.4) score -= 30;
      else if (emiToIncomeRatio > 0.25) score -= 15;
    }

    // Employment type
    if (application.employment_type === 'self_employed') score -= 20;

    // Ensure score is within valid range
    return Math.max(300, Math.min(900, score));
  }

  /**
   * Calculate Debt-to-Income ratio
   */
  calculateDTI(monthlyIncome, existingEMI, loanAmount, tenureMonths) {
    if (!monthlyIncome || monthlyIncome <= 0) return 100;

    const interestRate = 12; // Default rate for calculation
    const proposedEMI = this.calculateEMI(loanAmount, interestRate, tenureMonths);
    const totalEMI = existingEMI + proposedEMI;

    return (totalEMI / monthlyIncome) * 100;
  }

  /**
   * Calculate EMI using formula: [P * r * (1+r)^n] / [(1+r)^n - 1]
   */
  calculateEMI(principal, annualRate, tenureMonths) {
    const monthlyRate = annualRate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi);
  }

  /**
   * Determine interest rate based on credit score
   */
  determineInterestRate(creditScore) {
    if (creditScore >= 750) {
      return parseFloat(process.env.INTEREST_RATE_EXCELLENT) || 10.5;
    } else if (creditScore >= 700) {
      return parseFloat(process.env.INTEREST_RATE_GOOD) || 12.5;
    } else {
      return parseFloat(process.env.INTEREST_RATE_FAIR) || 15.0;
    }
  }

  /**
   * Assess risk category
   */
  assessRisk(creditScore, dti, monthlyIncome) {
    let riskScore = 0;

    // Credit score factor
    if (creditScore < 650) riskScore += 40;
    else if (creditScore < 700) riskScore += 25;
    else if (creditScore < 750) riskScore += 10;

    // DTI factor
    if (dti > 50) riskScore += 30;
    else if (dti > 40) riskScore += 20;
    else if (dti > 30) riskScore += 10;

    // Income factor
    if (monthlyIncome < 25000) riskScore += 20;
    else if (monthlyIncome < 40000) riskScore += 10;

    // Categorize
    let category, description;
    if (riskScore >= 60) {
      category = 'high';
      description = 'High risk - May require additional security or co-applicant';
    } else if (riskScore >= 30) {
      category = 'medium';
      description = 'Medium risk - Standard processing';
    } else {
      category = 'low';
      description = 'Low risk - Preferred customer';
    }

    return {
      category,
      score: riskScore,
      description
    };
  }

  /**
   * Calculate maximum loan amount based on income and obligations
   */
  calculateMaxLoanAmount(monthlyIncome, existingEMI, creditScore) {
    // Maximum EMI allowed (based on DTI limit)
    const maxEMI = (monthlyIncome * this.maxDTI / 100) - existingEMI;

    if (maxEMI <= 0) return 0;

    // Determine tenure based on credit score (better score = longer tenure allowed)
    const tenure = creditScore >= 750 ? 60 : creditScore >= 700 ? 48 : 36;
    
    const interestRate = this.determineInterestRate(creditScore);
    const monthlyRate = interestRate / 12 / 100;

    // Reverse EMI calculation to get principal
    const maxPrincipal = (maxEMI * (Math.pow(1 + monthlyRate, tenure) - 1)) /
                         (monthlyRate * Math.pow(1 + monthlyRate, tenure));

    return Math.max(0, maxPrincipal);
  }

  /**
   * Format eligibility message
   */
  formatEligibilityMessage(creditScore, dti, riskAssessment) {
    if (creditScore < this.minCreditScore) {
      return `❌ Unfortunately, your credit score (${creditScore}) is below our minimum requirement of ${this.minCreditScore}. Please work on improving your credit score and apply again.`;
    }

    if (dti > this.maxDTI) {
      return `❌ Your Debt-to-Income ratio (${dti.toFixed(2)}%) exceeds our maximum limit of ${this.maxDTI}%. Consider reducing existing obligations or loan amount.`;
    }

    if (riskAssessment.category === 'low') {
      return `✅ Great news! You're eligible for the loan with excellent terms. Your credit score of ${creditScore} qualifies you for our best interest rates.`;
    } else if (riskAssessment.category === 'medium') {
      return `✅ You're eligible for the loan. Your credit score is ${creditScore}. ${riskAssessment.description}`;
    } else {
      return `⚠️ You're eligible but classified as ${riskAssessment.category} risk. ${riskAssessment.description}`;
    }
  }

  /**
   * Perform comprehensive underwriting analysis
   */
  async performUnderwriting(applicationId) {
    const startTime = Date.now();
    const db = await getDatabase();

    try {
      // Run eligibility assessment
      const eligibility = await this.assessEligibility(applicationId);

      if (!eligibility.success) {
        return eligibility;
      }

      // Check document verification status
      const documents = await db.all(
        'SELECT * FROM documents WHERE application_id = ?',
        [applicationId]
      );

      const allVerified = documents.length > 0 && 
        documents.every(d => d.verification_status === 'verified');

      const result = {
        success: true,
        eligibilityCheck: eligibility,
        documentsVerified: allVerified,
        readyForDecision: eligibility.eligible && allVerified,
        message: this.formatUnderwritingMessage(eligibility, allVerified),
        executionTime: Date.now() - startTime
      };

      await this.logAction(applicationId, 'full_underwriting', {}, result, true, null, Date.now() - startTime);

      return result;

    } catch (error) {
      console.error('Underwriting error:', error);
      return {
        success: false,
        message: 'Underwriting analysis failed',
        error: error.message
      };
    }
  }

  formatUnderwritingMessage(eligibility, documentsVerified) {
    if (!eligibility.eligible) {
      return eligibility.message;
    }

    if (!documentsVerified) {
      return '📄 Eligibility looks good, but please complete document verification before final decision.';
    }

    return '✅ Underwriting complete! Your application is ready for final decision.';
  }

  /**
   * Log agent action
   */
  async logAction(applicationId, action, inputData, outputData, success = true, errorMessage = null, executionTime = 0) {
    const db = await getDatabase();
    
    try {
      await db.run(
        `INSERT INTO agent_actions (application_id, agent_name, action, input_data, output_data, success, error_message, execution_time_ms)
         VALUES (?, 'UnderwritingAgent', ?, ?, ?, ?, ?, ?)`,
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
}

export default UnderwritingAgent;
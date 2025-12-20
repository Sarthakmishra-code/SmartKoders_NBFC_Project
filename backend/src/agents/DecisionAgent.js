import { getDatabase } from '../utils/initDatabase.js';
import UnderwritingAgent from './UnderwritingAgent.js';

class DecisionAgent {
  constructor() {
    this.underwritingAgent = new UnderwritingAgent();
    this.minCreditScore = parseInt(process.env.MIN_CREDIT_SCORE) || 650;
    this.maxDTI = parseFloat(process.env.MAX_DTI_RATIO) || 50;
    this.minLoanAmount = parseFloat(process.env.MIN_LOAN_AMOUNT) || 50000;
    this.maxLoanAmount = parseFloat(process.env.MAX_LOAN_AMOUNT) || 5000000;
  }

  /**
   * Make final loan decision
   */
  async makeDecision(applicationId) {
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

      // Get underwriting results if not already done
      let underwritingResult;
      if (!application.credit_score || !application.dti_ratio) {
        underwritingResult = await this.underwritingAgent.performUnderwriting(applicationId);
        
        if (!underwritingResult.success) {
          return {
            success: false,
            message: 'Underwriting analysis required before decision',
            underwritingResult
          };
        }
      } else {
        underwritingResult = {
          eligibilityCheck: {
            creditScore: application.credit_score,
            dtiRatio: application.dti_ratio,
            interestRate: application.interest_rate,
            monthlyEMI: application.monthly_emi,
            riskCategory: application.risk_category
          }
        };
      }

      // Check document verification
      const documents = await db.all(
        'SELECT * FROM documents WHERE application_id = ?',
        [applicationId]
      );

      const documentsComplete = documents.length >= 3; // At least 3 documents required
      const allVerified = documents.every(d => d.verification_status === 'verified');

      // Apply decision rules
      const decision = this.applyDecisionRules(
        application,
        underwritingResult.eligibilityCheck,
        documentsComplete,
        allVerified
      );

      // Update application with decision
      await db.run(
        `UPDATE loan_applications 
         SET status = ?, approved_amount = ?, rejection_reason = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          decision.status,
          decision.approvedAmount || null,
          decision.rejectionReason || null,
          applicationId
        ]
      );

      const result = {
        success: true,
        decision: decision.status,
        applicationId,
        requestedAmount: application.loan_amount,
        approvedAmount: decision.approvedAmount,
        interestRate: application.interest_rate,
        monthlyEMI: application.monthly_emi,
        tenure: application.tenure_months,
        message: decision.message,
        termsAndConditions: decision.status === 'approved' ? this.generateTermsAndConditions(application, decision) : null,
        nextSteps: decision.nextSteps,
        executionTime: Date.now() - startTime
      };

      await this.logAction(applicationId, 'final_decision', application, result, true, null, Date.now() - startTime);

      return result;

    } catch (error) {
      console.error('Decision making error:', error);
      
      await this.logAction(applicationId, 'final_decision', {}, {}, false, error.message, Date.now() - startTime);

      return {
        success: false,
        message: 'Failed to make loan decision',
        error: error.message
      };
    }
  }

  /**
   * Apply NBFC policy rules for decision
   */
  applyDecisionRules(application, eligibility, documentsComplete, allVerified) {
    const rules = [];
    let status = 'approved';
    let approvedAmount = application.loan_amount;
    let rejectionReason = null;
    let message = '';
    let nextSteps = [];

    // Rule 1: Minimum credit score
    if (eligibility.creditScore < this.minCreditScore) {
      rules.push({
        rule: 'MIN_CREDIT_SCORE',
        passed: false,
        details: `Credit score ${eligibility.creditScore} below minimum ${this.minCreditScore}`
      });
      status = 'rejected';
      rejectionReason = 'Credit score below minimum requirement';
      message = `❌ Application Rejected\n\nYour credit score of ${eligibility.creditScore} is below our minimum requirement of ${this.minCreditScore}.\n\nTo improve your chances:\n• Pay existing loans on time\n• Reduce credit utilization\n• Avoid multiple loan applications\n• Check your credit report for errors`;
      nextSteps = [
        'Work on improving credit score',
        'Reapply after 6 months',
        'Consider a co-applicant with better credit'
      ];
      return { status, approvedAmount: 0, rejectionReason, message, nextSteps, rules };
    }
    rules.push({ rule: 'MIN_CREDIT_SCORE', passed: true });

    // Rule 2: Maximum DTI ratio
    if (eligibility.dtiRatio > this.maxDTI) {
      rules.push({
        rule: 'MAX_DTI_RATIO',
        passed: false,
        details: `DTI ratio ${eligibility.dtiRatio}% exceeds maximum ${this.maxDTI}%`
      });
      status = 'rejected';
      rejectionReason = 'Debt-to-Income ratio too high';
      message = `❌ Application Rejected\n\nYour Debt-to-Income ratio of ${eligibility.dtiRatio.toFixed(2)}% exceeds our maximum limit of ${this.maxDTI}%.\n\nTo improve your application:\n• Reduce existing EMIs\n• Increase monthly income\n• Apply for a smaller loan amount\n• Consider longer tenure`;
      nextSteps = [
        'Close some existing loans',
        'Apply with reduced loan amount',
        'Increase income sources'
      ];
      return { status, approvedAmount: 0, rejectionReason, message, nextSteps, rules };
    }
    rules.push({ rule: 'MAX_DTI_RATIO', passed: true });

    // Rule 3: Loan amount limits
    if (application.loan_amount < this.minLoanAmount) {
      rules.push({
        rule: 'MIN_LOAN_AMOUNT',
        passed: false,
        details: `Loan amount ${application.loan_amount} below minimum ${this.minLoanAmount}`
      });
      status = 'rejected';
      rejectionReason = 'Loan amount below minimum threshold';
      message = `❌ Application Rejected\n\nThe requested amount of ₹${application.loan_amount.toLocaleString('en-IN')} is below our minimum loan amount of ₹${this.minLoanAmount.toLocaleString('en-IN')}.`;
      nextSteps = ['Apply for at least ₹' + this.minLoanAmount.toLocaleString('en-IN')];
      return { status, approvedAmount: 0, rejectionReason, message, nextSteps, rules };
    }

    if (application.loan_amount > this.maxLoanAmount) {
      rules.push({
        rule: 'MAX_LOAN_AMOUNT',
        passed: false,
        details: `Loan amount ${application.loan_amount} exceeds maximum ${this.maxLoanAmount}`
      });
      status = 'approved';
      approvedAmount = this.maxLoanAmount;
      message = `⚠️ Partial Approval\n\nWe can approve ₹${this.maxLoanAmount.toLocaleString('en-IN')} (maximum allowed) instead of requested ₹${application.loan_amount.toLocaleString('en-IN')}.`;
    } else {
      rules.push({ rule: 'LOAN_AMOUNT_LIMITS', passed: true });
    }

    // Rule 4: Document verification
    if (!documentsComplete) {
      rules.push({
        rule: 'DOCUMENTS_COMPLETE',
        passed: false,
        details: 'Required documents not uploaded'
      });
      status = 'documents_pending';
      message = `📄 Documents Required\n\nPlease upload the following documents:\n• PAN Card\n• Salary Slip\n• Bank Statement\n• Identity Proof`;
      nextSteps = ['Upload all required documents', 'Contact support if you need help'];
      return { status, approvedAmount: 0, rejectionReason: null, message, nextSteps, rules };
    }

    if (!allVerified) {
      rules.push({
        rule: 'DOCUMENTS_VERIFIED',
        passed: false,
        details: 'Some documents pending verification'
      });
      status = 'under_review';
      message = `🔍 Under Review\n\nYour documents are being verified. This usually takes 24-48 hours.\n\nWe'll notify you once verification is complete.`;
      nextSteps = ['Wait for document verification', 'Check back in 24 hours'];
      return { status, approvedAmount: 0, rejectionReason: null, message, nextSteps, rules };
    }
    rules.push({ rule: 'DOCUMENTS_VERIFIED', passed: true });

    // Rule 5: Risk-based decision
    if (eligibility.riskCategory === 'high') {
      rules.push({
        rule: 'RISK_ASSESSMENT',
        passed: true,
        details: 'High risk - approved with conditions'
      });
      // Reduce approved amount by 20% for high risk
      approvedAmount = Math.round(application.loan_amount * 0.8);
      message = `✅ Conditionally Approved\n\nLoan Amount: ₹${approvedAmount.toLocaleString('en-IN')} (adjusted based on risk profile)\nInterest Rate: ${eligibility.interestRate}% p.a.\nMonthly EMI: ₹${eligibility.monthlyEMI.toLocaleString('en-IN')}\nTenure: ${application.tenure_months} months\n\nNote: Due to risk profile, we've approved a conservative amount. You may need to provide additional security or a co-applicant.`;
      nextSteps = [
        'Review and accept the offer',
        'Consider adding a co-applicant',
        'Provide additional security if available'
      ];
    } else if (eligibility.riskCategory === 'medium') {
      rules.push({ rule: 'RISK_ASSESSMENT', passed: true });
      message = `✅ Loan Approved!\n\nCongratulations! Your loan has been approved.\n\nLoan Amount: ₹${approvedAmount.toLocaleString('en-IN')}\nInterest Rate: ${eligibility.interestRate}% p.a.\nMonthly EMI: ₹${eligibility.monthlyEMI.toLocaleString('en-IN')}\nTenure: ${application.tenure_months} months`;
      nextSteps = [
        'Review terms and conditions',
        'Sign loan agreement',
        'Complete final verification',
        'Funds will be disbursed within 24 hours'
      ];
    } else {
      // Low risk - best offer
      rules.push({ rule: 'RISK_ASSESSMENT', passed: true });
      message = `🎉 Loan Approved - Preferred Customer!\n\nCongratulations! You qualify for our best rates.\n\nLoan Amount: ₹${approvedAmount.toLocaleString('en-IN')}\nInterest Rate: ${eligibility.interestRate}% p.a. ⭐\nMonthly EMI: ₹${eligibility.monthlyEMI.toLocaleString('en-IN')}\nTenure: ${application.tenure_months} months\n\nYou're eligible for expedited processing!`;
      nextSteps = [
        'Review terms and conditions',
        'E-sign loan agreement',
        'Funds disbursed within 12 hours'
      ];
    }

    return { status, approvedAmount, rejectionReason, message, nextSteps, rules };
  }

  /**
   * Generate terms and conditions for approved loans
   */
  generateTermsAndConditions(application, decision) {
    const totalPayable = application.monthly_emi * application.tenure_months;
    const totalInterest = totalPayable - decision.approvedAmount;

    return {
      loanAmount: decision.approvedAmount,
      interestRate: application.interest_rate,
      tenure: application.tenure_months,
      monthlyEMI: application.monthly_emi,
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayable),
      processingFee: Math.round(decision.approvedAmount * 0.02), // 2% processing fee
      disbursementMethod: 'Direct bank transfer',
      repaymentMethod: 'Auto-debit from bank account',
      prepaymentCharges: 'Nil after 6 months, 2% before 6 months',
      latePaymentCharges: '2% per month on overdue amount',
      keyTerms: [
        'The loan is subject to approval and verification',
        'Interest rate is fixed for the entire tenure',
        'EMI due date is 5th of every month',
        'First EMI due after 30 days of disbursement',
        'Loan can be prepaid after 6 months without charges',
        'Late payment attracts penal charges',
        'NBFC reserves the right to reject/modify the application'
      ],
      documents: [
        'Signed loan agreement',
        'Post-dated cheques / NACH mandate',
        'KYC documents',
        'Income proof'
      ]
    };
  }

  /**
   * Generate loan offer letter
   */
  async generateOfferLetter(applicationId) {
    const db = await getDatabase();
    
    try {
      const application = await db.get(
        `SELECT la.*, u.name, u.email, u.phone 
         FROM loan_applications la
         JOIN users u ON la.user_id = u.id
         WHERE la.id = ?`,
        [applicationId]
      );

      if (!application || application.status !== 'approved') {
        return {
          success: false,
          message: 'Only approved applications can generate offer letters'
        };
      }

      const decision = { approvedAmount: application.approved_amount };
      const terms = this.generateTermsAndConditions(application, decision);

      const offerLetter = {
        letterNumber: `SMLOAN/${new Date().getFullYear()}/${applicationId}`,
        date: new Date().toLocaleDateString('en-IN'),
        applicantName: application.name,
        applicantEmail: application.email,
        applicantPhone: application.phone,
        loanDetails: {
          amount: application.approved_amount,
          purpose: application.loan_purpose,
          tenure: application.tenure_months,
          interestRate: application.interest_rate,
          monthlyEMI: application.monthly_emi
        },
        terms,
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'), // 15 days validity
        acceptanceRequired: true
      };

      return {
        success: true,
        offerLetter
      };

    } catch (error) {
      console.error('Offer letter generation error:', error);
      return {
        success: false,
        message: 'Failed to generate offer letter',
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
         VALUES (?, 'DecisionAgent', ?, ?, ?, ?, ?, ?)`,
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

export default DecisionAgent;

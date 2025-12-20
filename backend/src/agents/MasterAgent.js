import VerificationAgent from './VerificationAgent.js';
import UnderwritingAgent from './UnderwritingAgent.js';
import DecisionAgent from './DecisionAgent.js';
import { getDatabase } from '../utils/initDatabase.js';

class MasterAgent {
  constructor() {
    this.verificationAgent = new VerificationAgent();
    this.underwritingAgent = new UnderwritingAgent();
    this.decisionAgent = new DecisionAgent();
    this.conversationContext = new Map();
  }

  /**
   * Main entry point for all user messages
   */
  async processMessage(userId, message, applicationId = null, metadata = {}) {
    const startTime = Date.now();
    
    try {
      const db = await getDatabase();
      
      // Store user message
      await db.run(
        `INSERT INTO conversations (user_id, application_id, message, sender, agent_type)
         VALUES (?, ?, ?, 'user', 'master')`,
        [userId, applicationId, message]
      );

      // Classify intent
      const intent = this.classifyIntent(message);
      console.log(`📋 Intent classified: ${intent}`);

      // Get or create conversation context
      const context = this.getContext(userId);
      context.lastIntent = intent;
      context.lastMessage = message;

      let response;
      let agentType = 'master';

      // Route to appropriate agent based on intent
      switch (intent) {
        case 'greeting':
          response = this.handleGreeting();
          break;

        case 'document_upload':
          response = this.handleDocumentUploadGuidance();
          break;

        case 'loan_inquiry':
          response = this.handleLoanInquiry(message);
          break;

        case 'eligibility_check':
          if (!applicationId) {
            response = {
              message: "I'll help you check your loan eligibility. Could you please provide:\n\n1. Your monthly income\n2. Desired loan amount\n3. Any existing EMIs\n4. Loan tenure (in months)\n\nOr you can start a new application, and I'll guide you through the process!",
              requiresInput: true
            };
          } else {
            agentType = 'underwriting';
            response = await this.underwritingAgent.assessEligibility(applicationId);
          }
          break;

        case 'document_verification':
          agentType = 'verification';
          response = await this.verificationAgent.checkVerificationStatus(applicationId);
          break;

        case 'loan_calculation':
          response = this.handleLoanCalculation(message);
          break;

        case 'status_inquiry':
          response = await this.handleStatusInquiry(userId, applicationId);
          break;

        case 'final_decision':
          if (!applicationId) {
            response = {
              message: "I don't see an active application. Would you like to start a new loan application?",
              requiresInput: true
            };
          } else {
            agentType = 'decision';
            response = await this.decisionAgent.makeDecision(applicationId);
          }
          break;

        case 'help':
          response = this.handleHelp();
          break;

        default:
          response = this.handleGeneral(message);
      }

      // Store agent response
      await db.run(
        `INSERT INTO conversations (user_id, application_id, message, sender, agent_type, intent, metadata)
         VALUES (?, ?, ?, 'agent', ?, ?, ?)`,
        [
          userId,
          applicationId,
          typeof response === 'string' ? response : response.message,
          agentType,
          intent,
          JSON.stringify({ executionTime: Date.now() - startTime, ...metadata })
        ]
      );

      return {
        success: true,
        intent,
        agent: agentType,
        response: typeof response === 'string' ? { message: response } : response,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('❌ MasterAgent error:', error);
      return {
        success: false,
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        error: error.message
      };
    }
  }

  /**
   * Classify user intent using keyword matching and patterns
   */
  classifyIntent(message) {
    const msg = message.toLowerCase();

    // Greeting patterns
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)/.test(msg)) {
      return 'greeting';
    }

    // Document upload
    if (msg.includes('upload') || msg.includes('document') || msg.includes('submit')) {
      return 'document_upload';
    }

    // Loan inquiry
    if (msg.includes('loan') && (msg.includes('need') || msg.includes('want') || msg.includes('apply'))) {
      return 'loan_inquiry';
    }

    // Eligibility check
    if (msg.includes('eligible') || msg.includes('qualify') || msg.includes('can i get')) {
      return 'eligibility_check';
    }

    // Document verification
    if (msg.includes('verify') || msg.includes('verification') || msg.includes('document status')) {
      return 'document_verification';
    }

    // Calculation
    if (msg.includes('emi') || msg.includes('calculate') || msg.includes('interest')) {
      return 'loan_calculation';
    }

    // Status inquiry
    if (msg.includes('status') || msg.includes('application') || msg.includes('progress')) {
      return 'status_inquiry';
    }

    // Decision/Approval
    if (msg.includes('approve') || msg.includes('decision') || msg.includes('offer')) {
      return 'final_decision';
    }

    // Help
    if (msg.includes('help') || msg.includes('how') || msg.includes('what can you')) {
      return 'help';
    }

    return 'general';
  }

  handleGreeting() {
    return {
      message: "Hello! 👋 Welcome to SmartKoder Loans. I'm your AI loan assistant.\n\nI can help you with:\n• Loan applications\n• Document verification\n• Eligibility checks\n• EMI calculations\n• Application status\n\nHow can I assist you today?",
      suggestions: [
        'Apply for a loan',
        'Check eligibility',
        'Upload documents',
        'Calculate EMI'
      ]
    };
  }

  handleDocumentUploadGuidance() {
    return {
      message: "📄 For your loan application, please upload the following documents:\n\n✓ PAN Card\n✓ Latest Salary Slip\n✓ Bank Statement (last 3 months)\n✓ Identity Proof (Aadhaar/Passport/Driving License)\n\nYou can upload documents using the 'Upload Documents' section in your application.",
      requiresAction: 'document_upload'
    };
  }

  handleLoanInquiry(message) {
    return {
      message: "I'd be happy to help you with a loan! 💰\n\nTo get started, I'll need some information:\n\n1. Loan amount you need\n2. Purpose of the loan\n3. Your monthly income\n4. Employment type (Salaried/Self-employed)\n5. Preferred tenure (12-60 months)\n\nWould you like to start the application process?",
      suggestions: ['Yes, start application', 'Tell me more about loan options'],
      requiresInput: true
    };
  }

  handleLoanCalculation(message) {
    return {
      message: "I can help you calculate your EMI! 📊\n\nPlease provide:\n• Loan amount\n• Interest rate (or I can suggest based on your profile)\n• Tenure in months\n\nExample: 'Calculate EMI for ₹5,00,000 at 12% for 36 months'",
      requiresInput: true
    };
  }

  async handleStatusInquiry(userId, applicationId) {
    const db = await getDatabase();
    
    if (applicationId) {
      const app = await db.get(
        'SELECT * FROM loan_applications WHERE id = ? AND user_id = ?',
        [applicationId, userId]
      );

      if (!app) {
        return { message: "I couldn't find that application. Please check the application ID." };
      }

      return {
        message: `📋 Application Status\n\nApplication ID: ${app.id}\nLoan Amount: ₹${app.loan_amount.toLocaleString('en-IN')}\nStatus: ${app.status.toUpperCase()}\nCreated: ${new Date(app.created_at).toLocaleDateString()}\n\n${this.getStatusDescription(app.status)}`,
        applicationData: app
      };
    } else {
      const apps = await db.all(
        'SELECT * FROM loan_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
        [userId]
      );

      if (apps.length === 0) {
        return { message: "You don't have any loan applications yet. Would you like to apply for a loan?" };
      }

      return {
        message: `You have ${apps.length} application(s):\n\n` +
          apps.map(a => `• Application #${a.id}: ₹${a.loan_amount.toLocaleString('en-IN')} - ${a.status}`).join('\n'),
        applications: apps
      };
    }
  }

  getStatusDescription(status) {
    const descriptions = {
      pending: '⏳ Your application is being reviewed. We\'ll update you soon!',
      under_review: '🔍 Our team is currently reviewing your documents and details.',
      approved: '✅ Congratulations! Your loan has been approved.',
      rejected: '❌ Unfortunately, your application was not approved at this time.',
      documents_pending: '📄 Please upload the required documents to proceed.'
    };
    return descriptions[status] || 'Processing your application.';
  }

  handleHelp() {
    return {
      message: "🤖 I'm here to help! Here's what I can do:\n\n" +
        "💰 Loan Applications\n• Help you apply for a loan\n• Calculate EMIs\n• Check eligibility\n\n" +
        "📄 Documents\n• Guide you on required documents\n• Track verification status\n\n" +
        "📊 Application Management\n• Check application status\n• View loan offers\n• Answer queries\n\n" +
        "Just ask me anything!",
      suggestions: ['Apply for loan', 'Check status', 'Upload documents', 'Calculate EMI']
    };
  }

  handleGeneral(message) {
    return {
      message: "I understand you're asking about loans. Could you please be more specific? For example:\n\n" +
        "• 'I want to apply for a loan'\n" +
        "• 'Check my application status'\n" +
        "• 'Upload documents'\n" +
        "• 'Calculate EMI'\n\n" +
        "Or type 'help' to see all options.",
      requiresInput: true
    };
  }

  getContext(userId) {
    if (!this.conversationContext.has(userId)) {
      this.conversationContext.set(userId, {
        startTime: Date.now(),
        messages: [],
        currentApplication: null
      });
    }
    return this.conversationContext.get(userId);
  }

  clearContext(userId) {
    this.conversationContext.delete(userId);
  }
}

export default MasterAgent;
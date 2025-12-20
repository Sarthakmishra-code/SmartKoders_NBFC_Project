import { getDatabase } from '../utils/initDatabase.js';
import UnderwritingAgent from '../agents/UnderwritingAgent.js';
import DecisionAgent from '../agents/DecisionAgent.js';

const underwritingAgent = new UnderwritingAgent();
const decisionAgent = new DecisionAgent();

export const createApplication = async (req, res) => {
  try {
    const {
      userId,
      loanAmount,
      loanPurpose,
      tenureMonths,
      monthlyIncome,
      existingEmi = 0,
      employmentType,
      companyName
    } = req.body;

    // Validation
    if (!userId || !loanAmount || !tenureMonths || !monthlyIncome) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: userId, loanAmount, tenureMonths, monthlyIncome'
      });
    }

    const db = await getDatabase();

    const result = await db.run(
      `INSERT INTO loan_applications 
       (user_id, loan_amount, loan_purpose, tenure_months, monthly_income, existing_emi, employment_type, company_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, loanAmount, loanPurpose, tenureMonths, monthlyIncome, existingEmi, employmentType, companyName]
    );

    const application = await db.get(
      'SELECT * FROM loan_applications WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json({
      success: true,
      message: 'Loan application created successfully',
      application
    });

  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create application',
      error: error.message
    });
  }
};

export const getApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const application = await db.get(
      `SELECT la.*, u.name, u.email, u.phone 
       FROM loan_applications la
       JOIN users u ON la.user_id = u.id
       WHERE la.id = ?`,
      [id]
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get documents
    const documents = await db.all(
      'SELECT * FROM documents WHERE application_id = ?',
      [id]
    );

    // Get agent actions
    const actions = await db.all(
      'SELECT * FROM agent_actions WHERE application_id = ? ORDER BY created_at DESC LIMIT 10',
      [id]
    );

    res.json({
      success: true,
      application: {
        ...application,
        documents,
        recentActions: actions
      }
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message
    });
  }
};

export const getUserApplications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 20 } = req.query;

    const db = await getDatabase();

    let query = 'SELECT * FROM loan_applications WHERE user_id = ?';
    const params = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const applications = await db.all(query, params);

    res.json({
      success: true,
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const db = await getDatabase();

    // Build update query dynamically
    const allowedFields = [
      'loan_amount', 'loan_purpose', 'tenure_months', 
      'monthly_income', 'existing_emi', 'employment_type', 'company_name'
    ];

    const updateFields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(
      `UPDATE loan_applications SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    const application = await db.get(
      'SELECT * FROM loan_applications WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Application updated successfully',
      application
    });

  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: error.message
    });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    // Check if application exists
    const application = await db.get(
      'SELECT * FROM loan_applications WHERE id = ?',
      [id]
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Don't allow deletion of approved applications
    if (application.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete approved applications'
      });
    }

    // Delete related records
    await db.run('DELETE FROM documents WHERE application_id = ?', [id]);
    await db.run('DELETE FROM agent_actions WHERE application_id = ?', [id]);
    await db.run('DELETE FROM conversations WHERE application_id = ?', [id]);
    await db.run('DELETE FROM loan_applications WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message
    });
  }
};

export const runEligibilityCheck = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await underwritingAgent.assessEligibility(id);

    res.json(result);

  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check eligibility',
      error: error.message
    });
  }
};

export const runUnderwriting = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await underwritingAgent.performUnderwriting(id);

    res.json(result);

  } catch (error) {
    console.error('Underwriting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run underwriting',
      error: error.message
    });
  }
};

export const makeFinalDecision = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await decisionAgent.makeDecision(id);

    res.json(result);

  } catch (error) {
    console.error('Decision making error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make decision',
      error: error.message
    });
  }
};

export const getOfferLetter = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await decisionAgent.generateOfferLetter(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('Offer letter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate offer letter',
      error: error.message
    });
  }
};
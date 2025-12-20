import { getDatabase } from '../utils/initDatabase.js';

export const getAnalytics = async (req, res) => {
  try {
    const db = await getDatabase();

    // Total applications
    const totalApps = await db.get('SELECT COUNT(*) as count FROM loan_applications');

    // Status breakdown
    const statusBreakdown = await db.all(`
      SELECT status, COUNT(*) as count, AVG(loan_amount) as avg_amount
      FROM loan_applications
      GROUP BY status
    `);

    // Recent applications
    const recentApps = await db.all(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM loan_applications
      WHERE created_at >= date('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Average metrics
    const avgMetrics = await db.get(`
      SELECT 
        AVG(loan_amount) as avg_loan_amount,
        AVG(credit_score) as avg_credit_score,
        AVG(dti_ratio) as avg_dti,
        AVG(monthly_emi) as avg_emi
      FROM loan_applications
      WHERE credit_score IS NOT NULL
    `);

    res.json({
      success: true,
      analytics: {
        totalApplications: totalApps.count,
        statusBreakdown,
        recentTrend: recentApps,
        averageMetrics: avgMetrics
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const db = await getDatabase();

    let query = `
      SELECT la.*, u.name, u.email
      FROM loan_applications la
      JOIN users u ON la.user_id = u.id
    `;

    const params = [];

    if (status) {
      query += ' WHERE la.status = ?';
      params.push(status);
    }

    query += ' ORDER BY la.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const applications = await db.all(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM loan_applications';
    if (status) {
      countQuery += ' WHERE status = ?';
    }
    const total = await db.get(countQuery, status ? [status] : []);

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

export const getAgentLogs = async (req, res) => {
  try {
    const { applicationId, agentName, limit = 50 } = req.query;
    const db = await getDatabase();

    let query = 'SELECT * FROM agent_actions WHERE 1=1';
    const params = [];

    if (applicationId) {
      query += ' AND application_id = ?';
      params.push(applicationId);
    }

    if (agentName) {
      query += ' AND agent_name = ?';
      params.push(agentName);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const logs = await db.all(query, params);

    res.json({
      success: true,
      count: logs.length,
      logs
    });

  } catch (error) {
    console.error('Get agent logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent logs',
      error: error.message
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const allowedStatuses = ['pending', 'under_review', 'approved', 'rejected', 'documents_pending'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const db = await getDatabase();

    await db.run(
      `UPDATE loan_applications 
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, id]
    );

    // Log admin action
    if (notes) {
      await db.run(
        `INSERT INTO agent_actions (application_id, agent_name, action, input_data, output_data)
         VALUES (?, 'AdminOverride', 'status_update', ?, ?)`,
        [id, JSON.stringify({ status, notes }), JSON.stringify({ status })]
      );
    }

    const application = await db.get(
      'SELECT * FROM loan_applications WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Status updated successfully',
      application
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};
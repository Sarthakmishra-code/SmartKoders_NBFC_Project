import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/smartkoder.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

let db;

export const initDatabase = async () => {
  try {
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    console.log('📊 Database connection established');

    // Create tables
    await db.exec(`
      -- Users Table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Loan Applications Table
      CREATE TABLE IF NOT EXISTS loan_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        loan_amount REAL NOT NULL,
        loan_purpose TEXT,
        tenure_months INTEGER,
        monthly_income REAL,
        existing_emi REAL DEFAULT 0,
        employment_type TEXT,
        company_name TEXT,
        status TEXT DEFAULT 'pending',
        credit_score INTEGER,
        dti_ratio REAL,
        risk_category TEXT,
        approved_amount REAL,
        interest_rate REAL,
        monthly_emi REAL,
        rejection_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Documents Table
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        document_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        original_name TEXT,
        verification_status TEXT DEFAULT 'pending',
        extracted_data TEXT,
        verification_notes TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES loan_applications(id)
      );

      -- Conversations Table
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        application_id INTEGER,
        message TEXT NOT NULL,
        sender TEXT NOT NULL,
        agent_type TEXT,
        intent TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (application_id) REFERENCES loan_applications(id)
      );

      -- Agent Actions Log
      CREATE TABLE IF NOT EXISTS agent_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        agent_name TEXT NOT NULL,
        action TEXT NOT NULL,
        input_data TEXT,
        output_data TEXT,
        success BOOLEAN DEFAULT 1,
        error_message TEXT,
        execution_time_ms INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES loan_applications(id)
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_applications_user_id ON loan_applications(user_id);
      CREATE INDEX IF NOT EXISTS idx_applications_status ON loan_applications(status);
      CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_application_id ON conversations(application_id);
      CREATE INDEX IF NOT EXISTS idx_agent_actions_application_id ON agent_actions(application_id);
    `);

    console.log('✅ Database tables initialized successfully');

    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export const getDatabase = async () => {
  if (!db) {
    await initDatabase();
  }
  return db;
};

export default { initDatabase, getDatabase };
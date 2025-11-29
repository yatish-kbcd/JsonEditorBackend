// config/database.js
import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'mysql@123',
  database: process.env.DB_NAME || 'json_editor',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database and tables
export const initDatabase = async () => {
  let connection;
  try {
    console.log('🔄 Starting database initialization...');
    
    // First connect without database to create it if it doesn't exist
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;
    
    connection = await mysql.createConnection(tempConfig);
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log('✅ Database created or already exists');
    
    await connection.end();
    
    // Now connect to the specific database
    connection = await mysql.createConnection(dbConfig);
    
    // Create json_entries table
    const createJsonEntriesTable = `
      CREATE TABLE IF NOT EXISTS json_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_name (name)
      )
    `;
    
    await connection.execute(createJsonEntriesTable);
    console.log('✅ json_entries table created or already exists');
    
    // Create json_history table to track changes
    const createJsonHistoryTable = `
      CREATE TABLE IF NOT EXISTS json_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        entry_id INT NOT NULL,
        action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
        old_data JSON,
        new_data JSON,
        changes JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_entry_id (entry_id),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (entry_id) REFERENCES json_entries(id) ON DELETE CASCADE
      )
    `;
    
    await connection.execute(createJsonHistoryTable);
    console.log('✅ json_history table created or already exists');
    
    // Create or replace view for easier history querying
    const createHistoryView = `
      CREATE OR REPLACE VIEW json_history_view AS
      SELECT 
        h.id,
        h.entry_id,
        e.name as entry_name,
        h.action,
        h.old_data,
        h.new_data,
        h.changes,
        h.created_at
      FROM json_history h
      JOIN json_entries e ON h.entry_id = e.id
    `;
    
    await connection.execute(createHistoryView);
    console.log('✅ json_history_view created or replaced');
    
    console.log('🎉 Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    
    // Provide more specific error messages for common issues
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Check your database credentials in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure MySQL server is running on the specified host and port');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Database does not exist and could not be created');
    }
    
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Provide helpful error messages
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Check DB_USER and DB_PASSWORD in your .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure MySQL server is running');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Database does not exist. Set INIT_DB=true to create it');
    }
    
    return false;
  }
};

export default pool;
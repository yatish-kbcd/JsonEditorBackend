// models/jsonHistory.js
import pool from '../config/database.js';

// Create a history record
export const createHistoryRecord = async ({ entryId, action, oldData = null, newData = null, changes = null }) => {
  const query = `
    INSERT INTO json_history (entry_id, action, old_data, new_data, changes) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const [result] = await pool.execute(query, [
    entryId,
    action,
    oldData ? JSON.stringify(oldData) : null,
    newData ? JSON.stringify(newData) : null,
    changes ? JSON.stringify(changes) : null
  ]);
  
  return { 
    id: result.insertId,
    entryId, 
    action, 
    createdAt: new Date() 
  };
};

// Get history records by entry ID
export const findHistoryByEntryId = async (entryId, { limit = 50, offset = 0 } = {}) => {
  // Convert to numbers explicitly and validate
  const limitNum = Math.min(parseInt(limit) || 50, 100);
  const offsetNum = Math.max(parseInt(offset) || 0, 0);

  const query = `
    SELECT id, entry_id, action, old_data, new_data, changes, created_at
    FROM json_history
    WHERE entry_id = ?
    ORDER BY created_at DESC
    LIMIT ${offsetNum}, ${limitNum}
  `;

  const [rows] = await pool.execute(query, [entryId]);
  
  return rows.map(row => ({
    ...row,
    oldData: row.old_data ? (typeof row.old_data === 'string' ? JSON.parse(row.old_data) : row.old_data) : null,
    newData: row.new_data ? (typeof row.new_data === 'string' ? JSON.parse(row.new_data) : row.new_data) : null,
    changes: row.changes ? (typeof row.changes === 'string' ? JSON.parse(row.changes) : row.changes) : null
  }));
};

// Get all history records
export const findAllHistory = async ({ limit = 50, offset = 0 } = {}) => {
  // Convert to numbers explicitly and validate
  const limitNum = Math.min(parseInt(limit) || 50, 100);
  const offsetNum = Math.max(parseInt(offset) || 0, 0);

  const query = `
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
    ORDER BY h.created_at DESC
    LIMIT ${offsetNum}, ${limitNum}
  `;

  const [rows] = await pool.execute(query);
  
  return rows.map(row => ({
    ...row,
    oldData: row.old_data ? (typeof row.old_data === 'string' ? JSON.parse(row.old_data) : row.old_data) : null,
    newData: row.new_data ? (typeof row.new_data === 'string' ? JSON.parse(row.new_data) : row.new_data) : null,
    changes: row.changes ? (typeof row.changes === 'string' ? JSON.parse(row.changes) : row.changes) : null
  }));
};

// Get history record by ID
export const findHistoryById = async (id) => {
  const query = `
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
    WHERE h.id = ?
  `;
  
  const [rows] = await pool.execute(query, [id]);
  
  if (rows.length === 0) {
    return null;
  }
  
  const row = rows[0];
  return {
    ...row,
    oldData: row.old_data ? (typeof row.old_data === 'string' ? JSON.parse(row.old_data) : row.old_data) : null,
    newData: row.new_data ? (typeof row.new_data === 'string' ? JSON.parse(row.new_data) : row.new_data) : null,
    changes: row.changes ? (typeof row.changes === 'string' ? JSON.parse(row.changes) : row.changes) : null
  };
};

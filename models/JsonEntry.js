// models/jsonEntry.js
import pool from '../config/database.js';
import { createHistoryRecord, safeJsonStringify } from './JsonHistory.js';

// Calculate differences between two JSON objects
export const calculateChanges = (oldData, newData) => {
  const changes = {
    added: [],
    removed: [],
    modified: []
  };

  const findDifferences = (obj1, obj2, path = '') => {
    if (obj1 === obj2) return;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
      if (obj1 !== obj2) {
        changes.modified.push(path || 'root');
      }
      return;
    }

    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    allKeys.forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;

      if (!(key in obj1)) {
        changes.added.push(currentPath);
      } else if (!(key in obj2)) {
        changes.removed.push(currentPath);
      } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && obj1[key] !== null && obj2[key] !== null) {
          findDifferences(obj1[key], obj2[key], currentPath);
        } else {
          changes.modified.push(currentPath);
        }
      }
    });
  };

  findDifferences(oldData, newData);
  return changes;
};

// Create a new JSON entry
export const createJsonEntry = async ({ name, data }) => {
  const query = `
    INSERT INTO json_entries (name, data) 
    VALUES (?, ?)
  `;
  
  const [result] = await pool.execute(query, [name, safeJsonStringify(data)]);
  const id = result.insertId;
  
  // Log history
  await createHistoryRecord({
    entryId: id,
    action: 'CREATE',
    newData: data
  });
  
  // Fetch the complete entry to return
  const entry = await findJsonEntryById(id);
  return entry;
};

// Get all JSON entries
export const findAllJsonEntries = async ({ limit = 50, offset = 0 } = {}) => {
  // Convert to numbers explicitly and validate
  const limitNum = Math.min(parseInt(limit) || 50, 100); // Max 100 records
  const offsetNum = Math.max(parseInt(offset) || 0, 0); // Min 0

  const query = `
    SELECT id, name, data, created_at, updated_at
    FROM json_entries
    ORDER BY created_at DESC
    LIMIT ${offsetNum}, ${limitNum}
  `;

  const [rows] = await pool.execute(query);
  
  return rows.map(row => ({
    ...row,
    data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data
  }));
};

// Get JSON entry by ID
export const findJsonEntryById = async (id) => {
  const query = 'SELECT id, name, data, created_at, updated_at FROM json_entries WHERE id = ?';
  const [rows] = await pool.execute(query, [id]);
  
  if (rows.length === 0) {
    return null;
  }
  
  const row = rows[0];
  return {
    ...row,
    data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data
  };
};

// Update JSON entry
export const updateJsonEntry = async (id, { name, data }) => {
  // Get old data for history
  const oldEntry = await findJsonEntryById(id);

  // Build dynamic update query based on provided fields
  const updates = [];
  const params = [];

  if (name !== undefined) {
    updates.push('name = ?');
    params.push(name);
  }

  updates.push('data = ?');
  params.push(safeJsonStringify(data));

  updates.push('updated_at = CURRENT_TIMESTAMP');

  const query = `
    UPDATE json_entries
    SET ${updates.join(', ')}
    WHERE id = ?
  `;

  params.push(id);

  const [result] = await pool.execute(query, params);

  if (result.affectedRows === 0) {
    throw new Error('Entry not found');
  }

  // Calculate changes for history
  const changes = calculateChanges(oldEntry.data, data);

  // Log history
  await createHistoryRecord({
    entryId: id,
    action: 'UPDATE',
    oldData: oldEntry.data,
    newData: data,
    changes
  });

  // Fetch the updated entry to return
  const updatedEntry = await findJsonEntryById(id);
  return updatedEntry;
};

// Delete JSON entry
export const deleteJsonEntry = async (id) => {
  // Get data for history before deletion
  const oldEntry = await findJsonEntryById(id);

  if (!oldEntry) {
    throw new Error('Entry not found');
  }

  // Log history BEFORE deletion to avoid foreign key constraint issues
  await createHistoryRecord({
    entryId: id,
    action: 'DELETE',
    oldData: oldEntry.data
  });

  // Now delete the entry
  const query = 'DELETE FROM json_entries WHERE id = ?';
  const [result] = await pool.execute(query, [id]);

  return {
    message: 'Entry deleted successfully',
    deletedId: id
  };
};

// services/jsonService.js
import {
  createJsonEntry,
  findAllJsonEntries,
  findJsonEntryById,
  updateJsonEntry,
  deleteJsonEntry
} from '../models/JsonEntry.js';

import {
  findHistoryByEntryId,
  findAllHistory
} from '../models/JsonHistory.js';

// Save JSON data
export const saveJsonData = async (data, name = null) => {
  try {
    const entry = await createJsonEntry({ 
      name: name || `JSON_${new Date().toISOString().replace(/[:.]/g, '-')}`,
      data 
    });
    return entry;
  } catch (error) {
    throw new Error(`Failed to save JSON: ${error.message}`);
  }
};

// Get all JSON entries
export const getAllJsonEntries = async (options = {}) => {
  try {
    const entries = await findAllJsonEntries(options);
    return entries;
  } catch (error) {
    throw new Error(`Failed to fetch entries: ${error.message}`);
  }
};

// Get JSON entry by ID
export const getJsonEntryById = async (id) => {
  try {
    const entry = await findJsonEntryById(id);
    if (!entry) {
      throw new Error('Entry not found');
    }
    return entry;
  } catch (error) {
    throw new Error(`Failed to fetch entry: ${error.message}`);
  }
};

// Update JSON entry
export const updateJsonEntryById = async (id, data, name = null) => {
  try {
    const entry = await updateJsonEntry(id, { 
      name: name || undefined, 
      data 
    });
    return entry;
  } catch (error) {
    throw new Error(`Failed to update entry: ${error.message}`);
  }
};

// Delete JSON entry
export const deleteJsonEntryById = async (id) => {
  try {
    const result = await deleteJsonEntry(id);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete entry: ${error.message}`);
  }
};

// Get entry history
export const getEntryHistory = async (entryId, options = {}) => {
  try {
    const history = await findHistoryByEntryId(entryId, options);
    return history;
  } catch (error) {
    throw new Error(`Failed to fetch entry history: ${error.message}`);
  }
};

// Get all history
export const getAllHistory = async (options = {}) => {
  try {
    const history = await findAllHistory(options);
    return history;
  } catch (error) {
    throw new Error(`Failed to fetch history: ${error.message}`);
  }
};
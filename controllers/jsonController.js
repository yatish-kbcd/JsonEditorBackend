// controllers/jsonController.js
import {
  saveJsonData,
  getAllJsonEntries,
  getJsonEntryById,
  updateJsonEntryById,
  deleteJsonEntryById,
  getEntryHistory,
  getAllHistory
} from '../services/jsonService.js';

// Save new JSON entry
export const saveJson = async (req, res, next) => {
  try {
    const { data, name } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'JSON data is required'
      });
    }

    const entry = await saveJsonData(data, name);
    
    res.status(201).json({
      success: true,
      message: 'JSON saved successfully',
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

// Get all JSON entries
export const getAllEntries = async (req, res, next) => {
  try {
    let { limit = 50, offset = 0 } = req.query;
    
    // Validate and sanitize inputs
    limit = Math.min(parseInt(limit) || 50, 100); // Max 100 records
    offset = Math.max(parseInt(offset) || 0, 0); // Minimum 0
    
    const entries = await getAllJsonEntries({
      limit,
      offset
    });
    
    res.json({
      success: true,
      data: entries,
      pagination: {
        limit,
        offset,
        total: entries.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get specific JSON entry
export const getEntryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const entry = await getJsonEntryById(id);
    
    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

// Update JSON entry
export const updateEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, name } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'JSON data is required for update'
      });
    }

    const entry = await updateJsonEntryById(id, data, name);
    
    res.json({
      success: true,
      message: 'JSON updated successfully',
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

// Delete JSON entry
export const deleteEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await deleteJsonEntryById(id);
    
    res.json({
      success: true,
      message: 'JSON entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get history for specific entry
export const getEntryHistoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const history = await getEntryHistory(id, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: history,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: history.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all history
export const getAllHistoryRecords = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const history = await getAllHistory({
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: history,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: history.length
      }
    });
  } catch (error) {
    next(error);
  }
};
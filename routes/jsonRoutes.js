// routes/jsonRoutes.js
import express from 'express';
import {
  saveJson,
  getAllEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  getEntryHistoryById,
  getAllHistoryRecords
} from '../controllers/jsonController.js';

const router = express.Router();

// JSON Entries routes
router.post('/json', saveJson);
router.get('/json', getAllEntries);
router.get('/json/:id', getEntryById);
router.put('/json/:id', updateEntry);
router.delete('/json/:id', deleteEntry);

// History routes
router.get('/json/:id/history', getEntryHistoryById);
router.get('/history', getAllHistoryRecords);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'JSON Editor API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
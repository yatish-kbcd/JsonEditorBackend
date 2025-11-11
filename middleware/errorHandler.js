// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Entry already exists'
    });
  }

  // MySQL foreign key constraint error
  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(404).json({
      success: false,
      message: 'Referenced entry not found'
    });
  }

  // Validation errors
  if (err.message.includes('required') || err.message.includes('invalid')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Not found errors
  if (err.message.includes('not found')) {
    return res.status(404).json({
      success: false,
      message: err.message
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};
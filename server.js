// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jsonRoutes from './routes/jsonRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { testConnection, initDatabase } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Routes
app.use('/api', jsonRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize and start server
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Initialize database tables (optional - run manually if needed)
    if (process.env.INIT_DB === 'true') {
      console.log('Initializing database...');
      await initDatabase();
    }

    app.listen(PORT, () => {
      console.log(`🚀 JSON Editor API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`💾 Database: ${process.env.DB_NAME || 'json_editor'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server terminated');
  process.exit(0);
});

startServer();
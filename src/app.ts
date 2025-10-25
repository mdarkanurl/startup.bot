import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { CustomError } from "./utils/custom-error";
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router
// app.use('/api', apiRouter);

// Health check
app.get('/api/health', async (req: Request, res: Response) => {
  let dbStatus = 'Unknown';

  switch (mongoose.connection.readyState) {
    case 0:
      dbStatus = 'Disconnected';
      break;
    case 1:
      dbStatus = 'Connected';
      break;
    case 2:
      dbStatus = 'Connecting';
      break;
    case 3:
      dbStatus = 'Disconnecting';
      break;
    default:
      dbStatus = 'Unknown';
  }

  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to AI bot Backend API',
    version: '1.0.0',
    database: 'PostgreSQL, MongoDB',
    endpoints: {
      health: '/api/health'
    }
  });
});

// Error handling
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).json({
    Success: false,
    Message: err.message,
    Data: null,
    Errors: null
  });
});

export default app;
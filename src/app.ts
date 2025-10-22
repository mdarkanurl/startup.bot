import express, { NextFunction, Request, Response } from "express";
import { MongoDB } from "./database";
import mongoose from "mongoose";
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router
// app.use('/api', apiRouter);

// Health check
app.get('/api/health', async (req: Request, res: Response) => {
  let dbStatus = 'Disconnected';
  try {
    mongoose.connection.on("connected", () => dbStatus = "connected");
    dbStatus = 'Connected';
  } catch (error) {
    console.error('Database connection error:', error);
    dbStatus = 'Disconnected';
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
    message: 'Welcome to Express contests Backend API',
    version: '1.0.0',
    database: 'PostgreSQL',
    endpoints: {
      health: '/api/health',
      contests: '/api/v1/contests',
      participants: '/api/v1/participants',
      submissions_contests: '/api/v1/submissions/contests'
    }
  });
});

// Error handling
// app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
//   res.status(err.statusCode || 500).json({
//     Success: false,
//     Message: err.message,
//     Data: null,
//     Errors: null
//   });
// });

export default app;
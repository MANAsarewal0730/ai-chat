/**
 * ============================================================================
 * AI Study Assistant - Express Backend Server
 * ============================================================================
 * 
 * Technology Stack:
 * - Express.js: REST API routing & middleware
 * - LangChain.js: Chat models, PromptTemplates, TextSplitters, VectorStores
 * - dotenv: Environment variable loading
 * - cors: Cross-Origin Resource Sharing for React frontend
 * - multer & pdf-parse: Document upload and text extraction
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import route modules
import chatRoutes from './routes/chat.js';
import explainRoutes from './routes/explain.js';
import quizRoutes from './routes/quiz.js';
import summarizeRoutes from './routes/summarize.js';
import ragRoutes from './routes/rag.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server (and all origins for dev simplicity)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-provider']
}));

// Body parsing middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Request logger for easy debugging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'AI Study Assistant Backend',
    version: '1.0.0',
    providersConfigured: {
      gemini: !!process.env.GEMINI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY
    },
    defaultProvider: process.env.DEFAULT_PROVIDER || 'gemini'
  });
});

// Mount LangChain Feature Routes
app.use('/api/chat', chatRoutes);
app.use('/api/explain', explainRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/summarize', summarizeRoutes);
app.use('/api/rag', ragRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found on AI Study Assistant backend.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  AI Study Assistant Backend running on port ${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});



const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const mealRoutes = require('./routes/meal.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');

const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const { initializeGemini } = require('./config/gemini');
const { initializeFirebase } = require('./config/firebase');
const { initializeScheduler } = require('./services/scheduler.service');

const app = express();


app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
  credentials: true,
}));


app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}


const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development';
  },
});

app.use('/api', generalLimiter);


app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});


app.get('/ping', (req, res) => {
  console.log('Ping received at /ping');
  res.set('Cache-Control', 'no-store');
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/admin', adminRoutes);


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Calorie Tracker API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});


app.use(notFoundHandler);

app.use(errorHandler);


initializeGemini();

initializeFirebase();

initializeScheduler();

module.exports = app;

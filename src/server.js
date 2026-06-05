import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { securityLogger } from './middleware/securityLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/auth.js';
import { notesRoutes } from './routes/notes.js';
import { logger } from './utils/logger.js';
import { intrusionDetector } from './middleware/intrusionDetector.js';
import { adminRoutes } from './routes/admin.js';

const app = express();
const PORT = 3000;

// Layer 1: Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Layer 2: CORS Hardening
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  maxAge: 600,
}));

// Layer 3: Body Size Limiting
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Layer 4: Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);
// Intrusion Detection

// Layer 5: Security Event Logger
app.use(securityLogger);

// Routes
app.use('/admin', adminRoutes);

app.use(intrusionDetector);

app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Layer 6: Error Sanitization
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Secure Vault API started');
});
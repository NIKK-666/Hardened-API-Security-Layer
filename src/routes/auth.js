import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { findUserByEmail, createUser } from '../utils/store.js';
import { JWT_SECRET } from '../middleware/authenticate.js';
import { logger } from '../utils/logger.js';

export const authRoutes = Router();

// Strict rate limit for auth endpoints (5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

authRoutes.use(authLimiter);

// Registration schema: strict email + complex password
const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(12).max(72).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
    'Password must contain uppercase, lowercase, number, and special character'
  ),
});

// Login schema: valid email + any non-empty password
const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(72),
});
// POST /auth/register
authRoutes.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password } = req.body;

  if (findUserByEmail(email)) {
    // Use same response for "exists" and "created" to prevent user enumeration
    return res.status(201).json({ message: 'Registration successful.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = createUser(email, passwordHash);

  logger.info({ event: 'user_registered', userId: user.id }, 'New user registered');
  res.status(201).json({ message: 'Registration successful.' });
});

// POST /auth/login
authRoutes.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);

  // Uniform error message prevents user enumeration
  if (!user) {
    logger.warn({ event: 'login_failed', email, ip: req.ip }, 'Login failed - user not found');
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    logger.warn({ event: 'login_failed', email, ip: req.ip }, 'Login failed - wrong password');
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

  logger.info({ event: 'login_success', userId: user.id }, 'User logged in');
  res.json({ token, expiresIn: 3600 });
});
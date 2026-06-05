import { Router } from 'express';
import { getBlockedIps } from '../middleware/intrusionDetector.js';

export const adminRoutes = Router();

const ADMIN_TOKEN = 'supersecret-admin-token-replace-in-production';

adminRoutes.use((req, res, next) => {
  const token = req.get('x-admin-token');
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  next();
});

adminRoutes.get('/blocked-ips', (req, res) => {
  res.json({ blockedIps: getBlockedIps() });
});
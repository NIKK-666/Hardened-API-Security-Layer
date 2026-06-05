import { logger } from '../utils/logger.js';

const ipEvents = new Map();
const WINDOW_MS = 5 * 60 * 1000;
const THRESHOLD = 3;
const blockedIps = new Set();

export function recordSecurityEvent(ip) {
  const now = Date.now();
  if (!ipEvents.has(ip)) {
    ipEvents.set(ip, []);
  }

  const events = ipEvents.get(ip);
  events.push(now);

  // Remove events outside the sliding window
  const cutoff = now - WINDOW_MS;
  while (events.length > 0 && events[0] < cutoff) {
    events.shift();
  }

  if (events.length > THRESHOLD) {
    blockedIps.add(ip);
    logger.warn({ event: 'ip_blocked', ip, eventCount: events.length }, 'IP auto-blocked by intrusion detector');
  }
}

export function intrusionDetector(req, res, next) {
  const ip = req.ip;

  if (blockedIps.has(ip)) {
    logger.warn({ event: 'blocked_ip_attempt', ip, path: req.path }, 'Blocked IP attempted access');
    return res.status(403).json({ error: 'Forbidden.' });
  }

  // Hook into response to detect security events
  res.on('finish', () => {
    if ([400, 401, 403, 429].includes(res.statusCode)) {
      recordSecurityEvent(ip);
    }
  });

  next();
}

export function getBlockedIps() {
  return Array.from(blockedIps);
}
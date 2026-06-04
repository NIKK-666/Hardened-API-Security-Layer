import express from 'express';
import { logger } from './utils/logger.js';
import { authRoutes } from './routes/auth.js';
import { notesRoutes } from './routes/notes.js';
import helmet from 'helmet';
import cors from 'cors';
import {rateLimit} from 'express-rate-limit';

const app = express(); // Create an Express application instance
app.use(helmet()); // Apply security headers to all responses
app.use(cors()); // Enable CORS for all routes (you can configure this further for specific origins and methods)
const PORT = 3000; // You can change this to any port you prefer

//Layer 1 : Security Headers
app.use(helmet({ // Configure Content Security Policy (CSP) to mitigate XSS attacks
    contentSecurityPolicy: { // Define the CSP directives to restrict resource loading
        directives: { 
            defaultSrc: ["'self'"], // Allow resources only from the same origin
            scriptSrc: ["'self'"], // Allow scripts only from the same origin
            styleSrc: ["'self'"], // Allow styles only from the same origin
            imgSrc: ["'self'"], //  Allow images only from the same origin
            connectSrc: ["'self'"], // Allow AJAX requests only to the same origin
            fontSrc: ["'self'"], // Allow fonts only from the same origin
            objectSrc: ["'none'"], // Disallow all plugins and Flash content
            frameAncestors: ["'none'"], // Disallow embedding the site in iframes to prevent clickjacking
            upgradeInsecureRequests: [], // Automatically upgrade HTTP requests to HTTPS
        },
    },
    hsts: { // HTTP Strict Transport Security
        maxAge: 63072000, // 2 years
        includeSubDomains: true, // Apply to all subdomains
        preload: true, // Allow inclusion in browser preload lists
    },

}));

// layer 2 : CORS Hardening
app.use(cors({
    origin: ['http://localhost:3000'], // Only allow requests from this origin
    methods: ['GET', 'POST' , 'PUT', 'DELETE'], // Only allow GET and POST requests
    credentials: true, // Allow cookies to be sent with requests
    maxAge: 600, // Cache preflight response for 10 minutes
}));

// Layer 3 : Body Size Limiting
app.use(express.json({ limit: '10kb' })); // Limit JSON body to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Limit URL-encoded body to 10kb


// Layer 4: Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter); // Apply to all requests
// Routes
app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);


app.get('/health', (req, res) => { // Health check endpoint to monitor server status
    res.json({ status: 'ok' ,timestamp: new Date().toISOString()  // Include timestamp in the response for better monitoring
});
});

app.listen(PORT, () => { // Start the server and listen on the specified port
    logger.info({ port: PORT }, 'Secure Vault API started'); // Log the port number when the server starts
});
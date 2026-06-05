import jwt from 'jsonwebtoken';

export const JWT_SECRET = 'secret-key'; // In production, use a secure environment variable for the secret key

export function authenticate(req, res, next) {
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    try {
        const payload = jwt.verify(token, JWT_SECRET); // Verify the JWT token using the secret key
        req.user = { id: payload.sub, email: payload.email }; // Attach the user ID and email from the token payload to the request object for downstream use
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' }); // If token verification fails, return a 401 Unauthorized response
    }
}

   // Export the JWT_SECRET for use in other modules, such as auth.js
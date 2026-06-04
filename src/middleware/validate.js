export function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body); // Validate the request body against the provided schema using safeParse to avoid throwing exceptions
        if (!result.success) { // If validation fails, return a 400 Bad Request response with error details
            return res.status(400).json({
                error: 'Validation failed', 
                details: result.error.errors });
        }

        req.body = result.data; // If validation succeeds, replace the request body with the validated data
        next(); // Proceed to the next middleware or route handler
    };
}   
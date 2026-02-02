/**
 * Simple in-memory rate limiter for serverless functions
 * Limits submissions by IP address
 */

// Store: { ip: [timestamp1, timestamp2, ...] }
const requestStore = new Map();

/**
 * Check if IP has exceeded rate limit
 * @param {string} ip - IP address
 * @param {number} maxRequests - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - true if rate limit exceeded
 */
function isRateLimited(ip, maxRequests = 3, windowMs = 600000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this IP
    let requests = requestStore.get(ip) || [];

    // Filter out old requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (requests.length >= maxRequests) {
        return true; // Rate limited
    }

    // Add current request
    requests.push(now);
    requestStore.set(ip, requests);

    // Cleanup old entries periodically (every 100 requests)
    if (Math.random() < 0.01) {
        cleanupOldEntries(windowMs);
    }

    return false; // Not rate limited
}

/**
 * Clean up old entries from the store
 */
function cleanupOldEntries(windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;

    for (const [ip, requests] of requestStore.entries()) {
        const validRequests = requests.filter(timestamp => timestamp > windowStart);

        if (validRequests.length === 0) {
            requestStore.delete(ip);
        } else {
            requestStore.set(ip, validRequests);
        }
    }
}

/**
 * Get client IP from request
 * Works with Vercel's forwarded headers
 */
function getClientIP(req) {
    return (
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        'unknown'
    );
}

module.exports = {
    isRateLimited,
    getClientIP
};

// In-memory rate limiter for login attempts
// For production, use Redis or similar

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 60 * 1000); // Clean up every minute

/**
 * Rate limiter for authentication attempts
 * @param identifier - IP address or user identifier
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns { allowed: boolean, remainingAttempts: number, resetInSeconds: number }
 */
export function checkRateLimit(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remainingAttempts: number; resetInSeconds: number } {
    const now = Date.now();
    const record = store[identifier];

    if (!record || record.resetTime < now) {
        // First attempt or window expired
        store[identifier] = {
            count: 1,
            resetTime: now + windowMs,
        };
        return {
            allowed: true,
            remainingAttempts: maxAttempts - 1,
            resetInSeconds: Math.ceil(windowMs / 1000),
        };
    }

    if (record.count >= maxAttempts) {
        // Rate limit exceeded
        return {
            allowed: false,
            remainingAttempts: 0,
            resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
        };
    }

    // Increment counter
    record.count++;

    return {
        allowed: true,
        remainingAttempts: maxAttempts - record.count,
        resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
    };
}

/**
 * Get client IP from request headers
 */
export function getClientIp(headers: Headers): string {
    // Check forwarded header (for proxied requests)
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    // Check real IP header
    const realIp = headers.get("x-real-ip");
    if (realIp) {
        return realIp;
    }

    // Fallback to unknown
    return "unknown";
}
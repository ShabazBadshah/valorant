const rateLimit = require('express-rate-limit');

const httpStatus = require('../utils/http-status-code.js');

/**
 * Allows a maximum number of requests to the server from a client within a certain timeframe.
 *
 * @example
 * Only allow 10 requests per minute: rateLimiter(60000, 10)
 *
 * @param {number} maxRequestWindowMs - The length of the rate limiting time window in milliseconds.
 * @param {number} maxRequestsAllowedPerWindow - The maximum amount of requests that can be made within the time window.
 * @param {Function} onMaxRequestsExceeded - Function that will run when.
 * @returns {void}
 */
const rateLimiter = (maxRequestWindowMs = 1000, maxRequestsAllowedPerWindow = 200, onMaxRequestsExceeded) =>
  new rateLimit({
    windowMs: maxRequestWindowMs,
    max: maxRequestsAllowedPerWindow,
    skipFailedRequests: true,
    headers: true,
    /**
     * Executes when the MAX_REQUESTS_PER_WINDOW is exceeded by calling the onMaxRequestExceeded function provided to rateLimiter object.
     *
     * @param {Request} req - The express request object that is being recieved from the client.
     * @param {Response} res - The express response object that will be sent back to the client.
     * @param {Function} [next] - Calls the next middleware in the middleware stack.
     * @returns {void}
     */
    handler: (req, res, next) => {
      res.status(httpStatus.CLIENT_TOO_MANY_REQUESTS);
      onMaxRequestsExceeded(req, res, next);
    }
  });

module.exports = rateLimiter;
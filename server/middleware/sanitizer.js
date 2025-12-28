import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import helmet from 'helmet';

// Middleware để sanitize dữ liệu
const sanitizeInput = mongoSanitize();

// Middleware để clean XSS
const cleanXSS = xss();

// Security headers
const securityHeaders = helmet();

export { sanitizeInput, cleanXSS, securityHeaders };

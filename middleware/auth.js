const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get the token from the HttpOnly cookie
  // // const token = req.cookies.authToken;
  // // if (!token) {
  // //   return res.status(401).json({ error: 'No token provided, authorization denied.' });
  // // }
  // const token = req.headers['authorization']?.split(' ')[1]; // Extract the token
  // if (!token) return res.status(401).json({ message: 'No token provided, authorization denied.' });

  // Option 1: Using Cookies
  const cookieToken = req.cookies.authToken;

  // Option 2: Using Bearer Token
  const bearerToken = req.headers['authorization']?.split(' ')[1];

  // Check for token in cookies first, then check the Bearer token
  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied.' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user (including the role) to the request object
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    // Check if the error is related to token expiration
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    
    // Handle other errors (e.g., invalid token)
    return res.status(400).json({ error: 'Invalid token.' });
  }
};


module.exports = authMiddleware;

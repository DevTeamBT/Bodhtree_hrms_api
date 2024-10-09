const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get the token from the HttpOnly cookie
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: 'No token provided, authorization denied.' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user (including the role) to the request object
    req.user = decoded;
    next(); // next middleware or route handler
  } catch (err) {
    return res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = authMiddleware;

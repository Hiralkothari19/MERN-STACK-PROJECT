// auth.middleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get user info from request (assuming it's sent in the headers)
    const userId = req.headers['user-id'];
    const userName = req.headers['user-name'];
    
    // Check if user info exists
    if (!userId || !userName) {
      return res.status(401).json({ 
        status: "Error", 
        message: "Authentication required. Please log in to create a survey." 
      });
    }
    
    // Attach user info to request for later use
    req.user = { id: userId, name: userName };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ 
      status: "Error", 
      message: "Authentication failed. Please log in again." 
    });
  }
};

module.exports = authMiddleware;
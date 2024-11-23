const jwt = require("jsonwebtoken");

const authmiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", ""); // Extract token from header
  
  if (!token) {
    return res.status(401).send({ message: "Access denied, no token provided" });
  }
  
  try {
    // Decode token and add user data to request object
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // This will add `user` (containing `id`) to the request object
    next();
  } catch (error) {
    return res.status(400).send({ message: "Invalid token" });
  }
};

module.exports = authmiddleware;

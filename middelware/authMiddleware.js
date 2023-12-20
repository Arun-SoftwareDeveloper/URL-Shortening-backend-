const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing." });
  }

  try {
    const decodedToken = jwt.verify(token.split(" ")[1], "your-secret-key");

    req.user = { username: decodedToken.username };

    // Check token expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < currentTime) {
      // Token has expired, generate a new token and send it back
      const newToken = jwt.sign(
        { username: decodedToken.username },
        "your-secret-key",
        {
          expiresIn: "24hr", // You can adjust the expiration time
        }
      );

      // Send the new token in the response
      res.setHeader("New-Token", newToken);
    }

    next();
  } catch (err) {
    console.error("Error verifying token:", err);
    res.status(401).json({ message: "Invalid authorization token." });
  }
};

module.exports = authMiddleware;

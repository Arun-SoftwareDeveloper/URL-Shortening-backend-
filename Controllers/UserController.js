const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");
const crypto = require("crypto");

// const generateSecretKey = () => {
//   const byteLength = 32; // 256 bits
//   return crypto.randomBytes(byteLength).toString("hex");
// };

const secretKey = "arun123";
console.log("Generated Secret Key:", secretKey);

function generateRandomString(length) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

const generateToken = (data, expiresIn) => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const tokenLength = 6; // Always generate a 6-character token for reset
  let token = "";
  for (let i = 0; i < tokenLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    token += chars[randomIndex];
  }
  return jwt.sign({ data }, secretKey, { expiresIn: "1hr" });
};

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "arunramasamy46@gmail.com", // Replace with your Gmail email address
    pass: "pruxtxnekznczdpc", // Replace with your Gmail password
  },
});

const UserController = {
  register: async (req, res) => {
    try {
      const { email, firstName, lastName, password, activationToken } =
        req.body;
      console.log("Registering user with email:", email);

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("User already exists with email:", email);
        return res.status(402).json({ message: "Email already Registered!!!" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        activationToken: secretKey,
      });

      await newUser.save();

      const mailOptions = {
        from: "arunramasamy46@gmail.com", // Replace with your Gmail email address
        to: email,
        subject: "Account Activation",
        html: `
        <p>Hello ${firstName},</p>
        <p>Thank you for registering on our website. Please click the following link to activate your account:</p>
        <a href="https://lucky-entremet-b7a31f.netlify.app//activateAccount?token=${activationToken}">Activate Account</a>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(activationToken);
      res.json({
        message:
          "Registration successful. Please check your email to activate your account.",
      });
    } catch (err) {
      console.error("Error registering user:", err);
      res.status(500).json({ message: "Error registering user." });
    }
  },

  activateAccount: async (req, res) => {
    try {
      const activationToken = req.query.token;

      if (!activationToken) {
        return res.status(400).json({ message: "Missing activation token." });
      }
      console.log(activationToken);

      jwt.verify(activationToken, secretKey, async (error, decodedToken) => {
        console.log(error);
        if (error) {
          return res.status(400).json({ message: "Invalid activation link." });
        }

        console.log(decodedToken);
        const userId = decodedToken.data;
        const user = await User.findById(userId);

        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        if (user.isActive) {
          return res.status(200).json({
            message: "Account is already activated. You can now log in.",
          });
        }

        user.isActive = true;
        await user.save();

        return res.status(200).json({
          message: "Account activated successfully. You can now log in.",
        });
      });
    } catch (error) {
      console.error("Error activating account:", error);
      res.status(500).json({ message: "Error activating account." });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User not found!!!" });
      }
      if (!user.isActive) {
        return res.status(403).json({
          message:
            "Account is inactive. Please activate your account by clicking on the activation link sent to your email.",
        });
      }

      const passwordIsMatch = await bcrypt.compare(password, user.password);
      if (!passwordIsMatch) {
        return res.status(404).json({ message: "Invalid Password!!!" });
      }

      const token = generateToken();
      return res.status(200).json({ token });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ message: "Internal server error" });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User not found!!!" });
      }

      // Generate a reset token with a longer expiration time (e.g., 24 hours)
      const resetToken = generateRandomString(6);

      // Save the reset token to the user's document in the database
      user.resetToken = resetToken;
      await user.save();

      // Send the reset password email
      const mailOptions = {
        from: "arunramasamy46@gmail.com", // Replace with your Gmail email address
        to: email,
        subject: "Password Reset",
        html: `
        <p>Hello ${user.firstName},</p>
        <p>You have requested to reset your password. Please click the following link to reset your password:</p>
        <a href="https://lucky-entremet-b7a31f.netlify.app/resetPassword">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
        resettoken:${resetToken}
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({
        message: "Password reset email sent. Please check your email.",
      });
    } catch (err) {
      console.error("Error sending password reset email:", err);
      res.status(500).json({ message: "Error sending password reset email." });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, resetToken, newPassword } = req.body;

      // Generate a random 6-character string
      const randomString = generateRandomString(6);
      console.log(randomString);
      // Use the randomString as the reset token (instead of JWT)
      const user = await User.findOneAndUpdate(
        { email },
        { resetToken },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Set the new password and the generated random token in the database
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetToken = randomString;
      await user.save();

      return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Error resetting password." });
    }
  },
};

module.exports = UserController;

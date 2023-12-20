const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  resetToken: { type: String, default: null },
  activationToken: { type: String, default: null },
  isActive: { type: Boolean, default: null },
  resetTokenExpiry: { type: Date, default: null },
});

const UserModel = mongoose.model("UserModel", UserSchema);

module.exports = UserModel;

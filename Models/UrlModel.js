const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  longURL: { type: String, required: true },
  shortURL: { type: String, required: true, unique: true },
  creationDate: { type: Date, default: Date.now },
});

const URL = mongoose.model("URL", urlSchema);

const dashboardSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  count: { type: Number, required: true },
});

const Dashboard = mongoose.model("Dashboard", dashboardSchema);

module.exports = { URL, Dashboard };

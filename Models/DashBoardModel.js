const mongoose = require("mongoose");

const dashboardSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  count: { type: Number, required: true },
});

const Dashboard = mongoose.model("Dashboard", dashboardSchema);

module.exports = Dashboard;

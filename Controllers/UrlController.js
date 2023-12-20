const { URL, Dashboard } = require("../Models/UrlModel");
const crypto = require("crypto");

const controllers = {
  createURL: async (req, res) => {
    try {
      const { longURL } = req.body;

      // Generate a short URL (example)
      const shortURL = crypto
        .createHash("md5")
        .update(longURL)
        .digest("hex")
        .substr(0, 8);

      const newURL = new URL({ longURL, shortURL });
      await newURL.save();

      // Update the dashboard count
      const dashboardEntry = await Dashboard.findOne({
        date: { $gte: new Date().setHours(0, 0, 0, 0) },
      });
      if (dashboardEntry) {
        dashboardEntry.count += 1;
        await dashboardEntry.save();
      } else {
        const dashboard = new Dashboard({
          date: new Date().setHours(0, 0, 0, 0),
          count: 1,
        });
        await dashboard.save();
      }

      return res.status(201).json({ shortURL });
    } catch (error) {
      console.error("Error creating short URL:", error);
      return res.status(500).json({ error: "An error occurred" });
    }
  },

  getURLs: async (req, res) => {
    try {
      const urls = await URL.find().sort({ creationDate: -1 });
      return res.json(urls);
    } catch (error) {
      console.error("Error fetching URLs:", error);
      return res.status(500).json({ error: "An error occurred" });
    }
  },

  deleteURL: async (req, res) => {
    try {
      const { id } = req.params;
      await URL.findByIdAndDelete(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting URL:", error);
      return res.status(500).json({ error: "An error occurred" });
    }
  },

  getDashboardData: async (req, res) => {
    try {
      // ... (existing code for dashboard data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return res.status(500).json({ error: "An error occurred" });
    }
  },
};

module.exports = controllers;

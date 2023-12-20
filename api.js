const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const Port = 4000;
const dbUrl =
  "mongodb+srv://arunramasamy46:arunramasamy46@cluster0.weiyl36.mongodb.net/?retryWrites=true&w=majority";
const UserRoutes = require("./Routes/UserRoutes");
const UrlRoutes = require("./Routes/UrlRoutes");
mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB Connected!!!");
  })
  .catch((err) => {
    console.log("Error in connecting mongoDB" + err);
  });

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Url Shortning Page!!!");
});

app.use("/", UserRoutes);
app.use("/", UrlRoutes);
app.listen(Port, (req, res) => {
  console.log("The server is runinng on the port" + " " + Port);
});

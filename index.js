const https = require("https");
const fs = require("fs");
const express = require("express");
const app = express();
const routes = require("./routes/method");
const path = require("path");

const options = {
    key: fs.readFileSync("sslcert/v15.studio.key"),
    cert: fs.readFileSync("sslcert/v15.studio.pem"),
    ca: fs.readFileSync("sslcert/origin-ca.pem"),
};

app.set("view engine", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);

module.exports = https.createServer(options, app);

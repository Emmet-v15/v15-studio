const https = require("https");
const fs = require("fs");
const express = require("express");
const app = express();
const path = require("path");
const port = 443;

const options = {
    key: fs.readFileSync("sslcert/v15.studio.key"),
    cert: fs.readFileSync("sslcert/v15.studio.pem"),
    ca: fs.readFileSync("sslcert/origin-ca.pem"),
};

app.use(express.static(path.join(__dirname, "public")));

https.createServer(options, app).listen(port, (err) => {
    if (err) console.error(err);
    console.log(`Server started on port ${port}`);
});

require("./fetchData");

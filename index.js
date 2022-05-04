const https = require("https");
const fs = require("fs");
const subdomain = require("express-subdomain");
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
app.use(subdomain("api", require("./api/router")));

https
    .createServer(options, (req, res) => {
        const a = req.socket.remoteAddress.slice(7);
        console.log(`{${a.startsWith("172.70") ? "localhost" : a}}: [${req.method} ${req.url}]`);
        app.handle(req, res);
    })
    .listen(port, (err) => {
        if (err) console.error(err);
        console.log(`Server started on port ${port}`);
    });

require("./tasks/fetchData");

const nodeStatic = require("node-static");
const http = require("http");
const https = require("https");
const fs = require("fs");

const options = {
  key: fs.readFileSync("./cert/private.pem"),
  cert: fs.readFileSync("./cert/public.pem"),
};

var fileServer = new nodeStatic.Server();
// HTTPS 서버
https
  .createServer(options, (req, res) => {
    fileServer.serve(req, res);
  })
  .listen(443)
  .on("listening", () => {
    console.log("HTTPS Server Listening on port 443...");
  });

// HTTP 서버를 HTTPS 서버로 리다이렉트
http
  .createServer((req, res) => {
    res.writeHead(301, { Location: "https://" + req.headers["host"] + req.url });
    res.end();
  })
  .listen(80)
  .on("listening", () => {
    console.log("HTTP Server Listening on port 80...");
  });

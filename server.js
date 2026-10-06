const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 5177);

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    serveStatic(url.pathname, res);
  } catch (error) {
    sendText(res, 500, error.message || "Server error");
  }
});

server.listen(port, () => {
  console.log(`NAZUN 내전 운영실: http://localhost:${port}`);
});

function serveStatic(rawPath, res) {
  const safePath = rawPath === "/" ? "/index.html" : rawPath;
  let filePath = path.normalize(path.join(root, decodeURIComponent(safePath)));
  if (!filePath.startsWith(root)) return sendText(res, 403, "Forbidden");
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath)) return sendText(res, 404, "Not found");
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
  };
  res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

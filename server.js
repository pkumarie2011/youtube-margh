// server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Respond to ping at root URL
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>yt-margh is Online</title>
      <style>
        body { font-family: sans-serif; padding: 2em; background: #f0f0f0; color: #333; }
        h1 { color: #5e60ce; }
        p { font-size: 1.1em; }
      </style>
    </head>
    <body>
      <h1>✅ yt-margh WebSocket Server is Awake!</h1>
      <p>This Glitch project is currently running and ready to receive connections.</p>
      <p>If you're seeing this page, it means your uptime bot should too. 👍</p>
      <p>Last checked: ${new Date().toLocaleString()}</p>
    </body>
    </html>
  `);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function heartbeat() {
  this.isAlive = true;
}

wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.isAlive = true;
  // Set up a listener. If the client sends a "pong" frame, we know it's alive.
  ws.on("pong", heartbeat);
  // When a message is received from a client
  ws.on("message", (message) => {
    console.log(`Received message => ${message}`);

    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(`${message}`);
        console.log(`Sent message => ${message}`);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  //ws.send("Welcome to the WebSocket server!");
});

const listener = server.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

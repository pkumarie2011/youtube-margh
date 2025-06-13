// server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

// Serve static files from the 'public' directory if you have one.
app.use(express.static("public"));

// A simple root URL response to confirm the server is running for uptime bots.
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>yt-margh is Online</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 2em; background: #f0f2f5; color: #1c1e21; text-align: center; }
        h1 { color: #1877f2; }
        p { font-size: 1.1em; }
        .container { max-width: 600px; margin: auto; background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✅ WebSocket Server is Awake!</h1>
        <p>This server is currently running and ready to receive connections.</p>
        <p>Last checked: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

/**
 * A function to be called when a client responds to a ping.
 * It marks the WebSocket connection as "alive".
 */
function heartbeat() {
  this.isAlive = true;
}

wss.on("connection", (ws) => {
  console.log("Client connected");
  
  // Mark the connection as alive when it's first established
  ws.isAlive = true;

  // Set up a listener. When the server receives a pong frame, it knows the client is still alive.
  ws.on("pong", heartbeat);

  // When a message is received from a client
  ws.on("message", (message) => {
    // Convert buffer to string for reliable logging and processing
    const messageString = message.toString();
    console.log(`Received message => ${messageString}`);

    // Broadcast the message to all other connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(messageString);
        console.log(`Broadcasted message => ${messageString}`);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});


// --- This is the crucial heartbeat interval that sends the pings ---
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    // If a client has not responded to the last ping (by sending a pong),
    // their connection is considered dead, so we terminate it.
    if (ws.isAlive === false) {
      console.log("Terminating dead connection.");
      return ws.terminate();
    }

    // Otherwise, mark the connection as potentially dead and send a new ping.
    // The client's automatic pong reply will call the heartbeat() function,
    // marking it as alive again for the next check.
    ws.isAlive = false;
    ws.ping();
  });
}, 30000); // 30 seconds

// When the server is shut down, clear the interval to prevent memory leaks.
wss.on('close', function close() {
  clearInterval(interval);
});


const listener = server.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

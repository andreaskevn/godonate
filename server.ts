import { createServer, IncomingMessage, ServerResponse } from "http";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let clients: WebSocket[] = [];

// Helper untuk broadcast donasi baru
function broadcastDonation(donation: any) {
  const payload = JSON.stringify(donation);
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
  console.log("📢 Broadcasted donation:", donation);
}

app.prepare().then(() => {
  const server = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const parsedUrl = parse(req.url!, true);
        const { pathname } = parsedUrl;

        console.log(
          `[Custom Server] Request received: ${req.method} ${pathname}`
        );

        if (pathname === "/api/broadcast" && req.method === "POST") {
          console.log("[Custom Server] Handling /api/broadcast...");
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", () => {
            try {
              const donation = JSON.parse(body);
              broadcastDonation(donation);
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ message: "Broadcast successful" }));
            } catch (e) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ message: "Invalid JSON" }));
            }
          });
          return;
        }

        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error handling request:", err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    }
  );

  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws: WebSocket) => {
    console.log("🔌 WS connected for donations");
    clients.push(ws);

    ws.on("close", () => {
      console.log("🔌 WS disconnected for donations");
      clients = clients.filter((c) => c !== ws);
    });
  });

  server.on("upgrade", (request, socket, head) => {
    const { pathname } = parse(request.url!, true);

    if (pathname === "/ws/donations") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else if (pathname === "/_next/webpack-hmr") {
    } else {
      socket.destroy();
    }
  });

  server.listen(port, () => {
    console.log(`🚀 Next.js + WS ready on http://${hostname}:${port}`);
  });
});

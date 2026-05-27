

require("dotenv").config();

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const https = require('https');
const app = require("./src/app");


const SELF_PING_INTERVAL = 10 * 60 * 1000;
const SERVER_URL = process.env.SERVER_URL || "https://calorietracker-be-2.onrender.com";


function keepServerAwake() {
  const isHttps = SERVER_URL.startsWith('https');
  if (!isHttps) {
    return;
  }
  console.log(`Pinging self at ${SERVER_URL}/ping to prevent cooling period...`);
  https
    .get(`${SERVER_URL}/ping`, (res) => {
      console.log(`Self-ping response status: ${res.statusCode} ${res.statusMessage}`);
    })
    .on('error', (err) => {
      console.error(`Error during self-ping: ${err.message}`);
    });
}
const {
  connectDatabase,
  disconnectDatabase,
} = require("./src/config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🥗  Calorie Tracker API Server                      ║
║                                                       ║
║   🚀 Server running on port ${PORT}                     ║
║   📊 Environment: ${process.env.NODE_ENV || "development"}                    ║
║   🔗 Health check: http://localhost:${PORT}/api/health  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);

      setInterval(keepServerAwake, SELF_PING_INTERVAL);

      keepServerAwake();
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("HTTP server closed.");

        try {
          await disconnectDatabase();
          console.log("Graceful shutdown completed.");
          process.exit(0);
        } catch (error) {
          console.error("Error during graceful shutdown:", error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        console.error("Forced shutdown due to timeout.");
        process.exit(1);
      }, 30000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

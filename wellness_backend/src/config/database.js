
const { PrismaClient } = require("@prisma/client");

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["error"],
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ["info", "warn", "error"],
    });
  }
  prisma = global.__prisma;
}

/**
 * Connect to the database
 * @returns {Promise<void>}
 */
const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from the database
 * @returns {Promise<void>}
 */
const disconnectDatabase = async () => {
  await prisma.$disconnect();
  console.log("🔌 Database disconnected");
};

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
};

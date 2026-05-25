require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL / DATABASE_URL belum ada di .env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding...");
  await prisma.category.createMany({
    data: [
      { name: "Makanan", icon: "🍔", color: "#f97316", isDefault: true },
      { name: "Transport", icon: "🛵", color: "#3b82f6", isDefault: true },
      { name: "Belanja", icon: "🛒", color: "#10b981", isDefault: true },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Seed selesai");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

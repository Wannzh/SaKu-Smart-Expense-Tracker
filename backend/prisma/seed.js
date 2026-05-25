const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Default categories untuk SaKu.
 *
 * Setiap category diberi ID stabil (deterministik) supaya upsert
 * bisa dijalankan berulang tanpa duplikat.
 *
 * isDefault: true, userId: null → category bawaan sistem
 */
const defaultCategories = [
  // ─── EXPENSE ──────────────────────────────────────────────
  {
    id: "default-expense-makanan",
    name: "Makanan & Minuman",
    icon: "🍔",
    color: "#FF6B6B",
  },
  {
    id: "default-expense-transportasi",
    name: "Transportasi",
    icon: "🚗",
    color: "#4ECDC4",
  },
  {
    id: "default-expense-belanja",
    name: "Belanja",
    icon: "🛍️",
    color: "#A78BFA",
  },
  {
    id: "default-expense-kesehatan",
    name: "Kesehatan",
    icon: "💊",
    color: "#F472B6",
  },
  {
    id: "default-expense-hiburan",
    name: "Hiburan",
    icon: "🎮",
    color: "#34D399",
  },
  {
    id: "default-expense-pendidikan",
    name: "Pendidikan",
    icon: "📚",
    color: "#60A5FA",
  },
  {
    id: "default-expense-tagihan",
    name: "Tagihan & Utilitas",
    icon: "💡",
    color: "#FBBF24",
  },
  {
    id: "default-expense-lainnya",
    name: "Lainnya",
    icon: "📦",
    color: "#9CA3AF",
  },

  // ─── INCOME ───────────────────────────────────────────────
  {
    id: "default-income-gaji",
    name: "Gaji",
    icon: "💼",
    color: "#10B981",
  },
  {
    id: "default-income-freelance",
    name: "Freelance",
    icon: "💻",
    color: "#8B5CF6",
  },
  {
    id: "default-income-investasi",
    name: "Investasi",
    icon: "📈",
    color: "#F59E0B",
  },
];

async function main() {
  console.log("🌱 Seeding default categories...\n");

  for (const category of defaultCategories) {
    const result = await prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        icon: category.icon,
        color: category.color,
        isDefault: true,
      },
      create: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        isDefault: true,
        // userId: null → category bawaan sistem
      },
    });

    console.log(`  ✅ ${result.icon} ${result.name}`);
  }

  console.log(`\n🎉 Selesai! ${defaultCategories.length} default categories berhasil di-seed.`);
}

main()
  .catch((error) => {
    console.error("❌ Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

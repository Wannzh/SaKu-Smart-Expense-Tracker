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

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

const categoriesData = [
  // EXPENSE CATEGORIES
  {
    id: "cat-makan-minum",
    name: "Makan & Minum",
    icon: "Utensils",
    color: "#F97316",
    type: "EXPENSE",
    subCategories: [
      "Sarapan", "Makan Siang", "Makan Malam", "Tempat Makan", "Camilan",
      "Minuman", "Sembako", "Pesan Antar", "Alkohol", "Buah", "Kopi", "Jajanan"
    ]
  },
  {
    id: "cat-transportasi",
    name: "Transportasi",
    icon: "Car",
    color: "#3B82F6",
    type: "EXPENSE",
    subCategories: [
      "Bus", "Kereta", "Taksi", "Bensin", "Parkir", "Perawatan",
      "Asuransi", "Tol", "Ojek Online", "Pesawat"
    ]
  },
  {
    id: "cat-belanja",
    name: "Belanja",
    icon: "ShoppingBag",
    color: "#8B5CF6",
    type: "EXPENSE",
    subCategories: [
      "Pakaian", "Elektronik", "Rumah", "Kecantikan", "Hadiah",
      "Perangkat Lunak", "Peralatan", "Sepatu", "Belanja Online", "Perawatan Kulit"
    ]
  },
  {
    id: "cat-tempat-tinggal",
    name: "Tempat Tinggal",
    icon: "Home",
    color: "#06B6D4",
    type: "EXPENSE",
    subCategories: [
      "Sewa", "KPR", "Tagihan", "Internet", "Perawatan", "Perabotan",
      "Jasa", "Laundry", "Pulsa & Data", "Listrik", "Cleaning Supplies"
    ]
  },
  {
    id: "cat-hiburan",
    name: "Hiburan",
    icon: "Tv",
    color: "#EC4899",
    type: "EXPENSE",
    subCategories: [
      "Bioskop", "Game", "Streaming", "Acara", "Hobi", "Perjalanan", "Musik"
    ]
  },
  {
    id: "cat-kesehatan",
    name: "Kesehatan",
    icon: "Heart",
    color: "#EF4444",
    type: "EXPENSE",
    subCategories: [
      "Dokter", "Apotek", "Gym", "Asuransi", "Kesehatan Mental", "Olahraga"
    ]
  },
  {
    id: "cat-pendidikan",
    name: "Pendidikan",
    icon: "BookOpen",
    color: "#10B981",
    type: "EXPENSE",
    subCategories: [
      "SPP", "Buku", "Kursus", "Perlengkapan", "Alat Tulis"
    ]
  },
  {
    id: "cat-pribadi",
    name: "Pribadi",
    icon: "User",
    color: "#F59E0B",
    type: "EXPENSE",
    subCategories: [
      "Potong Rambut", "Spa", "Kosmetik"
    ]
  },
  {
    id: "cat-keuangan",
    name: "Keuangan",
    icon: "Landmark",
    color: "#6366F1",
    type: "EXPENSE",
    subCategories: [
      "Pajak", "Biaya Admin", "Denda", "Asuransi", "Donasi", "Zakat"
    ]
  },
  {
    id: "cat-keluarga",
    name: "Keluarga",
    icon: "Users",
    color: "#14B8A6",
    type: "EXPENSE",
    subCategories: [
      "Pengasuhan Anak", "Mainan", "Sekolah", "Hewan Peliharaan", "Baby Gear"
    ]
  },
  {
    id: "cat-teman",
    name: "Teman",
    icon: "UserCheck",
    color: "#F97316",
    type: "EXPENSE",
    subCategories: [
      "Transfer", "Traktir", "Refund", "Pinjaman", "Hadiah"
    ]
  },
  {
    id: "cat-hewan-peliharaan",
    name: "Hewan Peliharaan",
    icon: "PawPrint",
    color: "#84CC16",
    type: "EXPENSE",
    subCategories: [
      "Makanan Hewan", "Dokter Hewan", "Mainan", "Aksesoris", "Perawatan"
    ]
  },
  {
    id: "cat-utang",
    name: "Utang",
    icon: "HandCoins",
    color: "#EF4444",
    type: "EXPENSE",
    subCategories: [
      "Bayar Hutang", "Pinjaman Diberikan"
    ]
  },

  // INCOME CATEGORIES
  {
    id: "cat-gaji",
    name: "Gaji",
    icon: "Briefcase",
    color: "#10B981",
    type: "INCOME",
    subCategories: [
      "Bulanan", "Mingguan", "Bonus", "Lembur"
    ]
  },
  {
    id: "cat-bisnis",
    name: "Bisnis",
    icon: "TrendingUp",
    color: "#3B82F6",
    type: "INCOME",
    subCategories: [
      "Penjualan", "Jasa", "Keuntungan"
    ]
  },
  {
    id: "cat-investasi",
    name: "Investasi",
    icon: "BarChart2",
    color: "#8B5CF6",
    type: "INCOME",
    subCategories: [
      "Dividen", "Bunga", "Kripto", "Saham", "Real Estate"
    ]
  },
  {
    id: "cat-hadiah",
    name: "Hadiah",
    icon: "Gift",
    color: "#EC4899",
    type: "INCOME",
    subCategories: [
      "Ulang Tahun", "Hari Raya", "Uang Saku"
    ]
  },
  {
    id: "cat-lainnya",
    name: "Lainnya",
    icon: "Plus",
    color: "#6B7280",
    type: "INCOME",
    subCategories: [
      "Pengembalian Dana", "Hibah", "Penjualan Barang"
    ]
  },
  {
    id: "cat-utang-in",
    name: "Utang",
    icon: "HandCoins",
    color: "#10B981",
    type: "INCOME",
    subCategories: [
      "Pinjaman Diterima", "Terima Pembayaran"
    ]
  }
];

async function main() {
  console.log("Seeding categories & subcategories...");

  // Hapus semua data kategori & subkategori yang lama
  await prisma.subCategory.deleteMany({});
  await prisma.category.deleteMany({});

  for (const cat of categoriesData) {
    const parentSlug = slugify(cat.name);
    
    // Upsert Category
    const category = await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
        type: cat.type,
      },
      create: {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
        type: cat.type,
      },
    });

    console.log(`Upserted Category: ${category.name}`);

    // Create subCategories
    for (const subName of cat.subCategories) {
      const nameSlug = slugify(subName);
      const subId = `sub-${parentSlug}-${nameSlug}`;

      await prisma.subCategory.upsert({
        where: { id: subId },
        update: {
          name: subName,
          categoryId: category.id,
        },
        create: {
          id: subId,
          name: subName,
          categoryId: category.id,
        },
      });
    }
  }

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

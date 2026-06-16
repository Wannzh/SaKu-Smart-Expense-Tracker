# Stage 1: Build the backend application
FROM node:20-alpine AS builder

# Install build dependencies untuk compiling native modules (seperti argon2/bcrypt)
RUN apk add --no-cache g++ make python3

# Install pnpm menggunakan Corepack
RUN corepack enable

WORKDIR /app

# Karena di Render Root Directory di-set ke "backend", 
# posisi Docker sudah berada di dalam folder backend.
# Kita langsung menyalin package.json milik backend.
COPY package.json ./

# Install dependencies khusus untuk backend saja
RUN pnpm install

# Copy folder prisma dan generate Prisma Client
COPY prisma ./prisma/
RUN pnpm exec prisma generate

# Copy seluruh sisa file source code backend
COPY . .

# Stage 2: Create a minimal runner image (Production)
FROM node:20-alpine AS runner

WORKDIR /app

# Mengaktifkan corepack di runner agar perintah pnpm start bisa berjalan
RUN corepack enable

# Menyalin hasil build dan dependencies yang sudah matang dari stage builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

# Set port ke 5000 (Sesuai dengan setelan port standard Express kamu)
EXPOSE 5000

# Set environment variables produksi
ENV NODE_ENV=production
ENV PORT=5000

# Karena kamu menggunakan Supabase (Database Cloud Online)[cite: 45], 
# Kamu TIDAK PERLU lagi menggunakan perintah "pg_isready -h postgres".
# Server bisa langsung melakukan migrasi prisma deploy dan langsung start server!
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]
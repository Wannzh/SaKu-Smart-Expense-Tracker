# Stage 1: Build the React Vite application
FROM node:20-alpine AS builder

# Install pnpm menggunakan Corepack
RUN corepack enable

WORKDIR /app

# Karena di Render Root Directory di-set ke "frontend", posisi kita sudah di dalam folder frontend.
# Kita langsung menyalin package.json milik frontend.
COPY package.json ./

# Install dependencies untuk frontend
RUN pnpm install

# Menyalin seluruh source code frontend
COPY . .

# Menerima build arguments untuk environment variables client-side
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID

# Mengekspos variabel tersebut agar tertanam di dalam build Vite
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build aplikasi React menjadi file statis (folder dist)
RUN pnpm build

# Stage 2: Serve built assets menggunakan Nginx
FROM nginx:1.25-alpine

# Menyalin file statis hasil build dari stage builder ke folder HTML Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Menyalin file nginx.conf (karena sudah di dalam folder frontend, path-nya langsung nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
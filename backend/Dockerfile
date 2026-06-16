# Stage 1: Build the backend application
FROM node:20-alpine AS builder

# Install build dependencies for compiling native node modules (like argon2)
RUN apk add --no-cache g++ make python3

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy root workspace and lockfile configuration
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Copy backend package.json
COPY backend/package.json ./backend/

# Install dependencies (only for backend and its dependencies)
RUN pnpm install --frozen-lockfile --filter backend...

# Copy prisma folder and generate Prisma Client
COPY backend/prisma ./backend/prisma/
RUN pnpm --filter backend db:generate

# Copy the rest of the backend source files
COPY backend ./backend/

# Stage 2: Create a minimal runner image
FROM node:20-alpine AS runner

# Install postgresql-client to use pg_isready for startup checks
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app /app

WORKDIR /app/backend

EXPOSE 5001

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Wait for database connection, run migrations, and then start the server
CMD ["sh", "-c", "until pg_isready -h postgres -p 5432; do echo 'Waiting for postgres...'; sleep 2; done && npx prisma migrate deploy && pnpm start"]

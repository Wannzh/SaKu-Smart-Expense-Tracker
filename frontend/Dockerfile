# Stage 1: Build the React Vite application
FROM node:20-alpine AS builder

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy pnpm lockfile, workspace settings, and root package.json
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Copy frontend package.json
COPY frontend/package.json ./frontend/

# Install dependencies for the frontend workspace specifically
RUN pnpm install --frozen-lockfile --filter frontend...

# Copy frontend source code
COPY frontend ./frontend/

# Define build arguments for client-side environment variables
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID

# Expose them as environment variables for the Vite build step
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build the frontend production bundle
RUN pnpm --filter frontend build

# Stage 2: Serve built assets using Nginx
FROM nginx:1.25-alpine

# Copy built assets from builder stage
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy custom Nginx configuration for routing
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

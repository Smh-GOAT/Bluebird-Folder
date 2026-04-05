# =====================================================
# Bluebird-Folder — Next.js + Python (yt-dlp / ffmpeg)
# Multi-stage build
# =====================================================

# ── Stage 1: Install dependencies & build Next.js ──
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy source & build
COPY . .
RUN npm run build

# ── Stage 2: Production image ──
FROM node:20-alpine AS production

WORKDIR /app

# Install Python, ffmpeg, and pip (needed for yt-dlp and ASR audio processing)
RUN apk add --no-cache python3 py3-pip ffmpeg && \
    python3 -m pip install --break-system-packages \
      yt-dlp==2026.3.17 \
      moviepy==2.2.1 \
      python-dotenv==1.2.2

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files & install production deps
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built Next.js output from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

# Copy Python scripts
COPY scripts/ ./scripts/

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Environment defaults (override via docker-compose env_file or -e)
ENV NODE_ENV=production
ENV PORT=3000
ENV PYTHON_BIN=python3
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["npm", "run", "start"]

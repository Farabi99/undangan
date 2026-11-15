# ==============================================================================
# Production Dockerfile for Undangan Digital
# Runtime: Node.js 22 Alpine (with native node:sqlite DatabaseSync support)
# ==============================================================================

FROM node:22-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy all application assets and source code
COPY . .

# Set production environment defaults
ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/app/data

# Create initial persistent volume mount point
RUN mkdir -p /app/data/voice-notes

# Expose web server port
EXPOSE 3000

# Start Express server
CMD ["node", "server/index.js"]

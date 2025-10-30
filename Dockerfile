# Multi-stage build for Event Manager
FROM node:20-alpine AS frontend-builder

# Build Frontend
WORKDIR /app/frontend
COPY Todo-List-FrontEnd/package*.json ./
RUN npm ci

COPY Todo-List-FrontEnd/ ./
RUN npm run build

# Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend
COPY Todo-List-BackEnd/package*.json ./
COPY Todo-List-BackEnd/prisma ./prisma/
RUN npm ci

COPY Todo-List-BackEnd/ ./
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

# Install dumb-init and nginx
RUN apk add --no-cache dumb-init nginx

WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/prisma ./backend/prisma

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy configuration files
COPY nginx-prod.conf /etc/nginx/http.d/default.conf
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app && \
    chown -R nestjs:nodejs /var/lib/nginx && \
    chown -R nestjs:nodejs /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nestjs:nodejs /var/run/nginx.pid

USER nestjs

# Expose port
EXPOSE 80

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV SQLITE_DATABASE_URL=file:./dev.db

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/start.sh"]

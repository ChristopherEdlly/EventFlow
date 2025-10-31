#!/bin/sh
set -e

echo "Starting Event Manager..."

# Ensure FRONTEND port is set (Render provides PORT) — default to 80
FRONTEND_PORT=${PORT:-80}
echo "Using FRONTEND_PORT=$FRONTEND_PORT"

# Backend internal port (so nginx can proxy to it). Default to 8081 to avoid collisions.
BACKEND_PORT=${BACKEND_PORT:-8081}
echo "Using BACKEND_PORT=$BACKEND_PORT"

# If nginx config exists, patch the listen port so nginx binds to FRONTEND_PORT
# and patch proxy_pass target to BACKEND_PORT so nginx proxies API requests correctly.
if [ -f /etc/nginx/http.d/default.conf ]; then
	echo "Patching nginx config: listen ${FRONTEND_PORT}, proxy -> ${BACKEND_PORT}"
	# Replace listen directive
	sed -i "s/listen 80;/listen ${FRONTEND_PORT};/g" /etc/nginx/http.d/default.conf || true
	# Replace proxy_pass default backend port (8080) with BACKEND_PORT
	sed -i "s/http:\/\/localhost:8080/http:\/\/localhost:${BACKEND_PORT}/g" /etc/nginx/http.d/default.conf || true
fi

# Start nginx in background
echo "Starting nginx..."
nginx

# Run database migrations
echo "Running database migrations..."
cd /app/backend
npx prisma migrate deploy || echo "Migration failed or not needed"

# Start backend (foreground) on BACKEND_PORT
echo "Starting backend on port ${BACKEND_PORT}..."
cd /app/backend
# Export PORT so Nest picks it up from process.env.PORT
export PORT=${BACKEND_PORT}
exec node dist/main.js

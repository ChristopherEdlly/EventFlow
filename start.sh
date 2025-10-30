#!/bin/sh
set -e

echo "Starting Event Manager..."

# Start nginx in background
echo "Starting nginx..."
nginx

# Run database migrations
echo "Running database migrations..."
cd /app/backend
npx prisma migrate deploy || echo "Migration failed or not needed"

# Start backend
echo "Starting backend on port 8080..."
cd /app/backend
exec node dist/main.js

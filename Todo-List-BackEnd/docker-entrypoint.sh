#!/bin/sh
set -e

echo "🚀 Starting Event Manager Backend..."

# Wait a bit for the volume to be mounted
sleep 2

echo "📊 Running Prisma migrations..."
npx prisma migrate deploy || npx prisma db push

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "✅ Starting application..."
exec "$@"

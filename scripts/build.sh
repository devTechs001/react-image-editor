#!/bin/bash
# scripts/build.sh

echo "🏗️ Building for production..."

# Build frontend
echo "📦 Building frontend..."
cd frontend && npm run build && cd ..

# Build backend (if needed)
echo "📦 Preparing backend..."
cd backend && npm ci --only=production && cd ..

echo "✅ Build complete!"
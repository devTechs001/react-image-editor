#!/bin/bash
# scripts/dev.sh

echo "🚀 Starting development servers..."

# Check if Docker is running for MongoDB and Redis
if command -v docker &> /dev/null; then
    echo "🐳 Starting Docker services..."
    docker-compose -f docker/docker-compose.dev.yml up -d mongodb redis
    sleep 3
fi

# Start development servers
npm run dev
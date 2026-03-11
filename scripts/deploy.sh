#!/bin/bash
# scripts/deploy.sh

echo "🚀 Deploying AI Media Editor..."

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose -f docker/docker-compose.yml build

# Deploy
echo "📦 Deploying containers..."
docker-compose -f docker/docker-compose.yml up -d

echo "✅ Deployment complete!"
echo ""
echo "Services running:"
echo "- Frontend: http://localhost"
echo "- Backend API: http://localhost:5000"
echo ""
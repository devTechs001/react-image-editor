#!/bin/bash
# scripts/setup.sh

echo "🚀 Setting up AI Media Editor..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18 or higher is required"
    exit 1
fi

echo "✅ Node.js version OK"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Create environment files if they don't exist
if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
fi

if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/logs
mkdir -p backend/uploads

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update frontend/.env with your configuration"
echo "2. Update backend/.env with your configuration"
echo "3. Start MongoDB and Redis (or use Docker)"
echo "4. Run 'npm run dev' to start development servers"
echo ""
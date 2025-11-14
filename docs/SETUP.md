# 🚀 Setup Guide

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MongoDB >= 6.0
- Redis >= 7.0
- Git

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/ai-media-editor.git
cd ai-media-editor
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
pnpm install

# Or install separately
cd frontend && pnpm install
cd ../backend && pnpm install
```

### 3. Environment Setup

#### Frontend (.env)

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
VITE_OPENAI_API_KEY=sk-your-key
VITE_STABILITY_AI_KEY=sk-your-key
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-media-editor
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-key
OPENAI_API_KEY=sk-your-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### 4. Database Setup

#### MongoDB

```bash
# Start MongoDB
mongod --dbpath ./data/db

# Create database and collections
mongo
> use ai-media-editor
> db.createCollection('users')
> db.createCollection('projects')
> db.createCollection('images')
```

#### Redis

```bash
# Start Redis
redis-server

# Verify connection
redis-cli ping
# Should return: PONG
```

### 5. AI Models Setup

```bash
# Download TensorFlow.js models
cd frontend/public/models
wget https://tfhub.dev/tensorflow/tfjs-model/posenet/mobilenet/float/075/1/default/model.json

# Or use the setup script
pnpm run setup:models
```

### 6. Start Development Servers

```bash
# From root directory
pnpm run dev

# Or start separately
cd frontend && pnpm run dev
cd backend && pnpm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:5000

## Production Build

```bash
# Build frontend
cd frontend
pnpm run build

# Build backend
cd backend
pnpm run build

# Start production
pnpm start
```

## Docker Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Verification

### Test Frontend

```bash
cd frontend
pnpm test
```

### Test Backend

```bash
cd backend
pnpm test
```

### Check API

```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok"}
```

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Error

```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

### Redis Connection Error

```bash
# Check Redis status
redis-cli ping

# Restart Redis
sudo systemctl restart redis
```

### FFmpeg Not Found

```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

## Next Steps

- Read [Architecture Guide](./ARCHITECTURE.md)
- Explore [API Documentation](./API.md)
- Check [AI Integration](./AI_INTEGRATION.md)
- Review [Contributing Guidelines](./CONTRIBUTING.md)
# Deployment Guide

This document provides instructions for deploying the AI Media Editor to various platforms.

## Table of Contents

- [GitHub Pages](#github-pages)
- [Netlify](#netlify)
- [Vercel](#vercel)
- [Render](#render)
- [Docker](#docker)

---

## GitHub Pages

GitHub Pages is suitable for the frontend only. You'll need to host the backend separately.

### Setup Steps

1. **Configure Backend URL**
   - Set up your backend on Render, Railway, or another platform
   - Note the backend URL

2. **Enable GitHub Pages**
   - Go to Repository Settings → Pages
   - Source: GitHub Actions
   - Click "Save"

3. **Configure Environment Variables**
   - Go to Repository Settings → Actions → Variables
   - Add `VITE_API_URL` with your backend URL

4. **Deploy**
   - Push to `main` branch
   - The workflow will automatically deploy

### Manual Deployment

```bash
cd frontend
npm install
npm run build
# Upload dist/ folder to GitHub Pages
```

---

## Netlify

Netlify provides free hosting with automatic deployments from Git.

### Setup Steps

1. **Connect Repository**
   - Sign in to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import from Git"
   - Select your repository

2. **Configure Build Settings**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy automatically

### Using netlify.toml

The included `netlify.toml` file configures:
- Build settings
- Redirects for SPA routing
- API proxying
- Security headers
- Cache headers

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy manually
netlify deploy --prod
```

---

## Vercel

Vercel offers excellent performance and automatic SSL.

### Setup Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_API_URL production
   ```

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

### Using vercel.json

The included `vercel.json` configures:
- Build settings
- Headers for security
- Rewrites for API proxying
- SPA routing

---

## Render

Render provides full-stack hosting with managed databases.

### Setup Steps

1. **Create Render Account**
   - Sign up at [render.com](https://render.com)

2. **Deploy Using Blueprint**
   ```bash
   # In Render dashboard, select "New +" → "Blueprint"
   # Connect your repository
   # Render will read render.yaml automatically
   ```

3. **Configure Environment Variables**
   - In Render dashboard, set required variables:
     - `CORS_ORIGIN`
     - `FRONTEND_URL`
     - `JWT_SECRET`
     - AWS credentials (if using S3)
     - AI service API keys
     - Payment credentials

4. **Deploy**
   - Render will automatically deploy all services

### Manual Deployment

```bash
# Install Render CLI
npm install -g @render-cloud/cli

# Login
render login

# Deploy
render deploy
```

---

## Docker

### Production Deployment

1. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Build and Run**
   ```bash
   docker-compose -f docker/docker-compose.prod.yml up -d
   ```

3. **Check Status**
   ```bash
   docker-compose -f docker/docker-compose.prod.yml ps
   ```

4. **View Logs**
   ```bash
   docker-compose -f docker/docker-compose.prod.yml logs -f
   ```

### Development with Docker

```bash
docker-compose -f docker/docker-compose.dev.yml up
```

### SSL with Nginx

1. **Generate SSL Certificates**
   ```bash
   mkdir -p docker/ssl
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout docker/ssl/key.pem \
     -out docker/ssl/cert.pem
   ```

2. **Deploy with Nginx**
   ```bash
   docker-compose -f docker/docker-compose.prod.yml --profile with-nginx up -d
   ```

---

## Environment Variables

### Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Backend port | `5000` |
| `MONGODB_URI` | MongoDB connection | - |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret | - |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |
| `VITE_API_URL` | Frontend API URL | `http://localhost:5000` |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `OPENAI_API_KEY` | OpenAI API key |
| `STABILITY_API_KEY` | Stability AI key |
| `STRIPE_SECRET_KEY` | Stripe secret key |

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### CORS Errors

Ensure `CORS_ORIGIN` matches your frontend URL exactly.

### Database Connection Fails

Check MongoDB URI format:
```
mongodb://username:password@host:port/database?authSource=admin
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

---

## Support

For issues or questions:
- Check existing GitHub Issues
- Create a new issue with details
- Review platform-specific documentation

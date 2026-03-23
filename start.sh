#!/bin/bash
# start.sh - Startup script for AI Media Editor

set -e

echo "🚀 Starting AI Media Editor..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}====================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}====================================${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Set Docker Compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

# Check if .env file exists
if [ ! -f "./backend/.env.development" ]; then
    print_warning ".env.development file not found. Creating from template..."
    cp ./backend/.env.example ./backend/.env.development
    print_status "Created .env.development file. Please review and update it."
fi

# Create necessary directories
print_header "Creating directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p models
mkdir -p monitoring
mkdir -p nginx
mkdir -p nginx/ssl

# Create monitoring configuration
cat > ./monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node-backend'
    static_configs:
      - targets: ['node-backend:5000']
    metrics_path: '/metrics'
    
  - job_name: 'python-ai'
    static_configs:
      - targets: ['python-ai:8001']
    metrics_path: '/metrics'
    
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
EOF

# Create Grafana datasource configuration
mkdir -p ./monitoring/grafana/datasources
cat > ./monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

# Create Nginx configuration
cat > ./nginx/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream node_backend {
        server node-backend:5000;
    }
    
    upstream python_ai {
        server python-ai:8001;
    }
    
    upstream frontend {
        server frontend:3000;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # Node.js Backend API
        location /api/ {
            proxy_pass http://node_backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # Python AI Services
        location /ai/ {
            proxy_pass http://python_ai;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # WebSocket support
        location /socket.io/ {
            proxy_pass http://node_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

# Function to check if services are healthy
check_health() {
    print_header "Checking service health..."
    
    # Check Node.js backend
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_status "✅ Node.js Backend is healthy"
    else
        print_warning "⚠️  Node.js Backend is not responding"
    fi
    
    # Check Python AI services
    if curl -f http://localhost:8001/health > /dev/null 2>&1; then
        print_status "✅ Python AI Services are healthy"
    else
        print_warning "⚠️  Python AI Services are not responding"
    fi
    
    # Check Frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_status "✅ Frontend is healthy"
    else
        print_warning "⚠️  Frontend is not responding"
    fi
}

# Function to show logs
show_logs() {
    print_header "Showing logs..."
    $DOCKER_COMPOSE logs -f --tail=50
}

# Function to stop services
stop_services() {
    print_header "Stopping services..."
    $DOCKER_COMPOSE down
    print_status "🛑 All services stopped"
}

# Function to restart services
restart_services() {
    print_header "Restarting services..."
    $DOCKER_COMPOSE restart
    sleep 10
    check_health
}

# Function to show status
show_status() {
    print_header "Service Status"
    $DOCKER_COMPOSE ps
}

# Function to install dependencies
install_deps() {
    print_header "Installing dependencies..."
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_status "✅ Dependencies installed"
}

# Function to build images
build_images() {
    print_header "Building Docker images..."
    $DOCKER_COMPOSE build --no-cache
    print_status "✅ Docker images built"
}

# Function to clean up
cleanup() {
    print_header "Cleaning up..."
    $DOCKER_COMPOSE down -v --remove-orphans
    docker system prune -f
    print_status "🧹 Cleanup completed"
}

# Function to show help
show_help() {
    echo "AI Media Editor Startup Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  status      Show service status"
    echo "  logs        Show logs"
    echo "  health      Check service health"
    echo "  build       Build Docker images"
    echo "  install     Install dependencies"
    echo "  cleanup     Clean up containers and images"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start    # Start all services"
    echo "  $0 logs     # Show logs"
    echo "  $0 status   # Show service status"
}

# Main script logic
case "${1:-start}" in
    start)
        print_header "Starting AI Media Editor Services"
        print_status "🐳 Starting Docker containers..."
        $DOCKER_COMPOSE up -d
        
        print_status "⏳ Waiting for services to start..."
        sleep 30
        
        check_health
        
        print_header "🎉 AI Media Editor is ready!"
        echo ""
        echo "📱 Frontend:        http://localhost:3000"
        echo "🔧 Backend API:     http://localhost:5000"
        echo "🤖 AI Services:     http://localhost:8001"
        echo "📊 Grafana:         http://localhost:3001 (admin/admin123)"
        echo "🔍 Prometheus:      http://localhost:9090"
        echo "🗄️  MinIO:          http://localhost:9001 (minioadmin/minioadmin123)"
        echo "📚 Jupyter:        http://localhost:8888 (token: dev123)"
        echo "🔍 Elasticsearch:   http://localhost:9200"
        echo "🐰 RabbitMQ:        http://localhost:15672 (admin/admin123)"
        echo ""
        echo "To view logs: $0 logs"
        echo "To stop services: $0 stop"
        echo "To check health: $0 health"
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    health)
        check_health
        ;;
    build)
        build_images
        ;;
    install)
        install_deps
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

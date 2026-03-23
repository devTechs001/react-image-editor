# 🤖 AI/ML Integration Guide

This document provides a comprehensive guide to the advanced AI/ML features integrated into the React Image Editor.

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🏗️ Architecture](#️-architecture)
- [🤖 AI/ML Services](#-ai-ml-services)
- [🔧 Backend Endpoints](#-backend-endpoints)
- [📦 Python Libraries](#-python-libraries)
- [🐳 Docker Setup](#-docker-setup)
- [🔌 API Integration](#-api-integration)
- [📊 Monitoring](#-monitoring)
- [🚀 Deployment](#-deployment)

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.10+
- CUDA-compatible GPU (optional, for AI acceleration)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd react-image-editor

# Start all services
./start.sh

# Or start manually
docker-compose up -d
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Services**: http://localhost:8001
- **Grafana Dashboard**: http://localhost:3001
- **Jupyter Lab**: http://localhost:8888

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │◄──►│  Node.js Backend │◄──►│  Python AI Services │
│   (Port 3000)    │    │   (Port 5000)    │    │   (Port 8001)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Interface │    │   API Gateway   │    │   AI/ML Models   │
│   Components     │    │   Authentication │    │   Processing     │
│   State Mgmt     │    │   Database       │    │   GPU Compute    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🤖 AI/ML Services

### 1. Computer Vision Service

**Features:**
- Object Detection (YOLOv8)
- Semantic Segmentation
- Face Analysis
- Pose Estimation
- OCR Text Recognition
- Depth Estimation

**Libraries Used:**
- OpenCV 4.8+
- Ultralytics (YOLO)
- MediaPipe
- EasyOCR
- Transformers

### 2. Natural Language Processing Service

**Features:**
- Text Generation (GPT-2, GPT-4)
- Sentiment Analysis
- Multi-language Translation
- Text Summarization
- Keyword Extraction
- Speech-to-Text (Whisper)

**Libraries Used:**
- Transformers
- NLTK
- spaCy
- KeyBERT
- SpeechRecognition
- Whisper

### 3. Generative AI Service

**Features:**
- Image Generation (Stable Diffusion)
- Style Transfer
- Image Enhancement
- Batch Generation
- Model Fine-tuning

**Libraries Used:**
- Diffusers
- Stable Diffusion
- PyTorch
- PIL/Pillow
- OpenCV

### 4. Reinforcement Learning Service

**Features:**
- DQN Training
- PPO Implementation
- Custom Environments
- Model Management
- Convergence Analysis

**Libraries Used:**
- Gymnasium
- Stable-Baselines3
- PyTorch
- NumPy
- Matplotlib

## 🔧 Backend Endpoints

### Computer Vision Endpoints

```javascript
// Object Detection
POST /api/v1/ai/vision/object-detection
Content-Type: multipart/form-data
Body: image file, confidence, model

// Face Analysis
POST /api/v1/ai/vision/face-analysis
Content-Type: multipart/form-data
Body: image file

// OCR Extraction
POST /api/v1/ai/vision/ocr
Content-Type: multipart/form-data
Body: image file, languages
```

### NLP Endpoints

```javascript
// Text Generation
POST /api/v1/ai/nlp/text-generation
Content-Type: application/json
Body: {
  "prompt": "Generate creative text",
  "model": "gpt-2",
  "max_tokens": 500,
  "temperature": 0.7
}

// Sentiment Analysis
POST /api/v1/ai/nlp/sentiment-analysis
Content-Type: application/json
Body: {
  "text": "I love this product!",
  "model": "roberta"
}
```

### Generative AI Endpoints

```javascript
// Image Generation
POST /api/v1/ai/genai/image-generation
Content-Type: application/json
Body: {
  "prompt": "A beautiful landscape",
  "model": "stable-diffusion",
  "style": "photorealistic",
  "width": 512,
  "height": 512,
  "steps": 20,
  "guidance": 7.5,
  "batch_size": 4
}
```

### Reinforcement Learning Endpoints

```javascript
// Initialize Training
POST /api/v1/ai/rl/train-agent
Content-Type: application/json
Body: {
  "algorithm": "dqn",
  "environment": "image-classification",
  "hyperparameters": {
    "learning_rate": 0.001,
    "batch_size": 32
  },
  "total_episodes": 1000
}

// Get Training Status
GET /api/v1/ai/rl/training-status/{training_id}
```

## 📦 Python Libraries

### Core Dependencies

```txt
# Computer Vision
opencv-python==4.8.1.78
ultralytics==8.0.206
mediapipe==0.10.8
easyocr==1.7.0
dlib==19.24.2

# Deep Learning
torch==2.1.1
torchvision==0.16.1
transformers==4.35.2
diffusers==0.24.0
accelerate==0.24.1

# Natural Language Processing
nltk==3.8.1
spacy==3.7.2
keybert==0.8.4
sentence-transformers==2.2.2

# Speech Processing
whisper==1.1.10
SpeechRecognition==3.10.0
pydub==0.25.1

# Reinforcement Learning
gymnasium==0.29.1
stable-baselines3==2.2.1
tensorboard==2.15.1

# Data Processing
numpy==1.24.3
pandas==2.1.4
scikit-learn==1.3.2
matplotlib==3.8.2
```

### Installation

```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Install additional models
python -m spacy download en_core_web_sm
python -m keybert download
```

## 🐳 Docker Setup

### Services Overview

```yaml
services:
  node-backend:     # Main API server
  python-ai:        # AI/ML processing
  frontend:         # React application
  mongo:           # Database
  redis:           # Cache
  nginx:           # Reverse proxy
  minio:           # Object storage
  elasticsearch:   # Search engine
  rabbitmq:         # Message queue
  prometheus:      # Monitoring
  grafana:         # Dashboard
  jupyter:         # Development
```

### GPU Support

```yaml
python-ai:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

### Environment Variables

```bash
# Backend
NODE_ENV=development
MONGODB_URI=mongodb://mongo:27017/ai-media-editor
REDIS_URL=redis://redis:6379
PYTHON_AI_SERVICE_URL=http://python-ai:8001

# Python AI
CUDA_VISIBLE_DEVICES=0
PYTHONPATH=/app
```

## 🔌 API Integration

### Frontend Integration

```javascript
// AI Service Client
class AIServiceClient {
  constructor() {
    this.baseUrl = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:8001';
  }

  async generateImage(prompt, options = {}) {
    const response = await fetch(`${this.baseUrl}/api/v1/ai/genai/image-generation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, ...options })
    });
    return response.json();
  }

  async analyzeImage(imageFile, analysisType) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch(`${this.baseUrl}/api/v1/ai/vision/${analysisType}`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }
}
```

### Real-time Updates

```javascript
// WebSocket Integration
const socket = io(process.env.REACT_APP_WS_URL);

socket.on('training-progress', (data) => {
  updateTrainingProgress(data);
});

socket.on('generation-complete', (data) => {
  handleGenerationComplete(data);
});
```

## 📊 Monitoring

### Prometheus Metrics

```python
# Custom metrics
from prometheus_client import Counter, Histogram, Gauge

# Request counters
vision_requests = Counter('vision_requests_total', 'Total vision requests')
nlp_requests = Counter('nlp_requests_total', 'Total NLP requests')
genai_requests = Counter('genai_requests_total', 'Total GenAI requests')

# Processing time histograms
vision_processing_time = Histogram('vision_processing_seconds', 'Vision processing time')
nlp_processing_time = Histogram('nlp_processing_seconds', 'NLP processing time')

# GPU utilization
gpu_utilization = Gauge('gpu_utilization_percent', 'GPU utilization percentage')
```

### Grafana Dashboards

- **System Overview**: CPU, Memory, GPU usage
- **AI Service Metrics**: Request counts, processing times
- **Model Performance**: Accuracy, loss, convergence
- **Error Tracking**: Error rates, failure patterns

### Logging

```python
# Structured logging
import structlog

logger = structlog.get_logger()

logger.info(
    "vision_processing_completed",
    service="computer_vision",
    operation="object_detection",
    processing_time=1.23,
    objects_detected=5,
    confidence_threshold=0.5
)
```

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
```bash
# Production environment variables
NODE_ENV=production
CUDA_VISIBLE_DEVICES=0
GPU_MEMORY_LIMIT=8192
```

2. **Resource Limits**
```yaml
python-ai:
  deploy:
    resources:
      limits:
        memory: 16G
        nvidia.com/gpu: 1
      reservations:
        memory: 8G
        nvidia.com/gpu: 1
```

3. **Health Checks**
```python
@app.get("/health")
async def health_check():
    return {
        'status': 'healthy',
        'services': {
            'computer_vision': check_cv_service(),
            'nlp': check_nlp_service(),
            'genai': check_genai_service(),
            'rl': check_rl_service()
        }
    }
```

### Scaling Strategies

- **Horizontal Scaling**: Multiple Python AI containers
- **Model Caching**: Redis for model state
- **Load Balancing**: Nginx with AI service routing
- **GPU Pooling**: Shared GPU resources

### Security

- **API Authentication**: JWT tokens
- **Rate Limiting**: Request throttling
- **Input Validation**: Pydantic models
- **CORS Configuration**: Restricted origins
- **Model Security**: Model access controls

## 🧪 Testing

### Unit Tests

```python
# Test Computer Vision Service
def test_object_detection():
    service = ComputerVisionService()
    image = load_test_image()
    result = service.object_detection(image, confidence=0.5)
    
    assert result['success'] == True
    assert 'detections' in result
    assert len(result['detections']) > 0
```

### Integration Tests

```python
# Test API Integration
async def test_image_generation_endpoint():
    async with AsyncClient(app=python_app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/ai/genai/image-generation",
            json={"prompt": "test image"}
        )
        assert response.status_code == 200
        assert "images" in response.json()
```

### Performance Tests

```python
# Load testing with Locust
from locust import HttpUser, task

class AIUser(HttpUser):
    @task
    def generate_image(self):
        self.client.post("/api/v1/ai/genai/image-generation", json={
            "prompt": "test image",
            "steps": 10
        })
```

## 🔧 Development

### Jupyter Integration

```bash
# Start Jupyter Lab
docker-compose up jupyter

# Access: http://localhost:8888
# Token: dev123
```

### Model Development

```python
# Custom model training
import torch
from transformers import Trainer, TrainingArguments

def train_custom_model():
    model = load_pretrained_model()
    tokenizer = load_tokenizer()
    
    training_args = TrainingArguments(
        output_dir="./models/custom",
        per_device_train_batch_size=8,
        num_train_epochs=3,
        learning_rate=2e-5
    )
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=load_dataset(),
        tokenizer=tokenizer
    )
    
    trainer.train()
```

### Debugging

```python
# Debug logging
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.debug("Processing image with shape: %s", image.shape)
logger.debug("Model output: %s", model_output)
```

## 📚 API Documentation

### OpenAPI/Swagger

- **Node.js API**: http://localhost:5000/docs
- **Python AI API**: http://localhost:8001/docs

### Example Requests

```javascript
// Generate image with style
const response = await fetch('/api/v1/ai/genai/image-generation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "A futuristic city skyline",
    style: "photorealistic",
    width: 1024,
    height: 1024,
    steps: 30,
    guidance: 8.0,
    batch_size: 2
  })
});

// Analyze sentiment
const sentimentResponse = await fetch('/api/v1/ai/nlp/sentiment-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "I absolutely love this new feature!",
    model: "roberta"
  })
});
```

## 🚨 Troubleshooting

### Common Issues

1. **GPU Memory Error**
```bash
# Reduce batch size or model size
export CUDA_VISIBLE_DEVICES=0
export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:128
```

2. **Model Loading Timeout**
```python
# Increase timeout and use lazy loading
model = pipeline("text-generation", model="gpt-2", device=0, torch_dtype=torch.float16)
```

3. **CORS Issues**
```python
# Update CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True
)
```

### Performance Optimization

- **Model Quantization**: Use INT8 quantization for faster inference
- **Batch Processing**: Process multiple items simultaneously
- **Caching**: Cache model outputs and intermediate results
- **Async Processing**: Use background tasks for long operations

## 📈 Future Enhancements

- **Custom Model Training**: User-defined model training
- **Federated Learning**: Privacy-preserving ML
- **Edge AI**: On-device processing
- **Real-time Streaming**: Live AI processing
- **Multi-modal AI**: Combined vision and language models

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT and Whisper models
- Hugging Face for Transformers library
- Stability AI for Stable Diffusion
- Ultralytics for YOLO models
- MediaPipe for pose estimation

---

**🎉 Congratulations! You now have a fully integrated AI/ML powered image editor!**

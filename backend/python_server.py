#!/usr/bin/env python3
# backend/python_server.py
"""
Python FastAPI server for AI/ML services
Integrates with the Node.js backend for AI processing
"""

import os
import sys
import asyncio
import logging
from pathlib import Path
from typing import Optional
import json
import base64
import io
from contextlib import asynccontextmanager

# Add the services directory to the path
sys.path.append(str(Path(__file__).parent / "services"))

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

# Import AI services
from computer_vision import cv_service
from natural_language_processing import nlp_service
from generative_ai import genai_service
from reinforcement_learning import rl_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/python_ai_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Pydantic models for request/response
class TextGenerationRequest(BaseModel):
    prompt: str
    model: str = "gpt-2"
    max_tokens: int = 500
    temperature: float = 0.7

class SentimentAnalysisRequest(BaseModel):
    text: str
    model: str = "roberta"

class TranslationRequest(BaseModel):
    text: str
    source_language: str = "en"
    target_language: str = "es"
    model: str = "default"

class SummarizationRequest(BaseModel):
    text: str
    model: str = "bart"
    compression_ratio: float = 0.3

class KeywordExtractionRequest(BaseModel):
    text: str
    model: str = "keybert"
    max_keywords: int = 10

class ImageGenerationRequest(BaseModel):
    prompt: str
    model: str = "stable-diffusion"
    style: str = "photorealistic"
    width: int = 512
    height: int = 512
    steps: int = 20
    guidance: float = 7.5
    seed: int = -1
    batch_size: int = 4
    negative_prompt: str = ""

class RLTrainingRequest(BaseModel):
    algorithm: str = "dqn"
    environment: str = "image-classification"
    hyperparameters: dict = {}
    total_episodes: int = 1000

class ImageEnhancementRequest(BaseModel):
    enhancements: list = []
    model: str = "esrgan"

# Application lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Python AI Server starting up...")
    
    # Create logs directory
    Path("logs").mkdir(exist_ok=True)
    
    # Initialize services (lazy loading will handle actual model loading)
    logger.info("✅ AI Services initialized")
    
    yield
    
    # Shutdown
    logger.info("🛑 Python AI Server shutting down...")
    genai_service.cleanup_memory()
    logger.info("✅ Cleanup completed")

# Create FastAPI app
app = FastAPI(
    title="AI Media Editor - Python Services",
    description="Advanced AI/ML services for image, text, and reinforcement learning",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper functions
def decode_base64_image(base64_str: str) -> bytes:
    """Decode base64 image string"""
    try:
        if 'base64,' in base64_str:
            base64_str = base64_str.split('base64,')[1]
        return base64.b64decode(base64_str)
    except Exception as e:
        logger.error(f"Error decoding base64 image: {e}")
        raise HTTPException(status_code=400, detail="Invalid image data")

def encode_image_to_base64(image_bytes: bytes) -> str:
    """Encode image bytes to base64 string"""
    return f"data:image/jpeg;base64,{base64.b64encode(image_bytes).decode()}"

# Computer Vision endpoints
@app.post("/api/v1/ai/vision/object-detection")
async def object_detection(
    image: UploadFile = File(...),
    confidence: float = Form(0.5),
    model: str = Form("yolov8")
):
    """Perform object detection on uploaded image"""
    try:
        # Read and decode image
        image_data = await image.read()
        image_array = cv_service.decode_base64_image(base64.b64encode(image_data).decode())
        
        # Perform detection
        result = cv_service.object_detection(image_array, confidence)
        
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Object detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/vision/semantic-segmentation")
async def semantic_segmentation(image: UploadFile = File(...)):
    """Perform semantic segmentation on uploaded image"""
    try:
        image_data = await image.read()
        image_array = cv_service.decode_base64_image(base64.b64encode(image_data).decode())
        
        result = cv_service.semantic_segmentation(image_array)
        
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Semantic segmentation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/vision/face-analysis")
async def face_analysis(image: UploadFile = File(...)):
    """Perform face analysis on uploaded image"""
    try:
        image_data = await image.read()
        image_array = cv_service.decode_base64_image(base64.b64encode(image_data).decode())
        
        result = cv_service.face_analysis(image_array)
        
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Face analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/vision/pose-estimation")
async def pose_estimation(image: UploadFile = File(...)):
    """Perform pose estimation on uploaded image"""
    try:
        image_data = await image.read()
        image_array = cv_service.decode_base64_image(base64.b64encode(image_data).decode())
        
        result = cv_service.pose_estimation(image_array)
        
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Pose estimation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/vision/ocr")
async def ocr_extraction(image: UploadFile = File(...), languages: str = Form("en")):
    """Extract text from uploaded image using OCR"""
    try:
        image_data = await image.read()
        image_array = cv_service.decode_base64_image(base64.b64encode(image_data).decode())
        
        language_list = languages.split(',')
        result = cv_service.ocr_extraction(image_array, language_list)
        
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"OCR extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/vision/depth-estimation")
async def depth_estimation(image: UploadFile = File(...)):
    """Estimate depth from 2D image"""
    try:
        image_data = await image.read()
        image_array = cv_service.decode_base64_image(base64.b64encode(image_data).decode())
        
        result = cv_service.depth_estimation(image_array)
        
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Depth estimation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Natural Language Processing endpoints
@app.post("/api/v1/ai/nlp/text-generation")
async def text_generation(request: TextGenerationRequest):
    """Generate text using language models"""
    try:
        result = nlp_service.generate_text(
            prompt=request.prompt,
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Text generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/nlp/sentiment-analysis")
async def sentiment_analysis(request: SentimentAnalysisRequest):
    """Analyze sentiment of text"""
    try:
        result = nlp_service.analyze_sentiment(request.text, request.model)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/nlp/translation")
async def translation(request: TranslationRequest):
    """Translate text between languages"""
    try:
        result = nlp_service.translate_text(
            request.text,
            request.source_language,
            request.target_language,
            request.model
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/nlp/summarization")
async def summarization(request: SummarizationRequest):
    """Summarize text"""
    try:
        result = nlp_service.summarize_text(
            request.text,
            request.model,
            request.compression_ratio
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/nlp/keyword-extraction")
async def keyword_extraction(request: KeywordExtractionRequest):
    """Extract keywords from text"""
    try:
        result = nlp_service.extract_keywords(
            request.text,
            request.model,
            request.max_keywords
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Keyword extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/nlp/speech-to-text")
async def speech_to_text(
    audio: UploadFile = File(...),
    language: str = Form("en"),
    model: str = Form("whisper")
):
    """Convert speech to text"""
    try:
        audio_data = await audio.read()
        result = nlp_service.speech_to_text(audio_data, language, model)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Speech to text error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Generative AI endpoints
@app.post("/api/v1/ai/genai/image-generation")
async def image_generation(request: ImageGenerationRequest):
    """Generate images using diffusion models"""
    try:
        result = genai_service.generate_images(
            prompt=request.prompt,
            model=request.model,
            style=request.style,
            width=request.width,
            height=request.height,
            steps=request.steps,
            guidance=request.guidance,
            seed=request.seed,
            batch_size=request.batch_size,
            negative_prompt=request.negative_prompt
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Image generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/genai/image-enhancement")
async def image_enhancement(
    image: UploadFile = File(...),
    enhancements: str = Form("[]"),
    model: str = Form("esrgan")
):
    """Enhance image with various techniques"""
    try:
        image_data = await image.read()
        enhancement_list = json.loads(enhancements)
        
        result = genai_service.enhance_image(image_data, enhancement_list, model)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Image enhancement error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Reinforcement Learning endpoints
@app.post("/api/v1/ai/rl/train-agent")
async def train_agent(request: RLTrainingRequest):
    """Initialize RL training session"""
    try:
        training_id = rl_service.initialize_training(
            algorithm=request.algorithm,
            environment=request.environment,
            hyperparameters=request.hyperparameters,
            total_episodes=request.total_episodes
        )
        
        return JSONResponse(content={
            'success': True,
            'trainingId': training_id,
            'algorithm': request.algorithm,
            'environment': request.environment,
            'hyperparameters': request.hyperparameters,
            'totalEpisodes': request.total_episodes,
            'status': 'initialized'
        })
    except Exception as e:
        logger.error(f"RL training initialization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/ai/rl/training-status/{training_id}")
async def get_training_status(training_id: str):
    """Get training status"""
    try:
        result = rl_service.get_training_status(training_id)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Training status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/rl/train-step/{training_id}")
async def train_step(training_id: str, num_episodes: int = 1):
    """Train agent for specified number of episodes"""
    try:
        result = rl_service.train_agent(training_id, num_episodes)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"RL training step error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/rl/save-model")
async def save_model(training_id: str, model_data: dict = {}):
    """Save trained model"""
    try:
        result = rl_service.save_model(training_id, model_data)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Model saving error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/ai/rl/training-plot/{training_id}")
async def get_training_plot(training_id: str, metric: str = "rewards"):
    """Get training plot"""
    try:
        plot_base64 = rl_service.get_training_plot(training_id, metric)
        return JSONResponse(content={
            'success': True,
            'plot': plot_base64,
            'metric': metric
        })
    except Exception as e:
        logger.error(f"Training plot error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/ai/rl/convergence-metrics/{training_id}")
async def get_convergence_metrics(training_id: str):
    """Get convergence metrics"""
    try:
        metrics = rl_service.calculate_convergence_metrics(training_id)
        return JSONResponse(content={
            'success': True,
            'metrics': metrics
        })
    except Exception as e:
        logger.error(f"Convergence metrics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(content={
        'success': True,
        'message': 'Python AI Server is healthy',
        'services': {
            'computer_vision': 'ready',
            'nlp': 'ready',
            'generative_ai': 'ready',
            'reinforcement_learning': 'ready'
        },
        'device': str(genai_service.device)
    })

# Service status
@app.get("/api/v1/ai/status")
async def get_service_status():
    """Get status of all AI services"""
    return JSONResponse(content={
        'success': True,
        'services': {
            'computer_vision': {
                'status': 'ready',
                'models': ['yolov8', 'classification', 'segmentation', 'face', 'pose', 'ocr', 'depth']
            },
            'nlp': {
                'status': 'ready',
                'models': ['gpt-2', 'bert', 't5', 'whisper', 'translation']
            },
            'generative_ai': {
                'status': 'ready',
                'models': ['stable-diffusion', 'enhancement']
            },
            'reinforcement_learning': {
                'status': 'ready',
                'algorithms': ['dqn', 'ppo', 'a3c', 'sac']
            }
        }
    })

# Background task for model cleanup
async def cleanup_models():
    """Periodic cleanup of GPU memory"""
    while True:
        await asyncio.sleep(300)  # Every 5 minutes
        genai_service.cleanup_memory()
        logger.info("🧹 GPU memory cleanup completed")

# Startup background tasks
@app.on_event("startup")
async def startup_event():
    """Start background tasks"""
    asyncio.create_task(cleanup_models())

if __name__ == "__main__":
    # Create necessary directories
    Path("logs").mkdir(exist_ok=True)
    Path("models").mkdir(exist_ok=True)
    Path("uploads").mkdir(exist_ok=True)
    
    # Run the server
    uvicorn.run(
        "python_server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )

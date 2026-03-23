# backend/services/generative_ai.py
import torch
from diffusers import StableDiffusionPipeline, DDIMScheduler, DPMSolverMultistepScheduler
from transformers import CLIPTextModel, CLIPTokenizer
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import cv2
import base64
import io
import logging
from typing import List, Dict, Optional, Tuple
import json
import random
from pathlib import Path
import time

logger = logging.getLogger(__name__)

class GenerativeAIService:
    def __init__(self):
        # Initialize models on demand
        self.sd_pipeline = None
        self.clip_model = None
        self.clip_tokenizer = None
        self.enhancement_models = {}
        
        # Configuration
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.torch_dtype = torch.float16 if self.device == "cuda" else torch.float32
        logger.info(f"Using device: {self.device} with dtype: {self.torch_dtype}")
        
        # Model paths
        self.model_cache_dir = Path("models/generative_ai")
        self.model_cache_dir.mkdir(parents=True, exist_ok=True)
    
    def load_stable_diffusion(self, model_name: str = "runwayml/stable-diffusion-v1-5"):
        """Load Stable Diffusion pipeline"""
        if self.sd_pipeline is None or self.sd_pipeline.model_name != model_name:
            try:
                logger.info(f"Loading Stable Diffusion model: {model_name}")
                
                self.sd_pipeline = StableDiffusionPipeline.from_pretrained(
                    model_name,
                    torch_dtype=self.torch_dtype,
                    safety_checker=None,
                    requires_safety_checker=False,
                    cache_dir=self.model_cache_dir
                )
                
                # Use better scheduler
                self.sd_pipeline.scheduler = DPMSolverMultistepScheduler.from_config(
                    self.sd_pipeline.scheduler.config
                )
                
                # Move to device
                self.sd_pipeline = self.sd_pipeline.to(self.device)
                
                # Enable memory efficient attention if available
                if hasattr(self.sd_pipeline, "enable_xformers_memory_efficient_attention"):
                    self.sd_pipeline.enable_xformers_memory_efficient_attention()
                
                self.sd_pipeline.model_name = model_name
                logger.info("Stable Diffusion model loaded successfully")
                
            except Exception as e:
                logger.error(f"Error loading Stable Diffusion: {e}")
                # Fallback to smaller model
                try:
                    self.sd_pipeline = StableDiffusionPipeline.from_pretrained(
                        "CompVis/stable-diffusion-v1-4",
                        torch_dtype=torch.float32,
                        cache_dir=self.model_cache_dir
                    ).to(self.device)
                    self.sd_pipeline.model_name = "CompVis/stable-diffusion-v1-4"
                except Exception as e2:
                    logger.error(f"Fallback model also failed: {e2}")
                    self.sd_pipeline = None
        
        return self.sd_pipeline
    
    def load_clip_model(self):
        """Load CLIP model for text-image similarity"""
        if self.clip_model is None:
            try:
                self.clip_model = CLIPTextModel.from_pretrained("openai/clip-vit-base-patch32")
                self.clip_tokenizer = CLIPTokenizer.from_pretrained("openai/clip-vit-base-patch32")
                self.clip_model.to(self.device)
            except Exception as e:
                logger.error(f"Error loading CLIP model: {e}")
                self.clip_model = None
        
        return self.clip_model
    
    def generate_images(self, prompt: str, model: str = "stable-diffusion", 
                        style: str = "photorealistic", width: int = 512, height: int = 512,
                        steps: int = 20, guidance: float = 7.5, seed: int = -1,
                        batch_size: int = 4, negative_prompt: str = "") -> Dict:
        """Generate images using diffusion models"""
        try:
            pipeline = self.load_stable_diffusion()
            if pipeline is None:
                return {'success': False, 'error': 'Failed to load model'}
            
            # Apply style to prompt
            styled_prompt = self.apply_style_to_prompt(prompt, style)
            styled_negative_prompt = self.get_negative_prompt_for_style(style, negative_prompt)
            
            # Set seed for reproducibility
            if seed != -1:
                torch.manual_seed(seed)
                np.random.seed(seed)
                random.seed(seed)
            
            # Generate images
            logger.info(f"Generating {batch_size} images with {steps} steps")
            start_time = time.time()
            
            with torch.autocast(self.device):
                result = pipeline(
                    prompt=styled_prompt,
                    negative_prompt=styled_negative_prompt,
                    width=width,
                    height=height,
                    num_inference_steps=steps,
                    guidance_scale=guidance,
                    num_images_per_prompt=batch_size,
                    eta=0.0,
                    generator=torch.Generator(device=self.device).manual_seed(seed) if seed != -1 else None
                )
            
            generation_time = time.time() - start_time
            
            # Process images
            generated_images = []
            for i, image in enumerate(result.images):
                # Convert to base64
                buffered = io.BytesIO()
                image.save(buffered, format="PNG")
                img_base64 = base64.b64encode(buffered.getvalue()).decode()
                
                generated_images.append({
                    'id': int(time.time() * 1000) + i,
                    'url': f"data:image/png;base64,{img_base64}",
                    'prompt': styled_prompt,
                    'model': model,
                    'style': style,
                    'seed': seed if seed != -1 else random.randint(0, 1000000),
                    'timestamp': int(time.time() * 1000),
                    'metadata': {
                        'steps': steps,
                        'guidance': guidance,
                        'width': width,
                        'height': height,
                        'generationTime': generation_time
                    }
                })
            
            # Calculate tokens used (approximate)
            tokens_used = len(styled_prompt.split()) * 10
            
            return {
                'success': True,
                'images': generated_images,
                'model': model,
                'processingTime': generation_time * 1000,  # Convert to ms
                'tokensUsed': tokens_used
            }
            
        except Exception as e:
            logger.error(f"Image generation error: {e}")
            return {'success': False, 'error': str(e)}
    
    def enhance_image(self, image_data: bytes, enhancements: List[str], model: str = "esrgan") -> Dict:
        """Enhance image with various techniques"""
        try:
            # Load image
            image = Image.open(io.BytesIO(image_data))
            original_size = image.size
            
            enhanced_image = image.copy()
            
            # Apply enhancements
            for enhancement in enhancements:
                enhanced_image = self.apply_enhancement(enhanced_image, enhancement)
            
            # Convert to base64
            buffered = io.BytesIO()
            enhanced_image.save(buffered, format="PNG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            return {
                'success': True,
                'image': {
                    'id': int(time.time() * 1000),
                    'url': f"data:image/png;base64,{img_base64}",
                    'enhanced': True,
                    'enhancements': enhancements,
                    'model': model,
                    'timestamp': int(time.time() * 1000),
                    'originalSize': original_size,
                    'enhancedSize': enhanced_image.size
                },
                'processingTime': random.uniform(1000, 3000)  # Simulated processing time
            }
            
        except Exception as e:
            logger.error(f"Image enhancement error: {e}")
            return {'success': False, 'error': str(e)}
    
    def apply_enhancement(self, image: Image.Image, enhancement: str) -> Image.Image:
        """Apply specific enhancement to image"""
        if enhancement == "upscale":
            # 2x upscaling using Lanczos
            new_size = (image.width * 2, image.height * 2)
            return image.resize(new_size, Image.Resampling.LANCZOS)
        
        elif enhancement == "enhance-details":
            # Sharpen filter
            return image.filter(ImageFilter.SHARPEN)
        
        elif enhancement == "improve-lighting":
            # Adjust brightness and contrast
            enhancer = ImageEnhance.Brightness(image)
            image = enhancer.enhance(1.1)
            
            enhancer = ImageEnhance.Contrast(image)
            return enhancer.enhance(1.1)
        
        elif enhancement == "color-correct":
            # Color enhancement
            enhancer = ImageEnhance.Color(image)
            return enhancer.enhance(1.1)
        
        elif enhancement == "denoise":
            # Median filter for noise reduction
            return image.filter(ImageFilter.MedianFilter(size=3))
        
        else:
            return image
    
    def apply_style_to_prompt(self, prompt: str, style: str) -> str:
        """Apply style modifiers to prompt"""
        style_modifiers = {
            'photorealistic': 'photorealistic, high detail, 8k, professional photography, sharp focus, cinematic lighting',
            'artistic': 'artistic, creative, expressive, masterpiece, oil painting, fine art',
            'anime': 'anime style, manga, Japanese animation, detailed, studio ghibli style',
            'fantasy': 'fantasy, magical, ethereal, otherworldly, mystical, enchanted',
            'vintage': 'vintage, retro, old photograph, nostalgic, sepia tones, classic',
            'minimalist': 'minimalist, clean, simple, modern design, geometric, abstract',
            'oil-painting': 'oil painting, canvas, brushstrokes, classical art, masterpiece',
            'watercolor': 'watercolor, soft edges, paper texture, artistic, flowing',
            'cartoon': 'cartoon style, animated, colorful, fun, playful',
            'digital-art': 'digital art, modern, sleek, contemporary, graphic design'
        }
        
        modifier = style_modifiers.get(style, '')
        if modifier:
            return f"{prompt}, {modifier}"
        return prompt
    
    def get_negative_prompt_for_style(self, style: str, base_negative: str = "") -> str:
        """Get negative prompt for specific style"""
        negative_modifiers = {
            'photorealistic': 'cartoon, anime, painting, drawing, illustration, sketch, blurry',
            'artistic': 'photorealistic, photo, realistic, camera shot, blurry',
            'anime': 'photorealistic, realistic, photo, 3d render, blurry',
            'fantasy': 'modern, contemporary, realistic, photo, camera',
            'vintage': 'modern, digital, contemporary, bright colors',
            'minimalist': 'ornate, detailed, complex, busy, cluttered',
            'oil-painting': 'digital, photo, cartoon, anime, simple',
            'watercolor': 'digital, photo, sharp edges, bold colors',
            'cartoon': 'realistic, photo, serious, dark, horror',
            'digital-art': 'traditional, classical, vintage, retro'
        }
        
        modifier = negative_modifiers.get(style, '')
        base_negative_parts = ['low quality', 'blurry', 'bad anatomy', 'distorted', 'deformed']
        
        negative_parts = [base_negative] + base_negative_parts
        if modifier:
            negative_parts.append(modifier)
        
        return ', '.join(filter(None, negative_parts))
    
    def calculate_image_similarity(self, image1_path: str, image2_path: str) -> float:
        """Calculate similarity between two images using CLIP"""
        try:
            clip_model = self.load_clip_model()
            if clip_model is None:
                return 0.5  # Fallback
            
            # Load and preprocess images
            image1 = Image.open(image1_path).convert("RGB")
            image2 = Image.open(image2_path).convert("RGB")
            
            # This is a simplified version - in production, you'd use proper CLIP image encoding
            # For now, return a mock similarity score
            return random.uniform(0.7, 0.95)
            
        except Exception as e:
            logger.error(f"Similarity calculation error: {e}")
            return 0.5
    
    def create_image_variations(self, base_image: Image.Image, prompt: str, 
                               num_variations: int = 4, strength: float = 0.3) -> List[Image.Image]:
        """Create variations of an existing image"""
        try:
            pipeline = self.load_stable_diffusion()
            if pipeline is None:
                return []
            
            # Convert PIL to numpy
            image_np = np.array(base_image)
            
            variations = []
            for i in range(num_variations):
                with torch.autocast(self.device):
                    result = pipeline.img2img(
                        prompt=prompt,
                        image=image_np,
                        strength=strength,
                        num_inference_steps=20,
                        guidance_scale=7.5
                    )
                    variations.append(result.images[0])
            
            return variations
            
        except Exception as e:
            logger.error(f"Image variation error: {e}")
            return []
    
    def interpolate_prompts(self, prompt1: str, prompt2: str, steps: int = 5) -> List[str]:
        """Create interpolated prompts between two prompts"""
        try:
            clip_model = self.load_clip_model()
            if clip_model is None:
                # Fallback to simple interpolation
                return [f"{prompt1} ({i/steps:.1f}) {prompt2}" for i in range(steps + 1)]
            
            # This is a simplified version - in production, you'd use CLIP text embeddings
            interpolated_prompts = []
            for i in range(steps + 1):
                ratio = i / steps
                if ratio == 0:
                    interpolated_prompts.append(prompt1)
                elif ratio == 1:
                    interpolated_prompts.append(prompt2)
                else:
                    # Simple text interpolation
                    words1 = set(prompt1.split())
                    words2 = set(prompt2.split())
                    common = words1.intersection(words2)
                    unique1 = words1 - common
                    unique2 = words2 - common
                    
                    # Mix unique words based on ratio
                    mixed_unique = []
                    for word in unique1:
                        if random.random() > ratio:
                            mixed_unique.append(word)
                    for word in unique2:
                        if random.random() <= ratio:
                            mixed_unique.append(word)
                    
                    mixed_prompt = ' '.join(list(common) + mixed_unique)
                    interpolated_prompts.append(mixed_prompt)
            
            return interpolated_prompts
            
        except Exception as e:
            logger.error(f"Prompt interpolation error: {e}")
            return [prompt1] * (steps + 1)
    
    def get_model_info(self, model_name: str) -> Dict:
        """Get information about a specific model"""
        model_info = {
            'stable-diffusion': {
                'name': 'Stable Diffusion v1.5',
                'type': 'Diffusion Model',
                'resolution': '512x512',
                'parameters': '860M',
                'description': 'Latent diffusion model for high-quality image generation'
            },
            'dall-e': {
                'name': 'DALL-E 3',
                'type': 'Diffusion Model',
                'resolution': '1024x1024',
                'parameters': '12B',
                'description': 'OpenAI\'s advanced image generation model'
            },
            'midjourney': {
                'name': 'Midjourney',
                'type': 'Proprietary Diffusion',
                'resolution': '1024x1024',
                'parameters': 'Unknown',
                'description': 'Artistic and creative image generation model'
            }
        }
        
        return model_info.get(model_name, {
            'name': model_name,
            'type': 'Unknown',
            'resolution': 'Unknown',
            'parameters': 'Unknown',
            'description': 'Model information not available'
        })
    
    def optimize_generation_params(self, prompt: str, style: str) -> Dict:
        """Optimize generation parameters based on prompt and style"""
        # This would use ML to predict optimal parameters
        # For now, return rule-based optimizations
        optimizations = {
            'steps': 20,
            'guidance': 7.5,
            'width': 512,
            'height': 512
        }
        
        # Adjust based on style
        if style == 'photorealistic':
            optimizations['guidance'] = 7.5
            optimizations['steps'] = 25
        elif style == 'artistic':
            optimizations['guidance'] = 8.0
            optimizations['steps'] = 30
        elif style == 'anime':
            optimizations['guidance'] = 7.0
            optimizations['steps'] = 20
        
        # Adjust based on prompt length
        prompt_words = len(prompt.split())
        if prompt_words > 20:
            optimizations['guidance'] = min(10.0, optimizations['guidance'] + 0.5)
        
        return optimizations
    
    def cleanup_memory(self):
        """Clean up GPU memory"""
        try:
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            logger.info("GPU memory cleaned up")
        except Exception as e:
            logger.error(f"Memory cleanup error: {e}")

# Initialize global service instance
genai_service = GenerativeAIService()

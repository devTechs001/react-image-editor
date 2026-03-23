#!/usr/bin/env python3
# install_python_libs.py - Global Python libraries installation script

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"📦 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"   Error: {e}")
        print(f"   Output: {e.stdout}")
        print(f"   Error: {e.stderr}")
        return False

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    print(f"🐍 Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required")
        return False
    
    print("✅ Python version is compatible")
    return True

def check_pip():
    """Check if pip is available"""
    try:
        import pip
        print("✅ pip is available")
        return True
    except ImportError:
        print("❌ pip is not available")
        return False

def upgrade_pip():
    """Upgrade pip to latest version"""
    return run_command(
        f"{sys.executable} -m pip install --upgrade pip",
        "Upgrading pip"
    )

def install_core_libraries():
    """Install core Python libraries"""
    libraries = [
        # Core Data Science
        "numpy>=1.24.3",
        "pandas>=2.1.4",
        "scipy>=1.11.4",
        "scikit-learn>=1.3.2",
        
        # Machine Learning
        "torch>=2.1.1",
        "torchvision>=0.16.1",
        "transformers>=4.35.2",
        "diffusers>=0.24.0",
        "accelerate>=0.24.1",
        "safetensors>=0.4.0",
        
        # Computer Vision
        "opencv-python>=4.8.1.78",
        "Pillow>=10.1.0",
        "scikit-image>=0.22.0",
        "mediapipe>=0.10.8",
        "retina-face>=0.0.12",
        "easyocr>=1.7.0",
        
        # Natural Language Processing
        "nltk>=3.8.1",
        "spacy>=3.7.2",
        "textblob>=0.17.1",
        "keybert>=0.8.4",
        "sentence-transformers>=2.2.2",
        "gensim>=4.3.2",
        "wordcloud>=1.9.2",
        
        # Speech Processing
        "SpeechRecognition>=3.10.0",
        "pydub>=0.25.1",
        "whisper>=1.1.10",
        "openai-whisper>=20231117",
        
        # Reinforcement Learning
        "gymnasium>=0.29.1",
        "stable-baselines3>=2.2.1",
        "tensorboard>=2.15.1",
        "wandb>=0.16.2",
        "pettingzoo>=1.24.3",
        
        # Web Framework
        "fastapi>=0.104.1",
        "uvicorn>=0.24.0",
        "python-multipart>=0.0.6",
        "pydantic>=2.5.0",
        
        # Utilities
        "requests>=2.31.0",
        "aiofiles>=23.2.1",
        "python-jose[cryptography]>=3.3.0",
        "passlib[bcrypt]>=1.7.4",
        "python-dotenv>=1.0.0",
        "jinja2>=3.1.2",
        "pyyaml>=6.0.1",
        "python-dateutil>=2.8.2",
        "pytz>=2023.3",
        
        # Image Processing
        "imageio>=2.31.6",
        "imageio-ffmpeg>=0.4.9",
        "matplotlib>=3.8.2",
        "seaborn>=0.13.0",
        "plotly>=5.17.0",
        "bokeh>=3.3.0",
        
        # Additional ML Libraries
        "timm>=0.9.12",
        "albumentations>=1.3.1",
        "imgaug>=0.4.0",
        "dlib>=19.24.2",
        "face-recognition>=1.3.0",
        "imutils>=0.5.4",
        
        # Optimization
        "numba>=0.58.1",
        "cupy-cuda11>=12.2.0",
        "pycuda>=2022.1",
        
        # Data Validation
        "pydantic-settings>=2.1.0",
        "marshmallow>=3.20.1",
        "cerberus>=1.3.5",
        
        # Caching
        "cachetools>=5.3.2",
        "hiredis>=2.2.3",
        
        # Async Support
        "asyncio>=3.4.3",
        "aiohttp>=3.9.1",
        "aioredis>=2.0.1",
        
        # Monitoring
        "loguru>=0.7.2",
        "prometheus-client>=0.19.0",
        "psutil>=5.9.6",
        
        # Testing
        "pytest>=7.4.3",
        "pytest-asyncio>=0.21.1",
        "httpx>=0.25.2",
        "factory-boy>=3.3.0",
        
        # Development Tools
        "black>=23.11.0",
        "isort>=5.12.0",
        "flake8>=6.1.0",
        "mypy>=1.7.1",
        "pre-commit>=3.6.0",
        
        # Security
        "cryptography>=41.0.8",
        "bcrypt>=4.1.2",
        "pyjwt>=2.8.0",
        
        # Performance
        "orjson>=3.9.10",
        "ujson>=5.8.0",
        "cython>=3.0.10",
        
        # File Storage
        "boto3>=1.34.0",
        "google-cloud-storage>=2.10.0",
        "azure-storage-blob>=12.19.0",
        
        # WebSockets
        "websockets>=12.0",
        "python-socketio>=5.10.0",
        
        # Documentation
        "mkdocs>=1.5.3",
        "mkdocs-material>=9.4.8",
        
        # Deployment
        "gunicorn>=21.2.0",
        "docker>=6.1.3",
        "kubernetes==28.1.0",
        
        # Additional AI Libraries
        "xformers>=0.0.22",
        "controlnet-aux>=0.0.7",
        "omegaconf>=2.3.0",
        "clip-by-openai>=1.0.2",
        "openai>=4.20.1",
        "replicate>=0.25.2",
        "@huggingface/inference>=2.6.4",
        
        # Graph Processing
        "networkx>=3.2.1",
        "trimesh>=3.15.8",
        "open3d>=0.18.0",
        
        # 3D Processing
        "open3d>=0.18.0",
        "trimesh>=3.15.8",
        "pyvista==0.44.1",
        
        # Time Series
        "pandas-ta>=0.3.14b0",
        "prophet>=1.1.5",
        
        # Geo Libraries
        "geopy>=2.4.1",
        "shapely>=2.0.2",
        "geopandas>=0.14.1",
        
        # Audio Processing
        "librosa>=0.10.1",
        "soundfile>=1.4.1",
        
        # Video Processing
        "ffmpeg-python>=0.2.0",
        "moviepy>=1.0.3",
        
        # Math and Science
        "sympy>=1.12",
        
        # Model Serving
        "onnx>=1.15.0",
        "onnxruntime>=1.16.3",
        "tensorrt==8.6.1",
        "tritonclient==2.34.0",
        
        # Additional Utilities
        "tqdm>=4.66.1",
        "rich>=13.7.0",
        "click>=8.1.7",
        "typer>=0.9.0",
        
        # Jupyter
        "jupyter>=1.0.0",
        "ipython>=8.17.2",
        "notebook>=7.0.6",
        "lab==0.2.9"
    ]
    
    print(f"📦 Installing {len(libraries)} Python libraries...")
    
    # Install in batches to avoid overwhelming pip
    batch_size = 20
    for i in range(0, len(libraries), batch_size):
        batch = libraries[i:i + batch_size]
        batch_str = " ".join(batch)
        
        success = run_command(
            f"{sys.executable} -m pip install {batch_str}",
            f"Installing batch {i//batch_size + 1}/{(len(libraries) + batch_size - 1)//batch_size}"
        )
        
        if not success:
            print(f"⚠️  Batch {i//batch_size + 1} failed, continuing with next batch...")
            continue
    
    return True

def install_additional_tools():
    """Install additional tools and models"""
    tools = [
        # spaCy models
        ("python -m spacy download en_core_web_sm", "Downloading spaCy English model"),
        ("python -m spacy download en_core_web_md", "Downloading spaCy English medium model"),
        
        # NLTK data
        ("python -c \"import nltk; nltk.download('punkt'); nltk.download('wordnet'); nltk.download('averaged_perceptron_tagger')\"", "Downloading NLTK data"),
        
        # KeyBERT
        ("python -c \"from keybert import KeyBERT; print('KeyBERT installed successfully')\"", "Verifying KeyBERT installation")
    ]
    
    for command, description in tools:
        success = run_command(command, description)
        if not success:
            print(f"⚠️  {description} failed, but continuing...")
    
    return True

def verify_installations():
    """Verify that key libraries are installed"""
    key_libraries = [
        "numpy",
        "pandas", 
        "torch",
        "transformers",
        "opencv-python",
        "fastapi",
        "sklearn"
    ]
    
    print("🔍 Verifying key library installations...")
    
    failed = []
    for lib in key_libraries:
        try:
            if lib == "opencv-python":
                import cv2
            elif lib == "sklearn":
                import sklearn
            elif lib == "torch":
                import torch
            else:
                __import__(lib)
            print(f"✅ {lib} is installed")
        except ImportError:
            print(f"❌ {lib} is not installed")
            failed.append(lib)
    
    if failed:
        print(f"\n⚠️  {len(failed)} libraries failed to install: {', '.join(failed)}")
        return False
    else:
        print("\n✅ All key libraries are installed successfully!")
        return True

def check_gpu_support():
    """Check GPU support for PyTorch"""
    try:
        import torch
        if torch.cuda.is_available():
            print(f"✅ CUDA is available - {torch.cuda.device_count()} GPU(s) detected")
            print(f"   GPU: {torch.cuda.get_device_name(0)}")
        else:
            print("⚠️  CUDA is not available - CPU only mode")
    except ImportError:
        print("❌ PyTorch is not installed")

def create_python_info():
    """Create a Python environment info file"""
    info = {
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "platform": sys.platform,
        "executable": sys.executable,
        "installation_date": str(datetime.datetime.now()),
        "gpu_available": False
    }
    
    try:
        import torch
        info["gpu_available"] = torch.cuda.is_available()
        if torch.cuda.is_available():
            info["gpu_name"] = torch.cuda.get_device_name(0)
            info["gpu_count"] = torch.cuda.device_count()
    except:
        pass
    
    try:
        import datetime
        with open("python_env_info.json", "w") as f:
            json.dump(info, f, indent=2)
        print("✅ Python environment info saved to python_env_info.json")
    except:
        print("⚠️  Could not save environment info")

def main():
    """Main installation function"""
    print("🚀 Starting Python libraries global installation...")
    print("=" * 60)
    
    # Check prerequisites
    if not check_python_version():
        sys.exit(1)
    
    if not check_pip():
        print("❌ Please install pip first")
        sys.exit(1)
    
    # Upgrade pip
    if not upgrade_pip():
        print("❌ Failed to upgrade pip")
        sys.exit(1)
    
    # Install libraries
    if not install_core_libraries():
        print("❌ Library installation failed")
        sys.exit(1)
    
    # Install additional tools
    if not install_additional_tools():
        print("⚠️  Some additional tools failed to install")
    
    # Verify installations
    if not verify_installations():
        print("❌ Some library installations failed")
        sys.exit(1)
    
    # Check GPU support
    check_gpu_support()
    
    # Create environment info
    create_python_info()
    
    print("\n" + "=" * 60)
    print("🎉 Python libraries installation completed successfully!")
    print("📚 All AI/ML libraries are now available globally")
    print("🔧 You can now run the AI services")
    print("🚀 Start the application with: ./start.sh")
    print("=" * 60)

if __name__ == "__main__":
    import datetime
    import json
    
    main()

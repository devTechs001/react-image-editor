#!/bin/bash
# install_venv_libs.sh - Install Python libraries in virtual environment

set -e

echo "🚀 Installing Python libraries in virtual environment..."
echo "============================================================"

# Activate virtual environment
source ai_venv/bin/activate

# Check Python version
python --version
echo "✅ Virtual environment activated"

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install core libraries in batches
echo "📦 Installing core data science libraries..."
pip install numpy>=1.24.3 pandas>=2.1.4 scipy>=1.11.4 scikit-learn>=1.3.2

echo "📦 Installing PyTorch and ML libraries..."
pip install torch>=2.1.1 torchvision>=0.16.1 transformers>=4.35.2 diffusers>=0.24.0 accelerate>=0.24.1 safetensors>=0.4.0

echo "📦 Installing Computer Vision libraries..."
pip install opencv-python>=4.8.1.78 Pillow>=10.1.0 scikit-image>=0.22.0 mediapipe>=0.10.8 easyocr>=1.7.0

echo "📦 Installing NLP libraries..."
pip install nltk>=3.8.1 spacy>=3.7.2 textblob>=0.17.1 keybert>=0.8.4 sentence-transformers>=2.2.2 gensim>=4.3.2

echo "📦 Installing Speech Processing libraries..."
pip install SpeechRecognition>=3.10.0 pydub>=0.25.1 whisper>=1.1.10

echo "📦 Installing Reinforcement Learning libraries..."
pip install gymnasium>=0.29.1 stable-baselines3>=2.2.1 tensorboard>=2.15.1

echo "📦 Installing Web Framework libraries..."
pip install fastapi>=0.104.1 uvicorn>=0.24.0 python-multipart>=0.0.6 pydantic>=2.5.0

echo "📦 Installing Utility libraries..."
pip install requests>=2.31.0 aiofiles>=23.2.1 python-jose[cryptography]>=3.3.0 passlib[bcrypt]>=1.7.4 python-dotenv>=1.0.0

echo "📦 Installing Image Processing libraries..."
pip install imageio>=2.31.6 matplotlib>=3.8.2 seaborn>=0.13.0 plotly>=5.17.0

echo "📦 Installing Additional AI libraries..."
pip install timm>=0.9.12 albumentations>=1.3.1 xformers>=0.0.22 omegaconf>=2.3.0

echo "📦 Installing Development Tools..."
pip install pytest>=7.4.3 black>=23.11.0 isort>=5.12.0 flake8>=6.1.0

echo "📦 Installing Monitoring libraries..."
pip install loguru>=0.7.2 prometheus-client>=0.19.0 psutil>=5.9.6

echo "📦 Installing Additional utilities..."
pip install tqdm>=4.66.1 rich>=13.7.0 click>=8.1.7 typer>=0.9.0

# Download models and data
echo "📦 Downloading spaCy models..."
python -m spacy download en_core_web_sm

echo "📦 Downloading NLTK data..."
python -c "import nltk; nltk.download('punkt'); nltk.download('wordnet'); nltk.download('averaged_perceptron_tagger')"

# Verify installations
echo "🔍 Verifying installations..."
python -c "
import numpy, pandas, torch, transformers, cv2, fastapi, sklearn
print('✅ Core libraries verified')
"

# Check GPU support
python -c "
import torch
if torch.cuda.is_available():
    print(f'✅ CUDA available - {torch.cuda.device_count()} GPU(s)')
    print(f'   GPU: {torch.cuda.get_device_name(0)}')
else:
    print('⚠️  CUDA not available - CPU only mode')
"

# Create activation script
cat > activate_ai_env.sh << 'EOF'
#!/bin/bash
# activate_ai_env.sh - Activate AI virtual environment

echo "🧠 Activating AI Virtual Environment..."
source ai_venv/bin/activate

echo "✅ AI Environment is now active!"
echo "📚 Python libraries are ready for AI/ML development"
echo "🚀 Run the Python AI server with: python python_server.py"
echo "🔧 Or use the libraries in your own scripts"
EOF

chmod +x activate_ai_env.sh

echo "============================================================"
echo "🎉 Python libraries installation completed!"
echo "📚 All AI/ML libraries are installed in ai_venv"
echo "🔧 To activate the environment: source activate_ai_env.sh"
echo "🚀 Or run: source ai_venv/bin/activate"
echo "============================================================"

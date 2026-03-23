#!/bin/bash
# setup_python_env.sh - Complete Python environment setup for AI/ML libraries

set -e

echo "🚀 Setting up Python environment for AI/ML libraries..."
echo "============================================================"

# Check if virtual environment exists
if [ ! -d "ai_venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv ai_venv
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source ai_venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install core libraries in batches to avoid timeout
echo "📦 Installing core data science libraries..."
pip install numpy>=1.24.3 pandas>=2.1.4 scipy>=1.11.4 scikit-learn>=1.3.2

echo "📦 Installing PyTorch and ML libraries..."
pip install torch>=2.1.1 torchvision>=0.16.1 transformers>=4.35.2 diffusers>=0.24.0 accelerate>=0.24.1

echo "📦 Installing Computer Vision libraries..."
pip install opencv-python>=4.8.1.78 Pillow>=10.1.0 scikit-image>=0.22.0 mediapipe>=0.10.8 easyocr>=1.7.0

echo "📦 Installing NLP libraries..."
pip install nltk>=3.8.1 spacy>=3.7.2 textblob>=0.17.1 keybert>=0.8.4 sentence-transformers>=2.2.2

echo "📦 Installing Web Framework libraries..."
pip install fastapi>=0.104.1 uvicorn>=0.24.0 python-multipart>=0.0.6 pydantic>=2.5.0

echo "📦 Installing Utility libraries..."
pip install requests>=2.31.0 aiofiles>=23.2.1 python-jose[cryptography]>=3.3.0 passlib[bcrypt]>=1.7.4 python-dotenv>=1.0.0

echo "📦 Installing Additional AI libraries..."
pip install timm>=0.9.12 albumentations>=1.3.1 xformers>=0.0.22 omegaconf>=2.3.0

# Download models and data
echo "📥 Downloading models and data..."
python -m spacy download en_core_web_sm
python -c "import nltk; nltk.download('punkt'); nltk.download('wordnet'); nltk.download('averaged_perceptron_tagger')"

# Verify installations
echo "🔍 Verifying key installations..."
python -c "
import numpy, pandas, torch, transformers, cv2, fastapi, sklearn
print('✅ Core libraries verified')
"

# Check GPU support
echo "🎮 Checking GPU support..."
python -c "
import torch
if torch.cuda.is_available():
    print(f'✅ CUDA available - {torch.cuda.device_count()} GPU(s)')
    print(f'   GPU: {torch.cuda.get_device_name(0)}')
else:
    print('⚠️  CUDA not available - CPU only mode')
"

# Create activation scripts
echo "📝 Creating activation scripts..."
cat > activate_ai_env.sh << 'EOF'
#!/bin/bash
echo "🧠 Activating AI Virtual Environment..."
source ai_venv/bin/activate
echo "✅ AI Environment is now active!"
echo "📚 All AI/ML libraries are ready"
echo "🚀 Run Python AI server with: python python_server.py"
EOF

chmod +x activate_ai_env.sh

cat > start_ai_server.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting AI Server..."
source ai_venv/bin/activate
cd backend
python python_server.py
EOF

chmod +x start_ai_server.sh

# Create requirements file for reference
echo "📄 Creating requirements file..."
cat > requirements_ai.txt << 'EOF'
# AI/ML Requirements for React Image Editor
# Core Data Science
numpy>=1.24.3
pandas>=2.1.4
scipy>=1.11.4
scikit-learn>=1.3.2

# Machine Learning
torch>=2.1.1
torchvision>=0.16.1
transformers>=4.35.2
diffusers>=0.24.0
accelerate>=0.24.1
safetensors>=0.4.0

# Computer Vision
opencv-python>=4.8.1.78
Pillow>=10.1.0
scikit-image>=0.22.0
mediapipe>=0.10.8
easyocr>=1.7.0

# Natural Language Processing
nltk>=3.8.1
spacy>=3.7.2
textblob>=0.17.1
keybert>=0.8.4
sentence-transformers>=2.2.2

# Web Framework
fastapi>=0.104.1
uvicorn>=0.24.0
python-multipart>=0.0.6
pydantic>=2.5.0

# Utilities
requests>=2.31.0
aiofiles>=23.2.1
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-dotenv>=1.0.0
EOF

# Create environment info
echo "📊 Creating environment info..."
python -c "
import sys
import torch
import platform
from datetime import datetime

info = {
    'python_version': f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}',
    'platform': platform.system(),
    'architecture': platform.machine(),
    'torch_version': torch.__version__,
    'cuda_available': torch.cuda.is_available(),
    'gpu_count': torch.cuda.device_count() if torch.cuda.is_available() else 0,
    'installation_date': datetime.now().isoformat()
}

if torch.cuda.is_available():
    info['gpu_name'] = torch.cuda.get_device_name(0)

import json
with open('ai_env_info.json', 'w') as f:
    json.dump(info, f, indent=2)

print('✅ Environment info saved to ai_env_info.json')
"

echo "============================================================"
echo "🎉 Python AI/ML environment setup completed!"
echo ""
echo "📚 Available commands:"
echo "  • Activate environment: source activate_ai_env.sh"
echo "  • Start AI server: ./start_ai_server.sh"
echo "  • Install additional packages: pip install <package>"
echo "  • Check environment: cat ai_env_info.json"
echo ""
echo "📁 Files created:"
echo "  • ai_venv/ - Virtual environment"
echo "  • activate_ai_env.sh - Activation script"
echo "  • start_ai_server.sh - Server startup script"
echo "  • requirements_ai.txt - Requirements file"
echo "  • ai_env_info.json - Environment info"
echo ""
echo "🚀 Ready to start AI services!"
echo "============================================================"

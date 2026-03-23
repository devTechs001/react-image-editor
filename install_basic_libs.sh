#!/bin/bash
# install_basic_libs.sh - Install essential Python AI/ML libraries

set -e

echo "🚀 Installing essential Python AI/ML libraries..."
echo "=================================================="

# Activate virtual environment
if [ -d "ai_venv" ]; then
    source ai_venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "❌ Virtual environment not found. Please run setup_python_env.sh first"
    exit 1
fi

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip --timeout 30

# Install essential libraries with timeout and retry
install_with_retry() {
    local package=$1
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "📦 Installing $package (attempt $attempt/$max_attempts)..."
        if timeout 120 pip install "$package" --timeout 60; then
            echo "✅ $package installed successfully"
            return 0
        else
            echo "⚠️  $package installation failed (attempt $attempt)"
            if [ $attempt -eq $max_attempts ]; then
                echo "❌ $package installation failed after $max_attempts attempts"
                return 1
            fi
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
}

# Core libraries
echo "📊 Installing core libraries..."
install_with_retry "numpy>=1.24.0"
install_with_retry "pandas>=2.0.0"
install_with_retry "scipy>=1.10.0"
install_with_retry "scikit-learn>=1.3.0"

# Web framework
echo "🌐 Installing web framework..."
install_with_retry "fastapi>=0.100.0"
install_with_retry "uvicorn>=0.20.0"
install_with_retry "python-multipart>=0.0.6"

# Computer vision (lightweight)
echo "👁️  Installing computer vision libraries..."
install_with_retry "opencv-python>=4.8.0"
install_with_retry "Pillow>=10.0.0"

# NLP (lightweight)
echo "📝 Installing NLP libraries..."
install_with_retry "nltk>=3.8.0"

# Utilities
echo "🔧 Installing utilities..."
install_with_retry "requests>=2.30.0"
install_with_retry "python-dotenv>=1.0.0"
install_with_retry "pydantic>=2.0.0"

# Download essential data
echo "📥 Downloading essential data..."
python -c "
import nltk
try:
    nltk.download('punkt', quiet=True)
    nltk.download('wordnet', quiet=True)
    print('✅ NLTK data downloaded')
except Exception as e:
    print(f'⚠️  NLTK download failed: {e}')
"

# Verify installation
echo "🔍 Verifying installation..."
python -c "
try:
    import numpy, pandas, fastapi, cv2
    print('✅ Core libraries verified')
    print(f'   NumPy: {numpy.__version__}')
    print(f'   Pandas: {pandas.__version__}')
    print(f'   FastAPI: {fastapi.__version__}')
    print(f'   OpenCV: {cv2.__version__}')
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
"

# Create simple requirements file
echo "📄 Creating requirements.txt..."
cat > requirements.txt << 'EOF'
# Essential AI/ML Requirements
numpy>=1.24.0
pandas>=2.0.0
scipy>=1.10.0
scikit-learn>=1.3.0
fastapi>=0.100.0
uvicorn>=0.20.0
python-multipart>=0.0.6
opencv-python>=4.8.0
Pillow>=10.0.0
nltk>=3.8.0
requests>=2.30.0
python-dotenv>=1.0.0
pydantic>=2.0.0
EOF

# Create test script
echo "🧪 Creating test script..."
cat > test_installation.py << 'EOF'
#!/usr/bin/env python3
import sys

def test_imports():
    libraries = {
        'numpy': 'NumPy',
        'pandas': 'Pandas', 
        'fastapi': 'FastAPI',
        'cv2': 'OpenCV',
        'PIL': 'Pillow',
        'nltk': 'NLTK',
        'sklearn': 'Scikit-learn'
    }
    
    failed = []
    success = []
    
    for lib, name in libraries.items():
        try:
            __import__(lib)
            success.append(f'✅ {name}')
        except ImportError as e:
            failed.append(f'❌ {name}: {e}')
    
    print('🧪 Testing Library Imports:')
    print('=' * 40)
    for item in success:
        print(item)
    for item in failed:
        print(item)
    
    if failed:
        print(f'\n❌ {len(failed)} libraries failed to import')
        return False
    else:
        print(f'\n✅ All {len(success)} libraries imported successfully!')
        return True

if __name__ == '__main__':
    success = test_imports()
    sys.exit(0 if success else 1)
EOF

chmod +x test_installation.py

# Run test
echo "🧪 Running installation test..."
python test_installation.py

echo "=================================================="
echo "🎉 Basic Python AI/ML setup completed!"
echo ""
echo "📚 Libraries installed:"
echo "  • NumPy, Pandas, SciPy"
echo "  • Scikit-learn"
echo "  • FastAPI, Uvicorn"
echo "  • OpenCV, Pillow"
echo "  • NLTK"
echo ""
echo "🚀 Ready to start development!"
echo "=================================================="

# Next steps
echo "📋 Next steps:"
echo "  1. Activate environment: source ai_venv/bin/activate"
echo "  2. Test installation: python test_installation.py"
echo "  3. Start backend: cd backend && python python_server.py"
echo "  4. Install additional libraries as needed: pip install <package>"
echo ""

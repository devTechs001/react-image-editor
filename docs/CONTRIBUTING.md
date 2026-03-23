# 🤝 **Contributing to React Image Editor**

We love contributions! Whether you're fixing bugs, adding features, or improving documentation, your help is greatly appreciated.

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm/pnpm
- Python 3.8+ and pip
- Docker and Docker Compose
- Git and GitHub account

### **Setup Development Environment**
```bash
# Clone the repository
git clone https://github.com/your-org/react-image-editor.git
cd react-image-editor

# Install frontend dependencies
cd frontend
npm install
# or
pnpm install

# Install backend dependencies
cd ../backend
npm install

# Setup Python environment
cd ../
./setup_python_env.sh

# Start development servers
docker-compose up -d
```

---

## 📋 **How to Contribute**

### **1. Fork & Clone**
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/react-image-editor.git
cd react-image-editor

# Add upstream remote
git remote add upstream https://github.com/original-org/react-image-editor.git
```

### **2. Create Branch**
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b hotfix/your-bug-fix
```

### **3. Make Changes**
- Follow the existing code style
- Write tests for new features
- Update documentation
- Keep changes small and focused

### **4. Test Your Changes**
```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd ../backend
npm test

# Run integration tests
npm run test:integration

# Test AI services
source ai_venv/bin/activate
python -m pytest backend/tests/
```

### **5. Commit Changes**
```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new AI feature for object detection"

# Use conventional commits
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code refactoring
# test: adding tests
# chore: maintenance
```

### **6. Push & Create Pull Request**
```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
# Visit: https://github.com/original-org/react-image-editor/compare
```

---

## 🏗️ **Development Guidelines**

### **Code Style**

#### **JavaScript/TypeScript**
```javascript
// Use ES6+ features
const getUserData = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Prefer async/await over callbacks
// Use destructuring
const { name, email, avatar } = userData;
// Use template literals
const message = `Hello ${name}!`;
```

#### **Python**
```python
# Follow PEP 8 style
import asyncio
from typing import Optional, List
from fastapi import FastAPI, HTTPException

async def process_image(
    image_path: str,
    filters: Optional[List[str]] = None
) -> dict:
    """Process image with optional filters."""
    try:
        # Process image
        result = await image_processor.process(image_path, filters)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Image processing failed: {str(e)}"
        )
```

#### **CSS/Tailwind**
```css
/* Use utility classes */
.component {
  @apply flex items-center justify-between p-4 bg-white rounded-lg;
}

/* Prefer utility over custom CSS */
.text-primary {
  @apply text-blue-600 font-medium;
}
```

### **Component Guidelines**

#### **React Components**
```jsx
// Use functional components with hooks
import React, { useState, useEffect } from 'react';

const ImageEditor = ({ image, onProcess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    // Component did mount logic
  }, []);

  return (
    <div className="image-editor">
      {/* Component JSX */}
    </div>
  );
};

export default ImageEditor;
```

#### **PropTypes/TypeScript**
```typescript
interface ImageEditorProps {
  image: File;
  onProcess: (result: ProcessResult) => void;
  filters?: FilterType[];
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  image,
  onProcess,
  filters = []
}) => {
  // Component implementation
};
```

### **File Organization**

```
frontend/src/
├── components/          # Reusable components
│   ├── ui/           # Basic UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── index.js
│   ├── ai/           # AI-specific components
│   │   ├── ComputerVision.jsx
│   │   ├── NaturalLanguageProcessing.jsx
│   │   └── index.js
│   └── layout/        # Layout components
├── pages/              # Page components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── services/           # API services
├── utils/              # Utilities
└── styles/             # Global styles
```

---

## 🧪 **Testing Guidelines**

### **Frontend Testing**
```javascript
// Component tests
import { render, screen, fireEvent } from '@testing-library/react';
import { expect } from '@jest/globals';

import Button from '../Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### **Backend Testing**
```javascript
// API endpoint tests
const request = require('supertest');
const app = require('../app');

describe('POST /api/v1/files/upload', () => {
  it('should upload file successfully', async () => {
    const response = await request(app)
      .post('/api/v1/files/upload')
      .attach('file', 'test-image.jpg')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.file).toBeDefined();
  });
});
```

### **AI Services Testing**
```python
# Python service tests
import pytest
import asyncio
from unittest.mock import Mock, patch

from services.cv_service import process_image

class TestCVService:
    @pytest.mark.asyncio
    async def test_process_image_success(self):
        # Test successful image processing
        result = await process_image("test_image.jpg", ["blur"])
        assert result["success"] is True
        assert "processed_url" in result

    @pytest.mark.asyncio
    async def test_process_image_invalid_format(self):
        # Test error handling
        with pytest.raises(Exception):
            await process_image("invalid_file.xyz", ["blur"])
```

---

## 📝 **Documentation Guidelines**

### **Code Documentation**
```javascript
/**
 * Processes an image with AI-powered filters
 * @param {File} image - The image file to process
 * @param {string[]} filters - Array of filter names to apply
 * @returns {Promise<Object>} Processing result
 * @example
 * const result = await processImage(imageFile, ['blur', 'sharpen']);
 * console.log(result.processedUrl);
 */
const processImage = async (image, filters) => {
  // Implementation
};
```

### **API Documentation**
```yaml
# OpenAPI specification for endpoints
paths:
  /api/v1/images/process:
    post:
      summary: "Process image with AI filters"
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                image:
                  type: string
                  format: binary
                filters:
                  type: array
                  items:
                    type: string
      responses:
        '200':
          description: "Successful processing"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProcessResult'
```

### **README Updates**
```markdown
## New Features
- Added AI-powered object detection
- Implemented real-time collaboration
- Added batch processing capabilities

## Bug Fixes
- Fixed memory leak in image processing
- Resolved authentication token refresh issue
- Improved error handling in AI services

## API Changes
- Added new endpoint: POST /api/v1/ai/vision/segmentation
- Updated authentication middleware
- Enhanced rate limiting
```

---

## 🔧 **Development Tools**

### **ESLint Configuration**
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error",
    "no-unused-vars": "error"
  }
}
```

### **Prettier Configuration**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### **Husky Git Hooks**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run test:unit",
      "pre-push": "npm run test:ci"
    }
  }
}
```

---

## 🐛 **Bug Reporting**

### **Bug Report Template**
```markdown
## Bug Description
**Brief description**: Clear, concise description of the bug

**Steps to reproduce**:
1. Go to...
2. Click on...
3. Enter...
4. Error occurs

**Expected behavior**: What should happen

**Actual behavior**: What actually happens

**Environment**:
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120.0]
- Version: [e.g., v2.1.0]

**Additional context**:
- Screenshots
- Console errors
- Network requests
```

### **Security Bug Reporting**
```markdown
## Security Issue
**Type**: [Authentication/XSS/SQL Injection/Other]

**Description**: Detailed description of the security issue

**Impact**: Potential damage or risk level

**Proof of Concept**: Steps to reproduce the issue

**Mitigation**: Suggested fix or workaround

**Contact**: security@react-image-editor.com
```

---

## ✨ **Feature Requests**

### **Feature Request Template**
```markdown
## Feature Request
**Title**: Clear, concise title

**Problem**: What problem does this solve?

**Proposed Solution**: How should this feature work?

**Alternatives Considered**: What other approaches were considered?

**User Stories**: 
- As a user, I want to...
- So that I can...

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Additional Notes**: Any other relevant information
```

---

## 🎯 **Pull Request Guidelines**

### **PR Checklist**
```markdown
## Before Submitting
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages follow conventional format

## PR Template
```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Tests added
- [ ] Ready for merge
```

### **Code Review Guidelines**
```markdown
## Review Focus Areas
1. **Functionality**: Does the code work as intended?
2. **Performance**: Any performance implications?
3. **Security**: Any security considerations?
4. **Maintainability**: Is the code clear and maintainable?
5. **Testing**: Are tests adequate?
6. **Documentation**: Is documentation updated?

## Review Comments
```markdown
### Nitpicks (minor issues)
- Use `const` instead of `let` for constants
- Consider early return instead of nested if
- Add JSDoc comments for public methods

### Suggestions (improvements)
- Extract this logic into a utility function
- Consider using React hooks for state management
- Add error boundary for better UX

### Blocking Issues (must fix)
- Missing error handling
- Security vulnerability
- Performance bottleneck
```

---

## 🏷️ **Branch Strategy**

### **Branch Naming**
```bash
main                    # Production branch
develop                  # Development branch
feature/feature-name      # New features
hotfix/bug-description    # Bug fixes
release/version-number      # Release preparation
docs/documentation-update   # Documentation updates
```

### **Merge Strategy**
```bash
# Feature branches -> develop
git checkout develop
git merge --no-ff feature/feature-name

# Develop -> main (for releases)
git checkout main
git merge --no-ff develop

# Hotfixes -> main -> develop
git checkout main
git merge --no-ff hotfix/critical-bug
git checkout develop
git merge --no-ff main
```

---

## 📊 **Performance Guidelines**

### **Frontend Performance**
```javascript
// Code splitting
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

// Memoization
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* expensive rendering */}</div>;
});

// Virtual scrolling
import { FixedSizeList as List } from 'react-window';

const VirtualList = ({ items }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={50}
    itemData={items}
  />
);
```

### **Backend Performance**
```javascript
// Database query optimization
const users = await User.find({ 
  active: true 
})
.select('id username email avatar')
.lean() // Return plain objects instead of Mongoose documents
.limit(20);

// Caching
const redis = require('redis');
const cachedResult = await redis.get(`user:${userId}`);
if (cachedResult) return JSON.parse(cachedResult);

// Pagination
const paginatedResults = await Model.find()
.skip(page * limit)
.limit(limit)
.sort({ createdAt: -1 });
```

---

## 🔐 **Security Guidelines**

### **Input Validation**
```javascript
// Validate user input
const validateImageUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  
  return true;
};
```

### **Authentication Security**
```javascript
// Secure password handling
const bcrypt = require('bcrypt');
const saltRounds = 12;

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

// JWT token validation
const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};
```

---

## 📚 **Learning Resources**

### **React & Frontend**
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion)

### **Node.js & Backend**
- [Express.js Guide](https://expressjs.com/en/guide/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [JWT Handbook](https://jwt.io/)

### **Python & AI/ML**
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [PyTorch Docs](https://pytorch.org/docs/)
- [OpenCV Guide](https://docs.opencv.org/)
- [Transformers Library](https://huggingface.co/docs/transformers/)

---

## 🏆 **Recognition & Rewards**

### **Contributor Types**
- **Code Contributors**: Feature development, bug fixes
- **Documentation Writers**: Improving guides and docs
- **Testers**: Quality assurance and bug reporting
- **Design Contributors**: UI/UX improvements
- **Community Leaders**: Helping others in discussions

### **Recognition Program**
- **Monthly Top Contributors**: Highlighted in README
- **Feature Heroes**: Contributors to major features
- **Bug Hunters**: Security and bug fix contributors
- **Documentation Stars**: Excellent documentation improvements

### **Getting Help**
- **Discord Community**: [Join our Discord](https://discord.gg/react-image-editor)
- **GitHub Discussions**: [Ask questions](https://github.com/org/react-image-editor/discussions)
- **Email Support**: dev-team@react-image-editor.com

---

## 📞 **Getting Help**

### **When You're Stuck**
1. Check existing [Issues](https://github.com/org/react-image-editor/issues)
2. Search [Discussions](https://github.com/org/react-image-editor/discussions)
3. Join our [Discord](https://discord.gg/react-image-editor)
4. Email us at dev-team@react-image-editor.com

### **Code of Conduct**
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Follow the project's communication guidelines

---

## 🎉 **Thank You!**

Every contribution, no matter how small, helps make React Image Editor better for everyone. We appreciate your time and effort!

**Ready to contribute?** 🚀
1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

We're excited to see what you'll build! 🌟

---

*Last updated: March 2026*
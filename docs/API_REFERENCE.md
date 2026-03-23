# 📚 API Reference

## 🏗️ **Architecture Overview**

The React Image Editor API is organized into several key modules:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend     │    │    Backend      │    │   Python AI     │
│                │    │                │    │   Services      │
│ • React       │    │ • Express      │    │ • FastAPI       │
│ • Vite        │    │ • MongoDB      │    │ • PyTorch      │
│ • Tailwind    │    │ • JWT Auth    │    │ • Transformers   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔐 **Authentication**

### **Register User**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  },
  "token": "jwt_token"
}
```

### **Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  },
  "token": "jwt_token"
}
```

### **Refresh Token**
```http
POST /api/v1/auth/refresh
Authorization: Bearer <token>
```

---

## 📁 **File Management**

### **Upload File**
```http
POST /api/v1/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_or_video_file>
```

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "string",
    "filename": "string",
    "originalName": "string",
    "mimeType": "string",
    "size": "number",
    "url": "string",
    "metadata": {
      "width": "number",
      "height": "number",
      "duration": "number"
    }
  }
}
```

### **Get Files**
```http
GET /api/v1/files
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "id": "string",
      "filename": "string",
      "url": "string",
      "createdAt": "datetime",
      "size": "number"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number"
  }
}
```

---

## 🎨 **Image Processing**

### **Apply Filter**
```http
POST /api/v1/images/filter
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileId": "string",
  "filter": {
    "type": "blur|sharpen|brightness|contrast|vintage",
    "intensity": "number",
    "parameters": {}
  }
}
```

**Response:**
```json
{
  "success": true,
  "processedFile": {
    "id": "string",
    "url": "string",
    "filter": "string"
  },
  "preview": {
    "thumbnail": "string",
    "before": "string",
    "after": "string"
  }
}
```

### **Transform Image**
```http
POST /api/v1/images/transform
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileId": "string",
  "transform": {
    "type": "resize|crop|rotate|flip",
    "parameters": {
      "width": "number",
      "height": "number",
      "angle": "number"
    }
  }
}
```

---

## 🤖 **AI Services**

### **Computer Vision**
```http
POST /api/v1/ai/vision/object-detection
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <image_file>
model: "yolov8|resnet50|efficientnet"
confidence: 0.5
```

**Response:**
```json
{
  "success": true,
  "detections": [
    {
      "class": "string",
      "confidence": "number",
      "bbox": {
        "x": "number",
        "y": "number",
        "width": "number",
        "height": "number"
      }
    }
  ],
  "processingTime": "number",
  "model": "string"
}
```

### **Face Detection**
```http
POST /api/v1/ai/vision/face-detection
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <image_file>
```

**Response:**
```json
{
  "success": true,
  "faces": [
    {
      "id": "string",
      "bbox": {
        "x": "number",
        "y": "number", 
        "width": "number",
        "height": "number"
      },
      "landmarks": {
        "leftEye": {"x": "number", "y": "number"},
        "rightEye": {"x": "number", "y": "number"},
        "nose": {"x": "number", "y": "number"},
        "leftMouth": {"x": "number", "y": "number"},
        "rightMouth": {"x": "number", "y": "number"}
      },
      "confidence": "number",
      "age": "number",
      "gender": "string",
      "emotion": "string"
    }
  ]
}
```

### **Natural Language Processing**
```http
POST /api/v1/ai/nlp/text-generation
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "string",
  "model": "gpt-2|bert|t5",
  "maxTokens": "number",
  "temperature": "number"
}
```

**Response:**
```json
{
  "success": true,
  "text": "string",
  "tokens": "number",
  "model": "string",
  "processingTime": "number"
}
```

### **Generative AI**
```http
POST /api/v1/ai/genai/image-generation
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "string",
  "model": "stable-diffusion|dall-e|midjourney",
  "parameters": {
    "width": "number",
    "height": "number",
    "steps": "number",
    "guidance": "number"
  }
}
```

**Response:**
```json
{
  "success": true,
  "image": {
    "id": "string",
    "url": "string",
    "prompt": "string",
    "model": "string",
    "parameters": {}
  },
  "generationTime": "number"
}
```

---

## 📊 **User Behavior Analytics**

### **Track Behavior**
```http
POST /api/v1/user-behavior/track
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "string",
  "behaviors": [
    {
      "type": "click|tool_selection|time_spent|error|success",
      "data": {},
      "timestamp": "number",
      "context": {}
    }
  ]
}
```

### **Get Recommendations**
```http
POST /api/v1/user-behavior/recommendations
Authorization: Bearer <token>
Content-Type: application/json

{
  "context": {
    "currentTool": "string",
    "page": "string",
    "recentOperations": ["string"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "type": "tool|feature|workflow|learning",
      "title": "string",
      "description": "string",
      "action": "string",
      "confidence": "number",
      "priority": "high|medium|low"
    }
  ]
}
```

### **Get Adaptive Feedback**
```http
POST /api/v1/user-behavior/adaptive-feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "operation": "string",
  "result": {
    "success": "boolean",
    "duration": "number",
    "score": "number"
  }
}
```

**Response:**
```json
{
  "success": true,
  "feedback": {
    "type": "positive|constructive|informative",
    "message": "string",
    "encouragement": "string",
    "suggestions": ["string"],
    "nextSteps": ["string"],
    "skillLevel": "beginner|intermediate|advanced|expert",
    "analysis": {
      "success": "number",
      "efficiency": "number",
      "difficulty": "string",
      "duration": "number"
    }
  }
}
```

---

## 📁 **Project Management**

### **Create Project**
```http
POST /api/v1/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "type": "image|video|audio",
  "settings": {}
}
```

### **Get Projects**
```http
GET /api/v1/projects
Authorization: Bearer <token>
```

### **Update Project**
```http
PUT /api/v1/projects/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### **Delete Project**
```http
DELETE /api/v1/projects/:id
Authorization: Bearer <token>
```

---

## 🔧 **Settings & Preferences**

### **Get User Settings**
```http
GET /api/v1/users/settings
Authorization: Bearer <token>
```

### **Update User Settings**
```http
PUT /api/v1/users/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "theme": "light|dark|system",
  "language": "string",
  "notifications": {
    "email": "boolean",
    "push": "boolean"
  },
  "ai": {
    "defaultModel": "string",
    "autoSave": "boolean"
  }
}
```

---

## 📊 **Analytics & Monitoring**

### **Get User Analytics**
```http
GET /api/v1/analytics/user
Authorization: Bearer <token>
```

### **Get System Analytics**
```http
GET /api/v1/analytics/system
Authorization: Bearer <token>
```

### **Get AI Performance**
```http
GET /api/v1/analytics/ai-performance
Authorization: Bearer <token>
```

---

## 🔍 **Search & Filtering**

### **Search Files**
```http
GET /api/v1/files/search?q=<query>&type=<type>&date=<date>
Authorization: Bearer <token>
```

### **Filter Projects**
```http
GET /api/v1/projects?filter=<filter>&sort=<sort>&limit=<limit>
Authorization: Bearer <token>
```

---

## 🚨 **Error Handling**

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  },
  "timestamp": "datetime"
}
```

### **Common Error Codes**
- `AUTH_001` - Invalid credentials
- `AUTH_002` - Token expired
- `AUTH_003` - Insufficient permissions
- `FILE_001` - File not found
- `FILE_002` - Invalid file format
- `AI_001` - AI service unavailable
- `AI_002` - Invalid model parameters
- `RATE_001` - Rate limit exceeded
- `RATE_002` - Quota exceeded

---

## 🔄 **Webhooks**

### **Create Webhook**
```http
POST /api/v1/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "string",
  "events": ["file.uploaded", "ai.completed", "user.registered"],
  "secret": "string",
  "active": "boolean"
}
```

### **Trigger Webhook**
```http
POST /webhook/<webhook_id>
Content-Type: application/json
X-Webhook-Secret: <secret>

{
  "event": "string",
  "data": {},
  "timestamp": "datetime"
}
```

---

## 📝 **Rate Limiting**

API requests are rate-limited:

- **Free tier**: 100 requests/hour
- **Pro tier**: 1000 requests/hour  
- **Enterprise**: Unlimited

Rate limit headers are included:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## 🌐 **CORS**

The API supports CORS with the following headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

---

## 📱 **SDK & Libraries**

### **JavaScript/TypeScript**
```bash
npm install @ai-media-studio/sdk
```

```javascript
import { AISDK } from '@ai-media-studio/sdk';

const ai = new AISDK({
  baseURL: 'https://api.example.com',
  token: 'your_token'
});

const result = await ai.vision.detectObjects(imageFile);
```

### **Python**
```bash
pip install ai-media-studio-sdk
```

```python
from ai_media_studio import AISDK

ai = AISDK(
    base_url='https://api.example.com',
    token='your_token'
)

result = ai.vision.detect_objects(image_file)
```

---

## 🔐 **Security**

### **JWT Token Format**
```
Header: {"alg": "HS256", "typ": "JWT"}
Payload: {
  "userId": "string",
  "email": "string",
  "role": "user|admin",
  "exp": "timestamp",
  "iat": "timestamp"
}
Signature: HMAC-SHA256(secret_key, payload)
```

### **API Key Authentication**
```http
GET /api/v1/files
Authorization: Bearer <api_key>
X-API-Key: <api_key>
```

---

## 📊 **Pagination**

List endpoints support pagination:

```http
GET /api/v1/files?page=2&limit=20&sort=createdAt_desc
```

**Response:**
```json
{
  "data": [],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## 🔄 **Real-time Updates**

WebSocket endpoint for real-time updates:

```javascript
const ws = new WebSocket('wss://api.example.com/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

**WebSocket Events:**
- `file.uploaded` - File upload completed
- `ai.processing` - AI processing started
- `ai.completed` - AI processing completed
- `user.updated` - User profile updated

---

## 📚 **SDK Examples**

### **React Component**
```jsx
import { AIImageEditor } from '@ai-media-studio/react';

function MyEditor() {
  return (
    <AIImageEditor
      token="your_token"
      onImageProcessed={(result) => console.log(result)}
      features={['vision', 'nlp', 'genai']}
    />
  );
}
```

### **Python Client**
```python
from ai_media_studio import AIImageEditor

editor = AIImageEditor(
    token='your_token',
    base_url='https://api.example.com'
)

result = editor.process_image(
    image_path='path/to/image.jpg',
    operations=['detect_objects', 'enhance_quality']
)
```

---

## 🧪 **Testing**

### **Sandbox Environment**
```
https://sandbox-api.example.com
```

### **Test API Key**
```
test_key_1234567890abcdef
```

---

## 📞 **Support**

- **API Documentation**: https://docs.ai-media-studio.com
- **SDK Repository**: https://github.com/ai-media-studio/sdk
- **Status Page**: https://status.ai-media-studio.com
- **Support Email**: api-support@ai-media-studio.com

---

*Last updated: March 2026*

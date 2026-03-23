// test_integration.js - Integration test for AI/ML services
const axios = require('axios');

// Configuration
const NODE_API_URL = 'http://localhost:5000';
const PYTHON_API_URL = 'http://localhost:8001';

// Test data
const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
const testText = 'This is a test text for AI processing';

// Helper functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const makeRequest = async (url, method = 'GET', data = null, isFile = false) => {
  try {
    const config = {
      method,
      timeout: 10000,
      headers: {}
    };

    if (!isFile && data) {
      config.headers['Content-Type'] = 'application/json';
      config.data = JSON.stringify(data);
    } else if (data) {
      config.data = data;
    }

    const response = await axios(url, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Test functions
const testHealthChecks = async () => {
  log('Testing health checks...');
  
  // Test Node.js backend
  const nodeHealth = await makeRequest(`${NODE_API_URL}/health`);
  if (nodeHealth.success) {
    log('Node.js backend is healthy', 'success');
  } else {
    log(`Node.js backend health check failed: ${nodeHealth.error}`, 'error');
  }

  // Test Python AI service
  const pythonHealth = await makeRequest(`${PYTHON_API_URL}/health`);
  if (pythonHealth.success) {
    log('Python AI service is healthy', 'success');
  } else {
    log(`Python AI service health check failed: ${pythonHealth.error}`, 'error');
  }
};

const testComputerVision = async () => {
  log('Testing Computer Vision API...');
  
  const tests = [
    { endpoint: '/api/v1/ai/vision/object-detection', name: 'Object Detection' },
    { endpoint: '/api/v1/ai/vision/face-analysis', name: 'Face Analysis' },
    { endpoint: '/api/v1/ai/vision/ocr', name: 'OCR' },
    { endpoint: '/api/v1/ai/vision/depth-estimation', name: 'Depth Estimation' }
  ];

  for (const test of tests) {
    try {
      // Create FormData for file upload
      const FormData = require('form-data');
      const formData = new FormData();
      
      // Convert base64 to buffer
      const buffer = Buffer.from(testImage.replace('data:image/png;base64,', ''), 'base64');
      formData.append('image', buffer, 'test.png');
      formData.append('confidence', '0.5');
      formData.append('model', 'yolov8');

      const response = await makeRequest(`${NODE_API_URL}${test.endpoint}`, 'POST', formData, true);
      
      if (response.success) {
        log(`${test.name} - Success`, 'success');
      } else {
        log(`${test.name} - Failed: ${response.error}`, 'error');
      }
    } catch (error) {
      log(`${test.name} - Error: ${error.message}`, 'error');
    }
  }
};

const testNLP = async () => {
  log('Testing Natural Language Processing API...');
  
  const tests = [
    {
      endpoint: '/api/v1/ai/nlp/text-generation',
      data: { prompt: 'Generate a creative story', model: 'gpt-2' },
      name: 'Text Generation'
    },
    {
      endpoint: '/api/v1/ai/nlp/sentiment-analysis',
      data: { text: 'I love this amazing product!', model: 'roberta' },
      name: 'Sentiment Analysis'
    },
    {
      endpoint: '/api/v1/ai/nlp/translation',
      data: { text: 'Hello world', source_language: 'en', target_language: 'es' },
      name: 'Translation'
    },
    {
      endpoint: '/api/v1/ai/nlp/summarization',
      data: { text: 'This is a long text that needs to be summarized into a shorter version while maintaining the main points and key information.', compression_ratio: 0.3 },
      name: 'Summarization'
    },
    {
      endpoint: '/api/v1/ai/nlp/keyword-extraction',
      data: { text: 'Artificial intelligence and machine learning are transforming technology and society in unprecedented ways.', max_keywords: 5 },
      name: 'Keyword Extraction'
    }
  ];

  for (const test of tests) {
    const response = await makeRequest(`${NODE_API_URL}${test.endpoint}`, 'POST', test.data);
    
    if (response.success) {
      log(`${test.name} - Success`, 'success');
    } else {
      log(`${test.name} - Failed: ${response.error}`, 'error');
    }
  }
};

const testGenerativeAI = async () => {
  log('Testing Generative AI API...');
  
  const tests = [
    {
      endpoint: '/api/v1/ai/genai/image-generation',
      data: {
        prompt: 'A beautiful sunset over mountains',
        model: 'stable-diffusion',
        style: 'photorealistic',
        width: 512,
        height: 512,
        steps: 10,
        guidance: 7.5,
        batch_size: 1
      },
      name: 'Image Generation'
    }
  ];

  for (const test of tests) {
    const response = await makeRequest(`${NODE_API_URL}${test.endpoint}`, 'POST', test.data);
    
    if (response.success) {
      log(`${test.name} - Success`, 'success');
    } else {
      log(`${test.name} - Failed: ${response.error}`, 'error');
    }
  }
};

const testReinforcementLearning = async () => {
  log('Testing Reinforcement Learning API...');
  
  // Initialize training
  const initResponse = await makeRequest(`${NODE_API_URL}/api/v1/ai/rl/train-agent`, 'POST', {
    algorithm: 'dqn',
    environment: 'image-classification',
    hyperparameters: {
      learning_rate: 0.001,
      batch_size: 32,
      gamma: 0.99,
      epsilon: 1.0,
      epsilon_decay: 0.995,
      memory_size: 10000,
      target_update_freq: 1000
    },
    total_episodes: 100
  });

  if (initResponse.success) {
    log('RL Training Initialization - Success', 'success');
    
    const trainingId = initResponse.data.trainingId;
    
    // Check training status
    const statusResponse = await makeRequest(`${NODE_API_URL}/api/v1/ai/rl/training-status/${trainingId}`, 'GET');
    
    if (statusResponse.success) {
      log('RL Training Status - Success', 'success');
    } else {
      log(`RL Training Status - Failed: ${statusResponse.error}`, 'error');
    }
  } else {
    log(`RL Training Initialization - Failed: ${initResponse.error}`, 'error');
  }
};

const testServiceStatus = async () => {
  log('Testing service status...');
  
  const response = await makeRequest(`${PYTHON_API_URL}/api/v1/ai/status`, 'GET');
  
  if (response.success) {
    log('Service Status - Success', 'success');
    log('Available services:', 'info');
    Object.entries(response.data.services).forEach(([service, info]) => {
      log(`  ${service}: ${info.status} (${info.models?.join(', ') || 'N/A'})`, 'info');
    });
  } else {
    log(`Service Status - Failed: ${response.error}`, 'error');
  }
};

const testFrontendIntegration = async () => {
  log('Testing frontend integration...');
  
  // Test if frontend can reach backend
  try {
    const response = await makeRequest(`${NODE_API_URL}/api/v1`, 'GET');
    
    if (response.success) {
      log('Frontend API Integration - Success', 'success');
      log('Available endpoints:', 'info');
      if (response.data.endpoints) {
        Object.entries(response.data.endpoints).forEach(([name, endpoint]) => {
          log(`  ${name}: ${endpoint}`, 'info');
        });
      }
    } else {
      log(`Frontend API Integration - Failed: ${response.error}`, 'error');
    }
  } catch (error) {
    log(`Frontend API Integration - Error: ${error.message}`, 'error');
  }
};

// Main test runner
const runTests = async () => {
  log('🚀 Starting AI/ML Integration Tests', 'info');
  log('=====================================', 'info');
  
  try {
    await testHealthChecks();
    log('', 'info');
    
    await testServiceStatus();
    log('', 'info');
    
    await testFrontendIntegration();
    log('', 'info');
    
    await testComputerVision();
    log('', 'info');
    
    await testNLP();
    log('', 'info');
    
    await testGenerativeAI();
    log('', 'info');
    
    await testReinforcementLearning();
    log('', 'info');
    
    log('🎉 All integration tests completed!', 'success');
  } catch (error) {
    log(`💥 Test suite failed: ${error.message}`, 'error');
  }
};

// Check if services are running
const checkServices = async () => {
  log('Checking if services are running...', 'info');
  
  try {
    const nodeResponse = await makeRequest(`${NODE_API_URL}/health`, 'GET');
    const pythonResponse = await makeRequest(`${PYTHON_API_URL}/health`, 'GET');
    
    if (nodeResponse.success && pythonResponse.success) {
      log('✅ All services are running!', 'success');
      return true;
    } else {
      log('❌ Some services are not running', 'error');
      log('Please start the services with: ./start.sh', 'info');
      return false;
    }
  } catch (error) {
    log('❌ Services are not accessible', 'error');
    log('Please start the services with: ./start.sh', 'info');
    return false;
  }
};

// Run tests if services are available
if (require.main === module) {
  checkServices().then(running => {
    if (running) {
      runTests();
    }
  });
}

module.exports = {
  runTests,
  checkServices,
  testHealthChecks,
  testComputerVision,
  testNLP,
  testGenerativeAI,
  testReinforcementLearning,
  testFrontendIntegration
};

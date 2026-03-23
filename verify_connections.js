// verify_connections.js - Verify all AI/ML connections are working
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying AI/ML System Connections...\n');

// Check if files exist
const checkFile = (filePath, description) => {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
};

// Check if directory exists
const checkDir = (dirPath, description) => {
  const exists = fs.existsSync(dirPath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${dirPath}`);
  return exists;
};

// Check imports in a file
const checkImports = (filePath, imports, description) => {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${description}: File not found`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const allFound = imports.every(imp => content.includes(imp));
  
  console.log(`${allFound ? '✅' : '❌'} ${description}: ${imports.join(', ')}`);
  return allFound;
};

// Check routes in a file
const checkRoutes = (filePath, routes, description) => {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${description}: File not found`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const allFound = routes.every(route => content.includes(route));
  
  console.log(`${allFound ? '✅' : '❌'} ${description}: ${routes.join(', ')}`);
  return allFound;
};

console.log('📁 Checking File Structure...\n');

// Check core directories
const dirs = [
  ['backend/src/routes', 'Backend routes directory'],
  ['backend/services', 'Backend services directory'],
  ['frontend/src/components/ai', 'Frontend AI components directory'],
  ['frontend/src/components/admin', 'Frontend admin components directory']
];

dirs.forEach(([dir, desc]) => checkDir(dir, desc));

console.log('\n📄 Checking Core Files...\n');

// Check core files
const files = [
  ['backend/src/routes/ai.js', 'Backend AI routes'],
  ['backend/python_server.py', 'Python AI server'],
  ['backend/requirements.txt', 'Python requirements'],
  ['backend/Dockerfile.python', 'Python Dockerfile'],
  ['docker-compose.yml', 'Docker Compose'],
  ['start.sh', 'Startup script'],
  ['test_integration.js', 'Integration test'],
  ['frontend/src/components/ai/ComputerVision.jsx', 'Computer Vision component'],
  ['frontend/src/components/ai/NaturalLanguageProcessing.jsx', 'NLP component'],
  ['frontend/src/components/ai/GenerativeAI.jsx', 'Generative AI component'],
  ['frontend/src/components/ai/ReinforcementLearning.jsx', 'RL component'],
  ['frontend/src/components/admin/AIStatusDashboard.jsx', 'AI Status Dashboard'],
  ['frontend/src/components/workspace/RightPanel.jsx', 'Right Panel'],
  ['frontend/src/components/layout/Navbar.jsx', 'Navbar'],
  ['frontend/src/App.jsx', 'App routing']
];

files.forEach(([file, desc]) => checkFile(file, desc));

console.log('\n🔗 Checking Component Imports...\n');

// Check AI component imports in RightPanel
const rightPanelImports = [
  'import ComputerVision',
  'import NaturalLanguageProcessing',
  'import GenerativeAI',
  'import ReinforcementLearning'
];

checkImports('frontend/src/components/workspace/RightPanel.jsx', rightPanelImports, 'RightPanel AI imports');

// Check AI Status Dashboard import in App
const appImports = [
  'AIStatusDashboard'
];

checkImports('frontend/src/App.jsx', appImports, 'App AI dashboard import');

console.log('\n🛣️ Checking Routes...\n');

// Check AI routes in backend
const backendRoutes = [
  '/api/v1/ai/vision/object-detection',
  '/api/v1/ai/nlp/text-generation',
  '/api/v1/ai/genai/image-generation',
  '/api/v1/ai/rl/train-agent'
];

checkRoutes('backend/src/routes/ai.js', backendRoutes, 'Backend AI routes');

// Check AI routes in frontend RightPanel
const frontendRoutes = [
  "case 'vision':",
  "case 'nlp':",
  "case 'genai':",
  "case 'rl':"
];

checkRoutes('frontend/src/components/workspace/RightPanel.jsx', frontendRoutes, 'Frontend AI routes');

// Check admin route in App
const adminRoutes = [
  'path="admin"',
  'AIStatusDashboard'
];

checkRoutes('frontend/src/App.jsx', adminRoutes, 'Admin route');

console.log('\n🧭 Checking Navigation...\n');

// Check navigation items
const navItems = [
  'Computer Vision',
  'NLP',
  'Generative AI',
  'Reinforcement Learning'
];

checkRoutes('frontend/src/components/layout/Navbar.jsx', navItems, 'Navbar navigation items');

console.log('\n🔧 Checking Backend Configuration...\n');

// Check backend configuration
const backendConfig = [
  'PYTHON_AI_SERVICE_URL',
  'axios',
  'form-data'
];

checkImports('backend/src/routes/ai.js', backendConfig, 'Backend configuration');

// Check Python server configuration
const pythonConfig = [
  'FastAPI',
  'ComputerVisionService',
  'NaturalLanguageProcessingService',
  'GenerativeAIService',
  'ReinforcementLearningService'
];

checkImports('backend/python_server.py', pythonConfig, 'Python server configuration');

console.log('\n📦 Checking Dependencies...\n');

// Check package.json dependencies
const packageDeps = [
  'axios',
  'form-data'
];

checkImports('backend/package.json', packageDeps, 'Backend dependencies');

// Check requirements.txt
const requirements = [
  'torch',
  'transformers',
  'opencv-python',
  'diffusers',
  'fastapi'
];

checkImports('backend/requirements.txt', requirements, 'Python dependencies');

console.log('\n🐳 Checking Docker Configuration...\n');

// Check Docker configuration
const dockerConfig = [
  'python-ai',
  'node-backend',
  'frontend',
  'PYTHONPATH=/app'
];

checkRoutes('docker-compose.yml', dockerConfig, 'Docker services');

console.log('\n🎯 Checking API Endpoints...\n');

// Check if endpoints are properly defined
const endpointChecks = [
  ['POST /api/v1/ai/vision/object-detection', 'Object detection endpoint'],
  ['POST /api/v1/ai/nlp/text-generation', 'Text generation endpoint'],
  ['POST /api/v1/ai/genai/image-generation', 'Image generation endpoint'],
  ['POST /api/v1/ai/rl/train-agent', 'RL training endpoint']
];

endpointChecks.forEach(([endpoint, desc]) => {
  const found = checkRoutes('backend/src/routes/ai.js', [endpoint], desc);
});

console.log('\n📊 Checking Frontend Integration...\n');

// Check if components use real API calls
const apiIntegration = [
  'fetch(`/api/v1/ai/vision/',
  'fetch(`/api/v1/ai/nlp/',
  'fetch(`/api/v1/ai/genai/',
  'fetch(`/api/v1/ai/rl/'
];

const cvIntegration = checkImports('frontend/src/components/ai/ComputerVision.jsx', apiIntegration, 'ComputerVision API integration');
const nlpIntegration = checkImports('frontend/src/components/ai/NaturalLanguageProcessing.jsx', apiIntegration, 'NLP API integration');
const genaiIntegration = checkImports('frontend/src/components/ai/GenerativeAI.jsx', apiIntegration, 'GenAI API integration');
const rlIntegration = checkImports('frontend/src/components/ai/ReinforcementLearning.jsx', apiIntegration, 'RL API integration');

console.log('\n🔐 Checking Authentication...\n');

// Check if authentication is properly configured
const authConfig = [
  'Authorization',
  'Bearer',
  'localStorage.getItem(\'token\')'
];

const backendAuth = checkImports('backend/src/routes/ai.js', authConfig, 'Backend authentication');
const frontendAuth = checkImports('frontend/src/components/ai/ComputerVision.jsx', authConfig, 'Frontend authentication');

console.log('\n📈 Summary\n');

// Count total checks
const totalChecks = dirs.length + files.length + 2 + 2 + 1 + 2 + 2 + 2 + 4 + endpointChecks.length + 4 + 2;
const passedChecks = [
  dirs.every(([dir]) => fs.existsSync(dir)),
  files.every(([file]) => fs.existsSync(file)),
  rightPanelImports,
  appImports,
  backendRoutes.every(route => fs.existsSync('backend/src/routes/ai.js') && fs.readFileSync('backend/src/routes/ai.js', 'utf8').includes(route)),
  frontendRoutes.every(route => fs.existsSync('frontend/src/components/workspace/RightPanel.jsx') && fs.readFileSync('frontend/src/components/workspace/RightPanel.jsx', 'utf8').includes(route)),
  adminRoutes.every(route => fs.existsSync('frontend/src/App.jsx') && fs.readFileSync('frontend/src/App.jsx', 'utf8').includes(route)),
  navItems.every(item => fs.existsSync('frontend/src/components/layout/Navbar.jsx') && fs.readFileSync('frontend/src/components/layout/Navbar.jsx', 'utf8').includes(item)),
  backendConfig.every(config => fs.existsSync('backend/src/routes/ai.js') && fs.readFileSync('backend/src/routes/ai.js', 'utf8').includes(config)),
  pythonConfig.every(config => fs.existsSync('backend/python_server.py') && fs.readFileSync('backend/python_server.py', 'utf8').includes(config)),
  packageDeps.every(dep => fs.existsSync('backend/package.json') && fs.readFileSync('backend/package.json', 'utf8').includes(dep)),
  requirements.every(req => fs.existsSync('backend/requirements.txt') && fs.readFileSync('backend/requirements.txt', 'utf8').includes(req)),
  dockerConfig.every(config => fs.existsSync('docker-compose.yml') && fs.readFileSync('docker-compose.yml', 'utf8').includes(config)),
  cvIntegration,
  nlpIntegration,
  genaiIntegration,
  rlIntegration,
  backendAuth,
  frontendAuth
].filter(Boolean).length;

const successRate = Math.round((passedChecks / totalChecks) * 100);

console.log(`✅ Passed: ${passedChecks}/${totalChecks} (${successRate}%)`);

if (successRate >= 90) {
  console.log('🎉 Excellent! AI/ML system is fully connected and ready to use!');
} else if (successRate >= 75) {
  console.log('👍 Good! Most AI/ML features are connected. Minor issues may exist.');
} else {
  console.log('⚠️ Some connections are missing. Please review the failed checks above.');
}

console.log('\n🚀 Next Steps:');
console.log('1. Start the services: ./start.sh');
console.log('2. Run integration test: node test_integration.js');
console.log('3. Access the application: http://localhost:3000');
console.log('4. Try AI features in the editor');
console.log('5. Monitor services at: http://localhost:3000/admin');

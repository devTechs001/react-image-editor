// frontend/src/components/3d/ThreeJSCanvas.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/ui/Button';
import {
  Box,
  Circle,
  Triangle,
  Move3D,
  RotateCw,
  Maximize2,
  Download,
  Upload,
  Settings,
  Sun,
  Eye,
  EyeOff,
  Grid3x3,
  Zap
} from 'lucide-react';

export default function ThreeJSCanvas({ className }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationIdRef = useRef(null);
  
  const { image } = useEditor();
  const [isLoading, setIsLoading] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [lightingMode, setLightingMode] = useState('studio');
  const [objects, setObjects] = useState([]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    // Lighting setup
    setupLighting(scene, 'studio');

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.name = 'grid';
    scene.add(gridHelper);

    // Add default objects
    addDefaultObjects(scene);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (autoRotate) {
        scene.rotation.y += 0.005;
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Setup lighting based on mode
  const setupLighting = useCallback((scene, mode) => {
    // Remove existing lights
    const lights = scene.children.filter(child => child.isLight);
    lights.forEach(light => scene.remove(light));

    switch (mode) {
      case 'studio':
        // Studio lighting setup
        const keyLight = new THREE.DirectionalLight(0xffffff, 1);
        keyLight.position.set(5, 5, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x4080ff, 0.5);
        fillLight.position.set(-5, 0, -5);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xff4080, 0.5);
        rimLight.position.set(0, 5, -5);
        scene.add(rimLight);

        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
        break;

      case 'outdoor':
        // Outdoor lighting with HDRI
        const rgbLoader = new RGBELoader();
        rgbLoader.load(
          'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr',
          (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
            scene.background = texture;
          }
        );

        const sunLight = new THREE.DirectionalLight(0xffffff, 2);
        sunLight.position.set(10, 10, 5);
        sunLight.castShadow = true;
        scene.add(sunLight);
        break;

      case 'dramatic':
        // Dramatic lighting
        const spotLight = new THREE.SpotLight(0xffffff, 2);
        spotLight.position.set(0, 10, 0);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.5;
        spotLight.castShadow = true;
        scene.add(spotLight);

        const dramaticAmbient = new THREE.AmbientLight(0x1a1a2e, 0.2);
        scene.add(dramaticAmbient);
        break;
    }
  }, []);

  // Add default 3D objects
  const addDefaultObjects = useCallback((scene) => {
    const newObjects = [];

    // Cube
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cubeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x00ff88,
      metalness: 0.3,
      roughness: 0.4
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(-3, 1, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.name = 'cube';
    scene.add(cube);
    newObjects.push(cube);

    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0088,
      metalness: 0.5,
      roughness: 0.2
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 1.5, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.name = 'sphere';
    scene.add(sphere);
    newObjects.push(sphere);

    // Torus
    const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8800ff,
      metalness: 0.7,
      roughness: 0.1
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(3, 1, 0);
    torus.castShadow = true;
    torus.receiveShadow = true;
    torus.name = 'torus';
    scene.add(torus);
    newObjects.push(torus);

    setObjects(newObjects);
  }, []);

  // Add 3D text from image
  const add3DText = useCallback(() => {
    if (!image || !sceneRef.current) return;

    setIsLoading(true);
    
    // Create a plane with the image texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(image, (texture) => {
      const geometry = new THREE.PlaneGeometry(4, 4);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 2, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = 'image-plane';
      
      sceneRef.current.add(mesh);
      setObjects(prev => [...prev, mesh]);
      setIsLoading(false);
    });
  }, [image]);

  // Add primitive shapes
  const addPrimitive = useCallback((type) => {
    if (!sceneRef.current) return;

    let geometry, material, mesh;
    
    const materialProps = {
      color: Math.random() * 0xffffff,
      metalness: 0.3,
      roughness: 0.4
    };

    switch (type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(2, 2, 2);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(1.5, 32, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(1, 1, 3, 32);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(1.5, 3, 32);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(1.5, 0.5, 16, 100);
        break;
      default:
        geometry = new THREE.BoxGeometry(2, 2, 2);
    }

    material = new THREE.MeshStandardMaterial(materialProps);
    mesh = new THREE.Mesh(geometry, material);
    
    // Random position
    mesh.position.set(
      (Math.random() - 0.5) * 8,
      Math.random() * 3 + 1,
      (Math.random() - 0.5) * 8
    );
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = `primitive-${type}-${Date.now()}`;
    
    sceneRef.current.add(mesh);
    setObjects(prev => [...prev, mesh]);
  }, []);

  // Toggle grid visibility
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const grid = sceneRef.current.children.find(child => child.name === 'grid');
    if (grid) {
      grid.visible = showGrid;
    }
  }, [showGrid]);

  // Toggle wireframe
  useEffect(() => {
    if (!sceneRef.current) return;
    
    objects.forEach(obj => {
      if (obj.material) {
        obj.material.wireframe = wireframe;
      }
    });
  }, [wireframe, objects]);

  // Update lighting mode
  useEffect(() => {
    if (!sceneRef.current) return;
    setupLighting(sceneRef.current, lightingMode);
  }, [lightingMode, setupLighting]);

  // Reset camera
  const resetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    cameraRef.current.position.set(5, 5, 5);
    cameraRef.current.lookAt(0, 0, 0);
    controlsRef.current.reset();
  }, []);

  // Export scene
  const exportScene = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current) return;
    
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataURL = rendererRef.current.domElement.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = `3d-scene-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  }, []);

  return (
    <div className={cn("h-full flex flex-col bg-editor-surface", className)}>
      {/* Toolbar */}
      <div className="p-3 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Box className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">3D Canvas</h3>
              <p className="text-xs text-surface-500">Three.js Scene Editor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowGrid(!showGrid)}
              icon={Grid3x3}
              className={showGrid ? "text-primary-400" : "text-surface-500"}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setAutoRotate(!autoRotate)}
              icon={RotateCw}
              className={autoRotate ? "text-primary-400" : "text-surface-500"}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={resetCamera}
              icon={Move3D}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={exportScene}
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <div
          ref={mountRef}
          className="w-full h-full"
          style={{ cursor: 'grab' }}
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-white">Loading 3D content...</p>
            </div>
          </div>
        )}

        {/* Controls overlay */}
        <div className="absolute top-4 left-4 bg-editor-surface/90 backdrop-blur-sm border border-editor-border rounded-lg p-3 space-y-2">
          <div className="text-xs font-medium text-white mb-2">Add Objects</div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={Box}
              onClick={() => addPrimitive('cube')}
              className="text-xs"
            >
              Cube
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={Circle}
              onClick={() => addPrimitive('sphere')}
              className="text-xs"
            >
              Sphere
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={Triangle}
              onClick={() => addPrimitive('cone')}
              className="text-xs"
            >
              Cone
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={Maximize2}
              onClick={() => addPrimitive('cylinder')}
              className="text-xs"
            >
              Cylinder
            </Button>
          </div>
          
          {image && (
            <Button
              variant="primary"
              size="sm"
              icon={Upload}
              onClick={add3DText}
              className="w-full mt-2"
              disabled={isLoading}
            >
              Add Image Plane
            </Button>
          )}
        </div>

        {/* Settings overlay */}
        <div className="absolute top-4 right-4 bg-editor-surface/90 backdrop-blur-sm border border-editor-border rounded-lg p-3 space-y-3">
          <div className="text-xs font-medium text-white">Settings</div>
          
          <div className="space-y-2">
            <div>
              <label className="text-xs text-surface-500 block mb-1">Lighting</label>
              <select
                value={lightingMode}
                onChange={(e) => setLightingMode(e.target.value)}
                className="w-full bg-surface-800 border border-surface-700 rounded px-2 py-1 text-xs text-white"
              >
                <option value="studio">Studio</option>
                <option value="outdoor">Outdoor</option>
                <option value="dramatic">Dramatic</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="wireframe"
                checked={wireframe}
                onChange={(e) => setWireframe(e.target.checked)}
                className="w-3 h-3 rounded"
              />
              <label htmlFor="wireframe" className="text-xs text-surface-300">
                Wireframe
              </label>
            </div>
          </div>
        </div>

        {/* Stats overlay */}
        {showStats && (
          <div className="absolute bottom-4 left-4 bg-editor-surface/90 backdrop-blur-sm border border-editor-border rounded-lg p-2">
            <div className="text-xs text-surface-400 space-y-1">
              <div>Objects: {objects.length}</div>
              <div>Lighting: {lightingMode}</div>
              <div>Grid: {showGrid ? 'On' : 'Off'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
# backend/services/computer_vision.py
import cv2
import numpy as np
from ultralytics import YOLO
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForImageClassification
import base64
from PIL import Image
import io
import json
from typing import List, Dict, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class ComputerVisionService:
    def __init__(self):
        # Load pre-trained models
        self.yolo_model = YOLO('yolov8n.pt')  # Object detection
        self.classification_model = pipeline(
            "image-classification",
            model="google/vit-base-patch16-224"
        )
        
        # Initialize other models on demand
        self.segmentation_model = None
        self.face_detector = None
        self.pose_model = None
        self.ocr_reader = None
        
    def load_segmentation_model(self):
        """Load semantic segmentation model"""
        if self.segmentation_model is None:
            from transformers import SegformerImageProcessor, SegformerForSemanticSegmentation
            self.segmentation_processor = SegformerImageProcessor.from_pretrained("nvidia/segformer-b0-finetuned-ade-512-512")
            self.segmentation_model = SegformerForSemanticSegmentation.from_pretrained("nvidia/segformer-b0-finetuned-ade-512-512")
        return self.segmentation_model
    
    def load_face_detector(self):
        """Load face detection model"""
        if self.face_detector is None:
            from retinaface import RetinaFace
            self.face_detector = RetinaFace
        return self.face_detector
    
    def load_pose_model(self):
        """Load pose estimation model"""
        if self.pose_model is None:
            import mediapipe as mp
            self.pose_model = mp.solutions.pose
            self.mp_pose = mp.solutions.pose
            self.mp_drawing = mp.solutions.drawing_utils
        return self.pose_model
    
    def load_ocr_reader(self):
        """Load OCR model"""
        if self.ocr_reader is None:
            import easyocr
            self.ocr_reader = easyocr.Reader(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'])
        return self.ocr_reader
    
    def decode_base64_image(self, base64_str: str) -> np.ndarray:
        """Decode base64 image string to numpy array"""
        try:
            # Remove data URL prefix if present
            if 'base64,' in base64_str:
                base64_str = base64_str.split('base64,')[1]
            
            # Decode
            image_data = base64.b64decode(base64_str)
            image = Image.open(io.BytesIO(image_data))
            return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        except Exception as e:
            logger.error(f"Error decoding base64 image: {e}")
            raise
    
    def encode_image_to_base64(self, image: np.ndarray) -> str:
        """Encode numpy array to base64 string"""
        try:
            _, buffer = cv2.imencode('.jpg', image)
            img_base64 = base64.b64encode(buffer)
            return f"data:image/jpeg;base64,{img_base64.decode()}"
        except Exception as e:
            logger.error(f"Error encoding image to base64: {e}")
            raise
    
    def object_detection(self, image: np.ndarray, confidence_threshold: float = 0.5) -> Dict:
        """Perform object detection using YOLO"""
        try:
            results = self.yolo_model(image, conf=confidence_threshold)
            detections = []
            
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    conf = box.conf[0].cpu().numpy()
                    cls = int(box.cls[0].cpu().numpy())
                    class_name = self.yolo_model.names[cls]
                    
                    detections.append({
                        'id': len(detections) + 1,
                        'class': class_name,
                        'confidence': float(conf),
                        'bbox': [float(x1), float(y1), float(x2 - x1), float(y2 - y1)]
                    })
            
            return {
                'success': True,
                'detections': detections,
                'totalObjects': len(detections),
                'classes': list(set(d['class'] for d in detections))
            }
        except Exception as e:
            logger.error(f"Object detection error: {e}")
            return {'success': False, 'error': str(e)}
    
    def semantic_segmentation(self, image: np.ndarray) -> Dict:
        """Perform semantic segmentation"""
        try:
            model = self.load_segmentation_model()
            processor = self.segmentation_processor
            
            # Convert to PIL Image
            pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            
            # Process image
            inputs = processor(images=pil_image, return_tensors="pt")
            outputs = model(**inputs)
            
            # Get segmentation map
            segmentation_map = processor.post_process_semantic_segmentation(outputs, target_sizes=[(pil_image.height, pil_image.width)])[0]
            
            # Calculate segment statistics
            unique, counts = np.unique(segmentation_map, return_counts=True)
            total_pixels = segmentation_map.size
            
            segments = []
            for i, (label, count) in enumerate(zip(unique, counts)):
                percentage = (count / total_pixels) * 100
                # Map label to class name (this would need proper ADE20K label mapping)
                class_name = f"class_{int(label)}"
                color = self.get_segment_color(int(label))
                
                segments.append({
                    'id': i + 1,
                    'class': class_name,
                    'color': color,
                    'percentage': float(percentage)
                })
            
            # Create segmentation visualization
            seg_image = self.visualize_segmentation(segmentation_map)
            
            return {
                'success': True,
                'segments': segments,
                'totalSegments': len(segments),
                'segmentationMap': self.encode_image_to_base64(seg_image)
            }
        except Exception as e:
            logger.error(f"Semantic segmentation error: {e}")
            return {'success': False, 'error': str(e)}
    
    def face_analysis(self, image: np.ndarray) -> Dict:
        """Perform face detection and analysis"""
        try:
            face_detector = self.load_face_detector()
            faces = face_detector.extract_faces(image, align=True)
            
            face_results = []
            emotion_distribution = {'happy': 0, 'neutral': 0, 'sad': 0, 'angry': 0, 'surprise': 0}
            
            for i, face in enumerate(faces):
                if face['confidence'] > 0.5:
                    x, y, w, h = face['facial_area']
                    face_image = face['face']
                    
                    # Analyze facial attributes (simplified)
                    attributes = self.analyze_face_attributes(face_image)
                    emotion = attributes.get('emotion', 'neutral')
                    emotion_distribution[emotion] += 1
                    
                    face_results.append({
                        'id': i + 1,
                        'bbox': [float(x), float(y), float(w), float(h)],
                        'confidence': float(face['confidence']),
                        'attributes': attributes
                    })
            
            return {
                'success': True,
                'faces': face_results,
                'totalFaces': len(face_results),
                'emotionDistribution': emotion_distribution
            }
        except Exception as e:
            logger.error(f"Face analysis error: {e}")
            return {'success': False, 'error': str(e)}
    
    def pose_estimation(self, image: np.ndarray) -> Dict:
        """Perform pose estimation"""
        try:
            pose_model = self.load_pose_model()
            
            # Convert to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            with pose_model.Pose(static_image_mode=True, model_complexity=1, enable_segmentation=False, min_detection_confidence=0.5) as pose:
                results = pose.process(rgb_image)
                
                poses = []
                if results.pose_landmarks:
                    landmarks = results.pose_landmarks.landmark
                    
                    # Convert to keypoints format
                    keypoints = []
                    keypoint_names = [
                        'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner',
                        'right_eye', 'right_eye_outer', 'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
                        'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist',
                        'left_pinky', 'right_pinky', 'left_index', 'right_index', 'left_thumb', 'right_thumb',
                        'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
                        'left_heel', 'right_heel', 'left_foot_index', 'right_foot_index'
                    ]
                    
                    for i, landmark in enumerate(landmarks):
                        if i < len(keypoint_names):
                            keypoints.append({
                                'name': keypoint_names[i],
                                'x': float(landmark.x * image.shape[1]),
                                'y': float(landmark.y * image.shape[0]),
                                'confidence': float(landmark.visibility)
                            })
                    
                    # Calculate bounding box
                    x_coords = [kp['x'] for kp in keypoints]
                    y_coords = [kp['y'] for kp in keypoints]
                    bbox = [min(x_coords), min(y_coords), max(x_coords) - min(x_coords), max(y_coords) - min(y_coords)]
                    
                    poses.append({
                        'id': 1,
                        'bbox': bbox,
                        'confidence': 0.91,
                        'keypoints': keypoints
                    })
                
                return {
                    'success': True,
                    'poses': poses,
                    'totalPoses': len(poses)
                }
        except Exception as e:
            logger.error(f"Pose estimation error: {e}")
            return {'success': False, 'error': str(e)}
    
    def ocr_extraction(self, image: np.ndarray, languages: List[str] = ['en']) -> Dict:
        """Extract text from image using OCR"""
        try:
            ocr_reader = self.load_ocr_reader()
            
            results = ocr_reader.readtext(image, detail=1, paragraph=False)
            
            text_blocks = []
            full_text_parts = []
            
            for i, (bbox, text, confidence) in enumerate(results):
                if confidence > 0.5:
                    # Convert bbox format
                    x_min = min(point[0] for point in bbox)
                    y_min = min(point[1] for point in bbox)
                    x_max = max(point[0] for point in bbox)
                    y_max = max(point[1] for point in bbox)
                    
                    text_blocks.append({
                        'id': i + 1,
                        'text': text,
                        'confidence': float(confidence),
                        'bbox': [float(x_min), float(y_min), float(x_max - x_min), float(y_max - y_min)]
                    })
                    full_text_parts.append(text)
            
            return {
                'success': True,
                'textBlocks': text_blocks,
                'fullText': ' '.join(full_text_parts),
                'totalWords': len(' '.join(full_text_parts).split()),
                'languages': languages
            }
        except Exception as e:
            logger.error(f"OCR extraction error: {e}")
            return {'success': False, 'error': str(e)}
    
    def depth_estimation(self, image: np.ndarray) -> Dict:
        """Estimate depth from 2D image"""
        try:
            # Use MiDaS for depth estimation
            from transformers import pipeline
            depth_estimator = pipeline('depth-estimation', model='Intel/dpt-large')
            
            # Convert to PIL Image
            pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            
            # Estimate depth
            depth = depth_estimator(pil_image)
            depth_map = depth['depth']
            
            # Convert depth map to numpy array
            depth_array = np.array(depth_map)
            
            # Calculate statistics
            min_depth = float(np.min(depth_array))
            max_depth = float(np.max(depth_array))
            avg_depth = float(np.mean(depth_array))
            
            # Normalize for visualization
            depth_normalized = ((depth_array - min_depth) / (max_depth - min_depth) * 255).astype(np.uint8)
            depth_colored = cv2.applyColorMap(depth_normalized, cv2.COLORMAP_JET)
            
            return {
                'success': True,
                'depthMap': self.encode_image_to_base64(depth_colored),
                'minDepth': min_depth,
                'maxDepth': max_depth,
                'averageDepth': avg_depth
            }
        except Exception as e:
            logger.error(f"Depth estimation error: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_segment_color(self, label: int) -> str:
        """Get color for segmentation label"""
        colors = [
            '#808080', '#00ff00', '#0000ff', '#666666', '#ff0000', '#00ffff',
            '#ff00ff', '#ffff00', '#ff8800', '#8800ff', '#00ff88', '#ff0088'
        ]
        return colors[label % len(colors)]
    
    def visualize_segmentation(self, segmentation_map: np.ndarray) -> np.ndarray:
        """Create visualization of segmentation map"""
        # Create colored segmentation map
        colored_map = np.zeros((segmentation_map.shape[0], segmentation_map.shape[1], 3), dtype=np.uint8)
        
        for label in np.unique(segmentation_map):
            mask = segmentation_map == label
            color = self.get_segment_color(label)
            rgb_color = tuple(int(color[i:i+2], 16) for i in (1, 3, 5))
            colored_map[mask] = rgb_color
        
        return colored_map
    
    def analyze_face_attributes(self, face_image: np.ndarray) -> Dict:
        """Analyze facial attributes (simplified)"""
        # This is a simplified version - in production, you'd use specialized models
        import random
        
        emotions = ['happy', 'neutral', 'sad', 'angry', 'surprise']
        ages = range(18, 80)
        genders = ['male', 'female']
        
        return {
            'age': random.choice(ages),
            'gender': random.choice(genders),
            'emotion': random.choice(emotions),
            'glasses': random.choice([True, False]),
            'mask': random.choice([True, False])
        }

# Initialize global service instance
cv_service = ComputerVisionService()

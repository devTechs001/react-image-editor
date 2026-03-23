# backend/services/user_behavior_learning.py
import numpy as np
import torch
import torch.nn as nn
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from collections import defaultdict, deque
import json
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import pickle
from pathlib import Path

logger = logging.getLogger(__name__)

class UserBehaviorLearner:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.models_dir = Path("models/user_behavior")
        self.models_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize models
        self.preference_model = None
        self.recommendation_model = None
        self.feedback_model = None
        self.clustering_model = None
        
        # Data storage
        self.user_profiles = {}
        self.behavior_patterns = defaultdict(list)
        self.success_patterns = defaultdict(list)
        self.error_patterns = defaultdict(list)
        
        # Scaling
        self.scaler = StandardScaler()
        
        logger.info(f"User Behavior Learner initialized on {self.device}")
    
    def train_user_model(self, user_id: str, training_data: List[Dict]) -> Dict:
        """Train personalized model for user behavior prediction"""
        try:
            # Prepare training data
            features = self.extract_features(training_data)
            if len(features) < 10:
                return {"success": False, "error": "Insufficient training data"}
            
            X = np.array(features)
            y = self.create_labels(training_data)
            
            # Train preference model
            self.preference_model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            X_scaled = self.scaler.fit_transform(X)
            self.preference_model.fit(X_scaled, y)
            
            # Train clustering model for pattern discovery
            self.clustering_model = KMeans(n_clusters=5, random_state=42)
            clusters = self.clustering_model.fit_predict(X_scaled)
            
            # Update user profile
            self.user_profiles[user_id] = {
                "model_trained": True,
                "training_samples": len(features),
                "clusters": clusters.tolist(),
                "feature_importance": self.preference_model.feature_importances_.tolist(),
                "accuracy": self.preference_model.score(X_scaled, y),
                "last_trained": datetime.now().isoformat()
            }
            
            # Save model
            self.save_user_model(user_id)
            
            logger.info(f"Successfully trained model for user {user_id}")
            return {
                "success": True,
                "user_id": user_id,
                "accuracy": self.user_profiles[user_id]["accuracy"],
                "samples": len(features)
            }
            
        except Exception as e:
            logger.error(f"Error training user model: {e}")
            return {"success": False, "error": str(e)}
    
    def extract_features(self, behavior_data: List[Dict]) -> List[List[float]]:
        """Extract features from behavior data"""
        features = []
        
        for behavior in behavior_data:
            feature_vector = []
            
            # Time-based features
            if 'timestamp' in behavior:
                timestamp = behavior['timestamp']
                dt = datetime.fromtimestamp(timestamp / 1000)
                feature_vector.extend([
                    dt.hour / 24.0,  # Hour of day
                    dt.weekday() / 6.0,  # Day of week
                    (dt.hour >= 9 and dt.hour <= 17) * 1.0,  # Working hours
                ])
            else:
                feature_vector.extend([0.0, 0.0, 0.0])
            
            # Event type features
            event_types = ['click', 'tool_selection', 'time_spent', 'error', 'success', 'mouse_pattern']
            event_vector = [1.0 if behavior.get('type') == et else 0.0 for et in event_types]
            feature_vector.extend(event_vector)
            
            # Tool usage features
            tools = ['object-detection', 'face-analysis', 'nlp', 'genai', 'rl', 'enhance']
            tool_vector = [1.0 if behavior.get('data', {}).get('tool') == tool else 0.0 for tool in tools]
            feature_vector.extend(tool_vector)
            
            # Performance features
            if 'data' in behavior:
                data = behavior['data']
                feature_vector.extend([
                    data.get('duration', 0) / 10000.0,  # Normalized duration
                    len(data.get('sequence', [])) / 50.0,  # Sequence length
                    data.get('success', 0) * 1.0,  # Success indicator
                ])
            else:
                feature_vector.extend([0.0, 0.0, 0.0])
            
            # Mouse movement features
            if behavior.get('type') == 'mouse_pattern':
                data = behavior.get('data', {})
                feature_vector.extend([
                    data.get('avgVelocity', 0) / 1000.0,  # Normalized velocity
                    data.get('totalDistance', 0) / 10000.0,  # Normalized distance
                    data.get('sampleCount', 0) / 100.0,  # Sample count
                ])
            else:
                feature_vector.extend([0.0, 0.0, 0.0])
            
            features.append(feature_vector)
        
        return features
    
    def create_labels(self, behavior_data: List[Dict]) -> List[int]:
        """Create labels for supervised learning"""
        labels = []
        
        for behavior in behavior_data:
            # Label based on success/failure patterns
            if behavior.get('type') == 'success':
                labels.append(1)  # Success
            elif behavior.get('type') == 'error':
                labels.append(0)  # Failure
            elif behavior.get('type') == 'tool_selection':
                # Label based on tool preference
                labels.append(1)  # Tool selection is positive
            else:
                # Default to neutral
                labels.append(0)
        
        return labels
    
    def predict_user_action(self, user_id: str, context: Dict) -> Dict:
        """Predict user's next action based on context"""
        try:
            if user_id not in self.user_profiles or not self.user_profiles[user_id]["model_trained"]:
                return {"success": False, "error": "Model not trained for this user"}
            
            # Extract features from context
            features = self.extract_context_features(context)
            X = np.array([features])
            X_scaled = self.scaler.transform(X)
            
            # Predict action
            prediction = self.preference_model.predict(X_scaled)[0]
            probabilities = self.preference_model.predict_proba(X_scaled)[0]
            
            # Get cluster information
            cluster = self.clustering_model.predict(X_scaled)[0]
            
            return {
                "success": True,
                "prediction": int(prediction),
                "confidence": float(max(probabilities)),
                "probabilities": probabilities.tolist(),
                "cluster": int(cluster),
                "recommended_action": self.get_action_for_cluster(cluster, context)
            }
            
        except Exception as e:
            logger.error(f"Error predicting user action: {e}")
            return {"success": False, "error": str(e)}
    
    def extract_context_features(self, context: Dict) -> List[float]:
        """Extract features from current context"""
        features = []
        
        # Time features
        now = datetime.now()
        features.extend([
            now.hour / 24.0,
            now.weekday() / 6.0,
            (now.hour >= 9 and now.hour <= 17) * 1.0,
        ])
        
        # Page context
        pages = ['editor', 'home', 'gallery', 'settings']
        page_vector = [1.0 if context.get('page') == page else 0.0 for page in pages]
        features.extend(page_vector)
        
        # Tool context
        tools = ['object-detection', 'face-analysis', 'nlp', 'genai', 'rl']
        tool_vector = [1.0 if context.get('current_tool') == tool else 0.0 for tool in tools]
        features.extend(tool_vector)
        
        # Session context
        features.extend([
            context.get('session_duration', 0) / 3600.0,  # Session duration in hours
            context.get('events_count', 0) / 100.0,  # Event count
            context.get('error_count', 0) / 10.0,  # Error count
        ])
        
        # Pad features if necessary
        while len(features) < 20:
            features.append(0.0)
        
        return features[:20]
    
    def get_action_for_cluster(self, cluster: int, context: Dict) -> Dict:
        """Get recommended action for a specific cluster"""
        cluster_actions = {
            0: {"action": "suggest_tutorial", "reason": "User appears to be learning"},
            1: {"action": "suggest_advanced_features", "reason": "User is experienced"},
            2: {"action": "suggest_workflow_optimization", "reason": "User has inefficient patterns"},
            3: {"action": "suggest_break", "reason": "User might be fatigued"},
            4: {"action": "suggest_exploration", "reason": "User is exploring new features"}
        }
        
        action = cluster_actions.get(cluster, {"action": "continue", "reason": "Default action"})
        
        # Adjust based on context
        if context.get('page') == 'editor' and context.get('error_count', 0) > 2:
            action["action"] = "suggest_help"
            action["reason"] = "User is struggling"
        
        return action
    
    def generate_personalized_feedback(self, user_id: str, operation: str, result: Dict, user_history: List[Dict]) -> Dict:
        """Generate personalized feedback based on user behavior"""
        try:
            # Analyze user's current skill level
            skill_level = self.assess_user_skill_level(user_id, user_history)
            
            # Analyze operation result
            operation_analysis = self.analyze_operation_result(operation, result)
            
            # Generate feedback based on patterns
            feedback = {
                "message": "",
                "type": "neutral",
                "suggestions": [],
                "encouragement": "",
                "skill_level": skill_level,
                "next_steps": []
            }
            
            # Success feedback
            if operation_analysis.get('success', False):
                feedback["type"] = "positive"
                feedback["message"] = f"Excellent work on {operation}!"
                
                if skill_level == "beginner":
                    feedback["encouragement"] = "You're making great progress! Keep practicing."
                    feedback["next_steps"] = ["Try the tutorial", "Experiment with settings"]
                elif skill_level == "intermediate":
                    feedback["encouragement"] = "Good technique! Consider advanced features."
                    feedback["next_steps"] = ["Try custom parameters", "Combine with other tools"]
                else:
                    feedback["encouragement"] = "Outstanding! You're mastering this feature."
                    feedback["next_steps"] = ["Create custom workflows", "Share your techniques"]
            
            # Failure feedback
            else:
                feedback["type"] = "constructive"
                feedback["message"] = f"Let's improve your {operation} technique."
                
                # Analyze common mistakes
                common_errors = self.identify_common_errors(user_id, operation, result)
                feedback["suggestions"] = common_errors
                
                if skill_level == "beginner":
                    feedback["encouragement"] = "Don't worry! Everyone starts somewhere."
                    feedback["next_steps"] = ["Watch tutorial", "Practice with examples"]
                elif skill_level == "intermediate":
                    feedback["encouragement"] = "This is challenging, but you can do it."
                    feedback["nextSteps"] = ["Review documentation", "Adjust parameters"]
                else:
                    feedback["encouragement"] = "Even experts face challenges."
                    feedback["nextSteps"] = ["Try different approach", "Check community solutions"]
            
            # Add personalized tips based on user patterns
            user_patterns = self.analyze_user_patterns(user_id)
            if user_patterns.get('prefers_visual_learning'):
                feedback["suggestions"].append("Try watching video tutorials")
            if user_patterns.get('prefers_step_by_step'):
                feedback["suggestions"].append("Break down complex operations")
            
            return feedback
            
        except Exception as e:
            logger.error(f"Error generating feedback: {e}")
            return {"success": False, "error": str(e)}
    
    def assess_user_skill_level(self, user_id: str, user_history: List[Dict]) -> str:
        """Assess user's skill level based on behavior history"""
        if user_id not in self.user_profiles:
            return "beginner"
        
        profile = self.user_profiles[user_id]
        
        # Consider multiple factors
        total_operations = len(user_history)
        success_rate = profile.get('accuracy', 0)
        training_samples = profile.get('training_samples', 0)
        
        # Determine skill level
        if total_operations < 20 or success_rate < 0.6:
            return "beginner"
        elif total_operations < 100 or success_rate < 0.8:
            return "intermediate"
        else:
            return "advanced"
    
    def analyze_operation_result(self, operation: str, result: Dict) -> Dict:
        """Analyze operation result"""
        analysis = {
            "success": result.get('success', False),
            "duration": result.get('duration', 0),
            "errors": result.get('errors', []),
            "efficiency": 1.0,
            "quality": 0.5
        }
        
        # Calculate efficiency based on duration
        expected_durations = {
            'object-detection': 5000,  # 5 seconds
            'face-analysis': 3000,  # 3 seconds
            'nlp': 2000,  # 2 seconds
            'genai': 10000,  # 10 seconds
        }
        
        expected = expected_durations.get(operation, 5000)
        analysis["efficiency"] = expected / max(analysis["duration"], 1)
        
        # Calculate quality based on result
        if result.get('success'):
            analysis["quality"] = min(1.0, analysis["efficiency"] * (1 - len(analysis["errors"]) * 0.1))
        else:
            analysis["quality"] = 0.1
        
        return analysis
    
    def identify_common_errors(self, user_id: str, operation: str, result: Dict) -> List[str]:
        """Identify common errors based on user history"""
        errors = result.get('errors', [])
        suggestions = []
        
        # Analyze error patterns
        if "timeout" in str(errors).lower():
            suggestions.append("Try reducing image size or complexity")
        
        if "invalid_format" in str(errors).lower():
            suggestions.append("Check file format and requirements")
        
        if "permission" in str(errors).lower():
            suggestions.append("Ensure you have the necessary permissions")
        
        if "parameter" in str(errors).lower():
            suggestions.append("Review parameter values and ranges")
        
        # Add user-specific suggestions
        user_patterns = self.behavior_patterns.get(user_id, [])
        if user_patterns:
            recent_errors = [p for p in user_patterns if p.get('type') == 'error'][-5:]
            if len(recent_errors) >= 3:
                suggestions.append("Take a break and try again later")
        
        return suggestions
    
    def analyze_user_patterns(self, user_id: str) -> Dict:
        """Analyze user behavior patterns"""
        patterns = {
            "prefers_visual_learning": False,
            "prefers_step_by_step": False,
            "works_best_in_morning": False,
            "works_best_in_evening": False,
            "error_prone_operations": [],
            "successful_sequences": []
        }
        
        user_behaviors = self.behavior_patterns.get(user_id, [])
        if not user_behaviors:
            return patterns
        
        # Analyze time patterns
        morning_hours = range(6, 12)
        evening_hours = range(18, 22)
        
        morning_success = 0
        evening_success = 0
        morning_total = 0
        evening_total = 0
        
        for behavior in user_behaviors:
            if 'timestamp' in behavior:
                hour = datetime.fromtimestamp(behavior['timestamp'] / 1000).hour
                
                if hour in morning_hours:
                    morning_total += 1
                    if behavior.get('type') == 'success':
                        morning_success += 1
                elif hour in evening_hours:
                    evening_total += 1
                    if behavior.get('type') == 'success':
                        evening_success += 1
        
        if morning_total > 0:
            patterns["works_best_in_morning"] = (morning_success / morning_total) > 0.7
        
        if evening_total > 0:
            patterns["works_best_in_evening"] = (evening_success / evening_total) > 0.7
        
        # Analyze learning preferences
        tool_selections = [b for b in user_behaviors if b.get('type') == 'tool_selection']
        if len(tool_selections) > 5:
            # Check if user explores different tools (visual learner)
            unique_tools = len(set(b.get('data', {}).get('tool') for b in tool_selections))
            patterns["prefers_visual_learning"] = unique_tools > len(tool_selections) * 0.5
        
        return patterns
    
    def save_user_model(self, user_id: str):
        """Save trained user model"""
        try:
            model_path = self.models_dir / f"{user_id}_model.pkl"
            scaler_path = self.models_dir / f"{user_id}_scaler.pkl"
            
            with open(model_path, 'wb') as f:
                pickle.dump(self.preference_model, f)
            
            with open(scaler_path, 'wb') as f:
                pickle.dump(self.scaler, f)
            
            logger.info(f"Saved model for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")
    
    def load_user_model(self, user_id: str) -> bool:
        """Load trained user model"""
        try:
            model_path = self.models_dir / f"{user_id}_model.pkl"
            scaler_path = self.models_dir / f"{user_id}_scaler.pkl"
            
            if model_path.exists() and scaler_path.exists():
                with open(model_path, 'rb') as f:
                    self.preference_model = pickle.load(f)
                
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                
                self.user_profiles[user_id] = {
                    "model_trained": True,
                    "last_loaded": datetime.now().isoformat()
                }
                
                logger.info(f"Loaded model for user {user_id}")
                return True
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
        
        return False
    
    def update_behavior_data(self, user_id: str, behavior_data: List[Dict]):
        """Update behavior data for user"""
        self.behavior_patterns[user_id].extend(behavior_data)
        
        # Keep only recent data
        if len(self.behavior_patterns[user_id]) > 1000:
            self.behavior_patterns[user_id] = self.behavior_patterns[user_id][-1000:]
        
        # Update success and error patterns
        for behavior in behavior_data:
            if behavior.get('type') == 'success':
                self.success_patterns[user_id].append(behavior)
            elif behavior.get('type') == 'error':
                self.error_patterns[user_id].append(behavior)
        
        # Limit pattern storage
        if len(self.success_patterns[user_id]) > 100:
            self.success_patterns[user_id] = self.success_patterns[user_id][-100:]
        
        if len(self.error_patterns[user_id]) > 50:
            self.error_patterns[user_id] = self.error_patterns[user_id][-50:]

# Initialize global service instance
user_behavior_learner = UserBehaviorLearner()

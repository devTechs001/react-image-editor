# backend/services/reinforcement_learning.py
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import gym
from collections import deque, namedtuple
import random
import json
import logging
from typing import List, Dict, Tuple, Optional, Any
import time
from pathlib import Path
import pickle
import matplotlib.pyplot as plt
import io
import base64
from PIL import Image

logger = logging.getLogger(__name__)

# Experience tuple for replay buffer
Experience = namedtuple('Experience', ['state', 'action', 'reward', 'next_state', 'done'])

class DQN(nn.Module):
    """Deep Q-Network for DQN algorithm"""
    def __init__(self, state_size: int, action_size: int, hidden_layers: List[int] = [256, 128]):
        super(DQN, self).__init__()
        
        layers = []
        input_size = state_size
        
        # Build hidden layers
        for hidden_size in hidden_layers:
            layers.append(nn.Linear(input_size, hidden_size))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(0.2))
            input_size = hidden_size
        
        # Output layer
        layers.append(nn.Linear(input_size, action_size))
        
        self.network = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.network(x)

class ReplayBuffer:
    """Experience replay buffer for DQN"""
    def __init__(self, capacity: int = 10000):
        self.buffer = deque(maxlen=capacity)
    
    def push(self, state, action, reward, next_state, done):
        self.buffer.append(Experience(state, action, reward, next_state, done))
    
    def sample(self, batch_size: int):
        experiences = random.sample(self.buffer, batch_size)
        states = torch.FloatTensor([e.state for e in experiences])
        actions = torch.LongTensor([e.action for e in experiences])
        rewards = torch.FloatTensor([e.reward for e in experiences])
        next_states = torch.FloatTensor([e.next_state for e in experiences])
        dones = torch.BoolTensor([e.done for e in experiences])
        
        return states, actions, rewards, next_states, dones
    
    def __len__(self):
        return len(self.buffer)

class ImageClassificationEnv:
    """Custom environment for image classification RL task"""
    def __init__(self, dataset_size: int = 1000, num_classes: int = 10):
        self.dataset_size = dataset_size
        self.num_classes = num_classes
        self.current_step = 0
        self.max_steps = 100
        self.state_size = 784  # 28x28 flattened
        self.action_size = num_classes
        
        # Generate random dataset (in production, load real dataset)
        self.dataset = self.generate_dataset()
        self.reset()
    
    def generate_dataset(self):
        """Generate random image dataset (mock)"""
        dataset = []
        for i in range(self.dataset_size):
            # Random 28x28 image
            image = np.random.rand(28, 28, 3) * 255
            label = np.random.randint(0, self.num_classes)
            dataset.append((image, label))
        return dataset
    
    def reset(self):
        """Reset environment"""
        self.current_step = 0
        self.current_image_idx = np.random.randint(0, self.dataset_size)
        self.image, self.true_label = self.dataset[self.current_image_idx]
        self.current_class = np.random.randint(0, self.num_classes)
        return self.get_state()
    
    def get_state(self):
        """Get current state"""
        # Flatten image and concatenate with current class
        flattened_image = self.image.flatten() / 255.0
        class_one_hot = np.eye(self.num_classes)[self.current_class]
        state = np.concatenate([flattened_image, class_one_hot])
        return state
    
    def step(self, action):
        """Take action and return reward"""
        self.current_step += 1
        self.current_class = action
        
        # Calculate reward based on accuracy
        reward = 1.0 if action == self.true_label else -1.0
        
        # Bonus for quick learning
        if self.current_step < 10 and action == self.true_label:
            reward += 0.5
        
        done = self.current_step >= self.max_steps
        
        # Move to next image
        if not done:
            self.current_image_idx = np.random.randint(0, self.dataset_size)
            self.image, self.true_label = self.dataset[self.current_image_idx]
        
        return self.get_state(), reward, done, {}

class ReinforcementLearningService:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.models = {}
        self.training_sessions = {}
        self.model_cache_dir = Path("models/rl")
        self.model_cache_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"RL Service initialized on device: {self.device}")
    
    def create_dqn_agent(self, state_size: int, action_size: int, hidden_layers: List[int] = [256, 128]) -> DQN:
        """Create DQN agent"""
        return DQN(state_size, action_size, hidden_layers).to(self.device)
    
    def initialize_training(self, algorithm: str, environment: str, hyperparameters: Dict, total_episodes: int = 1000) -> str:
        """Initialize RL training session"""
        training_id = str(int(time.time()))
        
        # Create environment
        if environment == 'image-classification':
            env = ImageClassificationEnv()
        else:
            # Add more environments as needed
            env = ImageClassificationEnv()
        
        # Create model based on algorithm
        if algorithm == 'dqn':
            model = self.create_dqn_agent(env.state_size, env.action_size, hyperparameters.get('hidden_layers', [256, 128]))
            target_model = self.create_dqn_agent(env.state_size, env.action_size, hyperparameters.get('hidden_layers', [256, 128]))
            target_model.load_state_dict(model.state_dict())
        else:
            # Add other algorithms
            model = self.create_dqn_agent(env.state_size, env.action_size)
            target_model = self.create_dqn_agent(env.state_size, env.action_size)
            target_model.load_state_dict(model.state_dict())
        
        # Create optimizer
        optimizer = optim.Adam(model.parameters(), lr=hyperparameters.get('learning_rate', 0.001))
        
        # Create replay buffer
        replay_buffer = ReplayBuffer(hyperparameters.get('memory_size', 10000))
        
        # Store training session
        self.training_sessions[training_id] = {
            'algorithm': algorithm,
            'environment': environment,
            'model': model,
            'target_model': target_model,
            'optimizer': optimizer,
            'replay_buffer': replay_buffer,
            'env': env,
            'hyperparameters': hyperparameters,
            'total_episodes': total_episodes,
            'current_episode': 0,
            'metrics': {
                'rewards': [],
                'losses': [],
                'accuracies': [],
                'exploration_rates': []
            },
            'start_time': time.time(),
            'status': 'initialized'
        }
        
        logger.info(f"Training session {training_id} initialized")
        return training_id
    
    def train_agent(self, training_id: str, num_episodes: int = 1) -> Dict:
        """Train RL agent for specified number of episodes"""
        if training_id not in self.training_sessions:
            return {'success': False, 'error': 'Training session not found'}
        
        session = self.training_sessions[training_id]
        session['status'] = 'training'
        
        model = session['model']
        target_model = session['target_model']
        optimizer = session['optimizer']
        replay_buffer = session['replay_buffer']
        env = session['env']
        hyperparameters = session['hyperparameters']
        
        # Training parameters
        batch_size = hyperparameters.get('batch_size', 32)
        gamma = hyperparameters.get('gamma', 0.99)
        epsilon_start = hyperparameters.get('epsilon', 1.0)
        epsilon_end = hyperparameters.get('epsilon_min', 0.01)
        epsilon_decay = hyperparameters.get('epsilon_decay', 0.995)
        target_update_freq = hyperparameters.get('target_update_freq', 1000)
        
        # Training loop
        total_steps = 0
        episode_rewards = []
        episode_losses = []
        episode_accuracies = []
        
        for episode in range(num_episodes):
            state = env.reset()
            episode_reward = 0
            episode_loss = 0
            correct_predictions = 0
            total_predictions = 0
            
            # Calculate epsilon for this episode
            epsilon = max(epsilon_end, epsilon_start * (epsilon_decay ** session['current_episode']))
            
            while True:
                # Epsilon-greedy action selection
                if random.random() > epsilon:
                    with torch.no_grad():
                        state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
                        q_values = model(state_tensor)
                        action = q_values.argmax().item()
                else:
                    action = env.action_space.sample()
                
                # Take action
                next_state, reward, done, _ = env.step(action)
                
                # Store experience
                replay_buffer.push(state, action, reward, next_state, done)
                
                # Track metrics
                episode_reward += reward
                total_predictions += 1
                if action == env.true_label:
                    correct_predictions += 1
                
                state = next_state
                total_steps += 1
                
                if done:
                    break
            
            # Train model if we have enough experiences
            if len(replay_buffer) > batch_size:
                loss = self.train_dqn_step(model, target_model, optimizer, replay_buffer, batch_size, gamma)
                episode_loss += loss
                
                # Update target network
                if total_steps % target_update_freq == 0:
                    target_model.load_state_dict(model.state_dict())
            
            # Calculate accuracy
            episode_accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
            
            # Store metrics
            episode_rewards.append(episode_reward)
            episode_losses.append(episode_loss)
            episode_accuracies.append(episode_accuracy)
            
            session['current_episode'] += 1
            session['metrics']['rewards'].append(episode_reward)
            session['metrics']['losses'].append(episode_loss)
            session['metrics']['accuracies'].append(episode_accuracy)
            session['metrics']['exploration_rates'].append(epsilon)
        
        # Calculate averages
        avg_reward = np.mean(episode_rewards)
        avg_loss = np.mean(episode_losses)
        avg_accuracy = np.mean(episode_accuracies)
        
        return {
            'success': True,
            'trainingId': training_id,
            'episodesTrained': num_episodes,
            'currentEpisode': session['current_episode'],
            'metrics': {
                'reward': avg_reward,
                'loss': avg_loss,
                'accuracy': avg_accuracy,
                'exploration_rate': epsilon
            }
        }
    
    def train_dqn_step(self, model, target_model, optimizer, replay_buffer, batch_size, gamma):
        """Train DQN for one step"""
        states, actions, rewards, next_states, dones = replay_buffer.sample(batch_size)
        
        states = states.to(self.device)
        actions = actions.to(self.device)
        rewards = rewards.to(self.device)
        next_states = next_states.to(self.device)
        dones = dones.to(self.device)
        
        # Current Q values
        current_q_values = model(states).gather(1, actions.unsqueeze(1))
        
        # Next Q values from target network
        next_q_values = target_model(next_states).max(1)[0].detach()
        target_q_values = rewards + (gamma * next_q_values * ~dones)
        
        # Calculate loss
        loss = nn.MSELoss()(current_q_values.squeeze(), target_q_values)
        
        # Optimize
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        return loss.item()
    
    def get_training_status(self, training_id: str) -> Dict:
        """Get current training status"""
        if training_id not in self.training_sessions:
            return {'success': False, 'error': 'Training session not found'}
        
        session = self.training_sessions[training_id]
        metrics = session['metrics']
        
        # Calculate recent averages
        window_size = min(50, len(metrics['rewards']))
        if window_size > 0:
            recent_rewards = metrics['rewards'][-window_size:]
            recent_losses = metrics['losses'][-window_size:]
            recent_accuracies = metrics['accuracies'][-window_size:]
            
            avg_reward = np.mean(recent_rewards)
            avg_loss = np.mean(recent_losses)
            avg_accuracy = np.mean(recent_accuracies)
        else:
            avg_reward = 0
            avg_loss = 1.0
            avg_accuracy = 0
        
        progress = (session['current_episode'] / session['total_episodes']) * 100
        
        return {
            'success': True,
            'trainingId': training_id,
            'progress': progress,
            'currentEpisode': session['current_episode'],
            'totalEpisodes': session['total_episodes'],
            'status': session['status'],
            'metrics': {
                'reward': avg_reward,
                'loss': avg_loss,
                'accuracy': avg_accuracy,
                'exploration_rate': metrics['exploration_rates'][-1] if metrics['exploration_rates'] else 1.0
            },
            'elapsedTime': time.time() - session['start_time']
        }
    
    def save_model(self, training_id: str, model_data: Dict = None) -> Dict:
        """Save trained model"""
        if training_id not in self.training_sessions:
            return {'success': False, 'error': 'Training session not found'}
        
        session = self.training_sessions[training_id]
        
        # Create model data
        save_data = {
            'model_state_dict': session['model'].state_dict(),
            'optimizer_state_dict': session['optimizer'].state_dict(),
            'hyperparameters': session['hyperparameters'],
            'metrics': session['metrics'],
            'current_episode': session['current_episode'],
            'algorithm': session['algorithm'],
            'environment': session['environment'],
            'timestamp': time.time()
        }
        
        # Add custom model data if provided
        if model_data:
            save_data.update(model_data)
        
        # Save to file
        model_path = self.model_cache_dir / f"rl_model_{training_id}_{int(time.time())}.pth"
        torch.save(save_data, model_path)
        
        return {
            'success': True,
            'modelPath': str(model_path),
            'timestamp': save_data['timestamp']
        }
    
    def load_model(self, model_path: str) -> Dict:
        """Load saved model"""
        try:
            save_data = torch.load(model_path, map_location=self.device)
            
            # Create new training session with loaded model
            training_id = str(int(time.time()))
            
            # Recreate environment
            if save_data['environment'] == 'image-classification':
                env = ImageClassificationEnv()
            else:
                env = ImageClassificationEnv()
            
            # Recreate models
            model = self.create_dqn_agent(
                env.state_size, 
                env.action_size, 
                save_data['hyperparameters'].get('hidden_layers', [256, 128])
            )
            model.load_state_dict(save_data['model_state_dict'])
            
            target_model = self.create_dqn_agent(
                env.state_size, 
                env.action_size, 
                save_data['hyperparameters'].get('hidden_layers', [256, 128])
            )
            target_model.load_state_dict(save_data['model_state_dict'])
            
            # Recreate optimizer
            optimizer = optim.Adam(model.parameters(), lr=save_data['hyperparameters'].get('learning_rate', 0.001))
            optimizer.load_state_dict(save_data['optimizer_state_dict'])
            
            # Create replay buffer
            replay_buffer = ReplayBuffer(save_data['hyperparameters'].get('memory_size', 10000))
            
            # Store session
            self.training_sessions[training_id] = {
                'algorithm': save_data['algorithm'],
                'environment': save_data['environment'],
                'model': model,
                'target_model': target_model,
                'optimizer': optimizer,
                'replay_buffer': replay_buffer,
                'env': env,
                'hyperparameters': save_data['hyperparameters'],
                'total_episodes': save_data['total_episodes'],
                'current_episode': save_data['current_episode'],
                'metrics': save_data['metrics'],
                'start_time': time.time(),
                'status': 'loaded'
            }
            
            return {
                'success': True,
                'trainingId': training_id,
                'modelData': save_data
            }
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_training_plot(self, training_id: str, metric: str = 'rewards') -> str:
        """Generate training plot as base64 string"""
        if training_id not in self.training_sessions:
            return ""
        
        session = self.training_sessions[training_id]
        metrics = session['metrics']
        
        if metric not in metrics or not metrics[metric]:
            return ""
        
        # Create plot
        plt.figure(figsize=(10, 6))
        plt.plot(metrics[metric])
        plt.title(f'Training {metric.capitalize()}')
        plt.xlabel('Episode')
        plt.ylabel(metric.capitalize())
        plt.grid(True)
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        plot_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return f"data:image/png;base64,{plot_base64}"
    
    def calculate_convergence_metrics(self, training_id: str) -> Dict:
        """Calculate convergence metrics"""
        if training_id not in self.training_sessions:
            return {}
        
        session = self.training_sessions[training_id]
        metrics = session['metrics']
        
        if len(metrics['rewards']) < 10:
            return {
                'convergence_rate': 0,
                'stability_score': 0,
                'efficiency': 0
            }
        
        # Recent rewards
        recent_rewards = metrics['rewards'][-50:]
        recent_losses = metrics['losses'][-50:]
        recent_accuracies = metrics['accuracies'][-50:]
        
        # Convergence rate (improvement in recent rewards)
        if len(recent_rewards) >= 20:
            first_half = recent_rewards[:25]
            second_half = recent_rewards[25:]
            convergence_rate = (np.mean(second_half) - np.mean(first_half)) / abs(np.mean(first_half))
        else:
            convergence_rate = 0
        
        # Stability score (inverse of variance)
        stability_score = 1 - (np.std(recent_rewards) / (np.mean(recent_rewards) + 1e-8))
        stability_score = max(0, min(1, stability_score))
        
        # Efficiency (accuracy per loss)
        avg_accuracy = np.mean(recent_accuracies)
        avg_loss = np.mean(recent_losses)
        efficiency = avg_accuracy / (avg_loss + 1e-8)
        
        return {
            'convergence_rate': float(convergence_rate),
            'stability_score': float(stability_score),
            'efficiency': float(efficiency)
        }
    
    def cleanup_session(self, training_id: str):
        """Clean up training session"""
        if training_id in self.training_sessions:
            del self.training_sessions[training_id]
            logger.info(f"Training session {training_id} cleaned up")

# Initialize global service instance
rl_service = ReinforcementLearningService()

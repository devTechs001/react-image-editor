# backend/services/natural_language_processing.py
import torch
from transformers import (
    pipeline, AutoTokenizer, AutoModelForCausalLM, AutoModelForSequenceClassification,
    AutoModelForSeq2SeqLM, AutoModelForTokenClassification, T5ForConditionalGeneration,
    GPT2LMHeadModel, GPT2Tokenizer, BertTokenizer, BertForSequenceClassification,
    MarianMTModel, MarianTokenizer, WhisperProcessor, WhisperModel
)
import speech_recognition as sr
import pydub
from pydub import AudioSegment
import io
import base64
import wave
import numpy as np
from typing import List, Dict, Optional, Tuple
import logging
import json
import re
from collections import Counter
import math

logger = logging.getLogger(__name__)

class NaturalLanguageProcessingService:
    def __init__(self):
        # Initialize models on demand to save memory
        self.text_generator = None
        self.sentiment_analyzer = None
        self.translator = None
        self.summarizer = None
        self.keyword_extractor = None
        self.speech_recognizer = None
        
        # Model configurations
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")
    
    def load_text_generator(self, model_name: str = "microsoft/DialoGPT-medium"):
        """Load text generation model"""
        if self.text_generator is None or self.text_generator.model_name != model_name:
            try:
                if "gpt" in model_name.lower():
                    self.text_generator = pipeline(
                        "text-generation",
                        model=model_name,
                        device=0 if self.device == "cuda" else -1,
                        torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
                    )
                else:
                    self.text_generator = pipeline(
                        "text-generation",
                        model=model_name,
                        device=0 if self.device == "cuda" else -1
                    )
                self.text_generator.model_name = model_name
            except Exception as e:
                logger.error(f"Error loading text generator: {e}")
                # Fallback to smaller model
                self.text_generator = pipeline("text-generation", model="gpt2")
                self.text_generator.model_name = "gpt2"
        
        return self.text_generator
    
    def load_sentiment_analyzer(self, model_name: str = "cardiffnlp/twitter-roberta-base-sentiment-latest"):
        """Load sentiment analysis model"""
        if self.sentiment_analyzer is None:
            try:
                self.sentiment_analyzer = pipeline(
                    "sentiment-analysis",
                    model=model_name,
                    device=0 if self.device == "cuda" else -1
                )
            except Exception as e:
                logger.error(f"Error loading sentiment analyzer: {e}")
                self.sentiment_analyzer = pipeline("sentiment-analysis")
        
        return self.sentiment_analyzer
    
    def load_translator(self, source_lang: str = "en", target_lang: str = "es"):
        """Load translation model"""
        model_name = f"Helsinki-NLP/opus-mt-{source_lang}-{target_lang}"
        
        if self.translator is None or self.translator.model_name != model_name:
            try:
                self.translator = pipeline(
                    "translation",
                    model=model_name,
                    device=0 if self.device == "cuda" else -1
                )
                self.translator.model_name = model_name
            except Exception as e:
                logger.error(f"Error loading translator: {e}")
                # Fallback
                self.translator = pipeline("translation", model="Helsinki-NLP/opus-mt-en-es")
                self.translator.model_name = "Helsinki-NLP/opus-mt-en-es"
        
        return self.translator
    
    def load_summarizer(self, model_name: str = "facebook/bart-large-cnn"):
        """Load text summarization model"""
        if self.summarizer is None:
            try:
                self.summarizer = pipeline(
                    "summarization",
                    model=model_name,
                    device=0 if self.device == "cuda" else -1
                )
            except Exception as e:
                logger.error(f"Error loading summarizer: {e}")
                self.summarizer = pipeline("summarization")
        
        return self.summarizer
    
    def load_keyword_extractor(self):
        """Load keyword extraction model"""
        if self.keyword_extractor is None:
            try:
                from keybert import KeyBERT
                self.keyword_extractor = KeyBERT()
            except Exception as e:
                logger.error(f"Error loading keyword extractor: {e}")
                # Fallback to basic extraction
                self.keyword_extractor = None
        
        return self.keyword_extractor
    
    def load_speech_recognizer(self):
        """Load speech recognition"""
        if self.speech_recognizer is None:
            try:
                self.speech_recognizer = sr.Recognizer()
                # Also load Whisper for better accuracy
                self.whisper_processor = WhisperProcessor.from_pretrained("openai/whisper-base")
                self.whisper_model = WhisperModel.from_pretrained("openai/whisper-base").to(self.device)
            except Exception as e:
                logger.error(f"Error loading speech recognizer: {e}")
                self.speech_recognizer = sr.Recognizer()
        
        return self.speech_recognizer
    
    def generate_text(self, prompt: str, model: str = "gpt-2", max_tokens: int = 500, temperature: float = 0.7) -> Dict:
        """Generate text using language model"""
        try:
            generator = self.load_text_generator(model)
            
            # Generate text
            result = generator(
                prompt,
                max_length=max_tokens,
                temperature=temperature,
                num_return_sequences=1,
                do_sample=True,
                pad_token_id=generator.tokenizer.eos_token_id
            )
            
            generated_text = result[0]['generated_text']
            
            # Calculate metrics
            token_count = len(generated_text.split())
            creativity = temperature
            coherence = self.calculate_coherence(generated_text)
            
            return {
                'success': True,
                'output': generated_text,
                'model': model,
                'tokenCount': token_count,
                'creativity': creativity,
                'coherence': coherence
            }
        except Exception as e:
            logger.error(f"Text generation error: {e}")
            return {'success': False, 'error': str(e)}
    
    def analyze_sentiment(self, text: str, model: str = "roberta") -> Dict:
        """Analyze sentiment of text"""
        try:
            analyzer = self.load_sentiment_analyzer(model)
            
            # Get sentiment
            result = analyzer(text)
            
            # Get detailed emotions if available
            emotions = self.analyze_emotions(text)
            
            return {
                'success': True,
                'sentiment': {
                    'label': result[0]['label'],
                    'scores': self.get_sentiment_scores(result[0]),
                    'confidence': result[0]['score']
                },
                'emotions': emotions,
                'model': model
            }
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {'success': False, 'error': str(e)}
    
    def translate_text(self, text: str, source_lang: str, target_lang: str, model: str = "default") -> Dict:
        """Translate text between languages"""
        try:
            translator = self.load_translator(source_lang, target_lang)
            
            # Translate text
            result = translator(text)
            
            translated_text = result[0]['translation_text']
            confidence = self.calculate_translation_confidence(text, translated_text)
            
            return {
                'success': True,
                'output': translated_text,
                'sourceLanguage': source_lang,
                'targetLanguage': target_lang,
                'model': model,
                'confidence': confidence
            }
        except Exception as e:
            logger.error(f"Translation error: {e}")
            return {'success': False, 'error': str(e)}
    
    def summarize_text(self, text: str, model: str = "bart", compression_ratio: float = 0.3) -> Dict:
        """Summarize text"""
        try:
            summarizer = self.load_summarizer(model)
            
            # Calculate max length based on compression ratio
            max_length = int(len(text.split()) * compression_ratio)
            min_length = max(10, max_length // 2)
            
            # Summarize
            result = summarizer(
                text,
                max_length=max_length,
                min_length=min_length,
                do_sample=False
            )
            
            summary = result[0]['summary_text']
            key_points = self.extract_key_points(text)
            
            return {
                'success': True,
                'output': summary,
                'keyPoints': key_points,
                'compressionRatio': compression_ratio,
                'model': model
            }
        except Exception as e:
            logger.error(f"Summarization error: {e}")
            return {'success': False, 'error': str(e)}
    
    def extract_keywords(self, text: str, model: str = "keybert", max_keywords: int = 10) -> Dict:
        """Extract keywords from text"""
        try:
            if model == "keybert" and self.keyword_extractor:
                # Use KeyBERT for better keyword extraction
                keywords = self.keyword_extractor.extract_keywords(
                    text,
                    keyphrase_ngram_range=(1, 2),
                    stop_words='english',
                    max_keywords=max_keywords
                )
                
                keyword_list = [
                    {'keyword': kw[0], 'relevance': float(kw[1])}
                    for kw in keywords
                ]
            else:
                # Fallback to basic extraction
                keyword_list = self.basic_keyword_extraction(text, max_keywords)
            
            topics = self.extract_topics(text)
            
            return {
                'success': True,
                'keywords': keyword_list,
                'topics': topics,
                'model': model
            }
        except Exception as e:
            logger.error(f"Keyword extraction error: {e}")
            return {'success': False, 'error': str(e)}
    
    def speech_to_text(self, audio_data: bytes, language: str = "en", model: str = "whisper") -> Dict:
        """Convert speech to text"""
        try:
            recognizer = self.load_speech_recognizer()
            
            # Convert audio data to AudioSegment
            audio = AudioSegment.from_file(io.BytesIO(audio_data))
            
            # Convert to WAV format for speech recognition
            wav_buffer = io.BytesIO()
            audio.export(wav_buffer, format="wav")
            wav_buffer.seek(0)
            
            transcription = ""
            confidence = 0.0
            speaker_count = 1
            
            if model == "whisper":
                # Use Whisper for better accuracy
                try:
                    # Convert to numpy array
                    audio_array = np.array(audio.get_array_of_samples(), dtype=np.float32)
                    audio_array = audio_array.reshape((-1, audio.channels))
                    
                    # Process with Whisper
                    inputs = self.whisper_processor(audio_array, sampling_rate=audio.frame_rate, return_tensors="pt").to(self.device)
                    with torch.no_grad():
                        generated_ids = self.whisper_model.generate(inputs["input_features"])
                    
                    transcription = self.whisper_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]["text"]
                    confidence = 0.9  # Whisper typically has high confidence
                except Exception as e:
                    logger.error(f"Whisper processing error: {e}")
                    # Fallback to speech_recognition
            
            # Fallback or alternative method
            if not transcription:
                with sr.AudioFile(wav_buffer) as source:
                    audio_data = recognizer.record(source)
                    transcription = recognizer.recognize_google(audio_data, language=language)
                    confidence = 0.8
            
            # Estimate duration
            duration = len(audio) / 1000.0  # Convert to seconds
            
            return {
                'success': True,
                'transcription': transcription,
                'speakerCount': speaker_count,
                'confidence': confidence,
                'duration': duration,
                'language': language,
                'model': model
            }
        except Exception as e:
            logger.error(f"Speech to text error: {e}")
            return {'success': False, 'error': str(e)}
    
    def decode_base64_audio(self, base64_str: str) -> bytes:
        """Decode base64 audio data"""
        try:
            # Remove data URL prefix if present
            if 'base64,' in base64_str:
                base64_str = base64_str.split('base64,')[1]
            
            return base64.b64decode(base64_str)
        except Exception as e:
            logger.error(f"Error decoding base64 audio: {e}")
            raise
    
    def calculate_coherence(self, text: str) -> float:
        """Calculate text coherence score"""
        # Simple coherence calculation based on sentence similarity
        sentences = text.split('.')
        if len(sentences) < 2:
            return 1.0
        
        # Calculate average sentence length and variance
        sentence_lengths = [len(s.split()) for s in sentences if s.strip()]
        if not sentence_lengths:
            return 0.5
        
        avg_length = sum(sentence_lengths) / len(sentence_lengths)
        variance = sum((x - avg_length) ** 2 for x in sentence_lengths) / len(sentence_lengths)
        
        # Coherence based on length consistency
        coherence = max(0, 1 - (variance / (avg_length ** 2)))
        return min(1.0, coherence)
    
    def analyze_emotions(self, text: str) -> List[Dict]:
        """Analyze emotions in text"""
        # Simple emotion analysis based on keyword matching
        emotion_keywords = {
            'joy': ['happy', 'joy', 'excited', 'delighted', 'pleased', 'glad', 'cheerful'],
            'sadness': ['sad', 'unhappy', 'depressed', 'miserable', 'gloomy', 'downcast'],
            'anger': ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated'],
            'fear': ['afraid', 'scared', 'terrified', 'fearful', 'anxious', 'worried'],
            'surprise': ['surprised', 'amazed', 'astonished', 'shocked', 'stunned']
        }
        
        emotions = []
        text_lower = text.lower()
        
        for emotion, keywords in emotion_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                emotions.append({
                    'emotion': emotion,
                    'score': min(1.0, score / len(keywords))
                })
        
        # Sort by score
        emotions.sort(key=lambda x: x['score'], reverse=True)
        
        return emotions
    
    def get_sentiment_scores(self, result: Dict) -> Dict:
        """Get detailed sentiment scores"""
        # Normalize scores to sum to 1
        if 'score' in result:
            score = result['score']
            if result['label'] == 'POSITIVE':
                return {'positive': score, 'negative': 1 - score, 'neutral': 0}
            elif result['label'] == 'NEGATIVE':
                return {'positive': 0, 'negative': score, 'neutral': 1 - score}
            else:
                return {'positive': 0.3, 'negative': 0.3, 'neutral': 0.4}
        return {'positive': 0.3, 'negative': 0.3, 'neutral': 0.4}
    
    def calculate_translation_confidence(self, original: str, translated: str) -> float:
        """Calculate translation confidence"""
        # Simple confidence based on length ratio
        if not original or not translated:
            return 0.5
        
        ratio = len(translated) / len(original)
        # Good translations usually have similar lengths
        if 0.7 <= ratio <= 1.5:
            return 0.85 + (1 - abs(1 - ratio)) * 0.1
        else:
            return max(0.5, 0.85 - abs(1 - ratio) * 0.2)
    
    def extract_key_points(self, text: str) -> List[str]:
        """Extract key points from text"""
        sentences = text.split('.')
        key_points = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence.split()) > 5:  # Only consider substantial sentences
                key_points.append(sentence)
        
        return key_points[:5]  # Return top 5 key points
    
    def basic_keyword_extraction(self, text: str, max_keywords: int) -> List[Dict]:
        """Basic keyword extraction without external models"""
        # Remove punctuation and convert to lowercase
        text_clean = re.sub(r'[^\w\s]', '', text.lower())
        words = text_clean.split()
        
        # Remove common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        words = [word for word in words if word not in stop_words and len(word) > 2]
        
        # Count word frequencies
        word_freq = Counter(words)
        
        # Get top keywords
        top_words = word_freq.most_common(max_keywords)
        total_words = sum(word_freq.values())
        
        keywords = [
            {'keyword': word, 'relevance': freq / total_words}
            for word, freq in top_words
        ]
        
        return keywords
    
    def extract_topics(self, text: str) -> List[Dict]:
        """Extract topics from text"""
        # Simple topic extraction based on word clusters
        topics = {
            'Technology': ['technology', 'computer', 'software', 'digital', 'online', 'internet', 'data'],
            'Business': ['business', 'company', 'market', 'sales', 'revenue', 'profit', 'customer'],
            'Science': ['science', 'research', 'study', 'experiment', 'analysis', 'discovery', 'theory'],
            'Health': ['health', 'medical', 'doctor', 'patient', 'treatment', 'medicine', 'disease']
        }
        
        text_lower = text.lower()
        topic_scores = []
        
        for topic, keywords in topics.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                topic_scores.append({
                    'topic': topic,
                    'weight': score / len(keywords)
                })
        
        # Sort by weight
        topic_scores.sort(key=lambda x: x['weight'], reverse=True)
        
        return topic_scores[:3]

# Initialize global service instance
nlp_service = NaturalLanguageProcessingService()

// backend/src/services/ai/textAnalysis.js
const axios = require('axios');
const config = require('../../config/app');

/**
 * Analyze text for sentiment
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} - Sentiment analysis result
 */
async function analyzeSentiment(text) {
  try {
    // Use Google Cloud Natural Language
    if (config.google.applicationCredentials) {
      return await analyzeWithGoogle(text);
    }

    // Use AWS Comprehend
    if (config.aws.accessKeyId) {
      return await analyzeWithAWS(text);
    }

    // Use Hugging Face
    if (config.huggingface.apiKey) {
      return await analyzeWithHuggingFace(text);
    }

    // Basic keyword-based analysis fallback
    return basicSentimentAnalysis(text);
  } catch (error) {
    throw new Error(`Sentiment analysis failed: ${error.message}`);
  }
}

/**
 * Analyze sentiment using Google Cloud
 */
async function analyzeWithGoogle(text) {
  const language = require('@google-cloud/language');
  
  const client = new language.LanguageServiceClient({
    keyFilename: config.google.applicationCredentials
  });

  const document = {
    content: text,
    type: 'PLAIN_TEXT'
  };

  const [result] = await client.analyzeSentiment({ document });
  const sentiment = result.documentSentiment;

  return {
    score: sentiment.score,
    magnitude: sentiment.magnitude,
    label: sentiment.score > 0.1 ? 'positive' : sentiment.score < -0.1 ? 'negative' : 'neutral',
    sentences: result.sentences?.map(s => ({
      text: s.text.content,
      score: s.sentiment.score,
      magnitude: s.sentiment.magnitude
    }))
  };
}

/**
 * Analyze sentiment using AWS Comprehend
 */
async function analyzeWithAWS(text) {
  const { ComprehendClient, DetectSentimentCommand, DetectKeyPhrasesCommand } = require('@aws-sdk/client-comprehend');

  const client = new ComprehendClient({
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    },
    region: config.aws.region || 'us-east-1'
  });

  const sentimentCommand = new DetectSentimentCommand({
    Text: text,
    LanguageCode: 'en'
  });

  const sentimentResult = await client.send(sentimentCommand);

  const phrasesCommand = new DetectKeyPhrasesCommand({
    Text: text,
    LanguageCode: 'en'
  });

  const phrasesResult = await client.send(phrasesCommand);

  return {
    score: sentimentResult.SentimentScore 
      ? (sentiment.SentimentScore.Positive - sentimentResult.SentimentScore.Negative) 
      : 0,
    label: sentimentResult.Sentiment,
    confidence: sentimentResult.SentimentScore,
    keyPhrases: phrasesResult.KeyPhrases?.map(p => ({
      text: p.Text,
      score: p.Score
    }))
  };
}

/**
 * Analyze sentiment using Hugging Face
 */
async function analyzeWithHuggingFace(text) {
  const response = await axios.post(
    'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english',
    { inputs: text },
    {
      headers: {
        'Authorization': `Bearer ${config.huggingface.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const result = response.data[0];
  return {
    label: result.label.toLowerCase(),
    score: result.score,
    positive: result.label === 'POSITIVE' ? result.score : 1 - result.score,
    negative: result.label === 'NEGATIVE' ? result.score : 1 - result.score
  };
}

/**
 * Basic keyword-based sentiment analysis (fallback)
 */
function basicSentimentAnalysis(text) {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'happy', 'beautiful'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'sad', 'ugly', 'wrong'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });
  
  const total = positiveCount + negativeCount;
  const score = total > 0 ? (positiveCount - negativeCount) / total : 0;
  
  return {
    score,
    label: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
    positiveCount,
    negativeCount,
    confidence: Math.min(total / 10, 1)
  };
}

/**
 * Extract keywords from text
 */
async function extractKeywords(text, options = {}) {
  const { maxKeywords = 10 } = options;

  try {
    if (config.google.applicationCredentials) {
      const language = require('@google-cloud/language');
      const client = new language.LanguageServiceClient({
        keyFilename: config.google.applicationCredentials
      });

      const document = { content: text, type: 'PLAIN_TEXT' };
      const [result] = await client.analyzeEntities({ document });

      return result.entities
        ?.filter(e => e.type === 'CONSUMER_GOOD' || e.type === 'OTHER')
        .slice(0, maxKeywords)
        .map(e => ({
          text: e.name,
          salience: e.salience,
          type: e.type
        })) || [];
    }

    // Fallback: simple word frequency
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);
    
    const frequency = {};
    words.forEach(w => frequency[w] = (frequency[w] || 0) + 1);
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word, count]) => ({ text: word, count }));
  } catch (error) {
    throw new Error(`Keyword extraction failed: ${error.message}`);
  }
}

/**
 * Detect language of text
 */
async function detectLanguage(text) {
  try {
    if (config.google.applicationCredentials) {
      const language = require('@google-cloud/language');
      const client = new language.LanguageServiceClient({
        keyFilename: config.google.applicationCredentials
      });

      const document = { content: text, type: 'PLAIN_TEXT' };
      const [result] = await client.analyzeSyntax({ document });

      return {
        language: result.language,
        confidence: 1
      };
    }

    // Fallback: assume English
    return { language: 'en', confidence: 0.5 };
  } catch (error) {
    throw new Error(`Language detection failed: ${error.message}`);
  }
}

module.exports = {
  analyzeSentiment,
  extractKeywords,
  detectLanguage,
  analyzeWithGoogle,
  analyzeWithAWS,
  analyzeWithHuggingFace,
  basicSentimentAnalysis
};

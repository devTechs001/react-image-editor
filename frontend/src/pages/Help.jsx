// frontend/src/pages/Help.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Book,
  Video,
  MessageSquare,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Mail,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

const faqCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    faqs: [
      {
        question: 'How do I create a new project?',
        answer: 'Click the "New Project" button in the top toolbar, select your project type (image, video, or audio), and choose your canvas dimensions. You can also use one of our pre-made templates to get started quickly.'
      },
      {
        question: 'What file formats are supported?',
        answer: 'We support a wide range of formats:\n• Images: PNG, JPG, WebP, GIF, TIFF, SVG\n• Video: MP4, WebM, MOV, AVI\n• Audio: MP3, WAV, OGG, FLAC\n• Export: PNG, JPG, WebP, GIF, MP4, PDF'
      },
      {
        question: 'How do I import my own images?',
        answer: 'Drag and drop images directly onto the canvas, click the "Upload" button in the assets panel, or use Ctrl+V to paste from clipboard. You can also import from cloud storage services.'
      },
      {
        question: 'Is my work saved automatically?',
        answer: 'Yes! Projects are auto-saved every 30 seconds. You can also manually save with Ctrl+S. All projects are stored in the cloud and accessible from any device.'
      }
    ]
  },
  {
    id: 'ai-features',
    title: 'AI Features',
    icon: MessageSquare,
    faqs: [
      {
        question: 'How does background removal work?',
        answer: 'Our AI automatically detects the main subject in your image and removes the background. Access it from the AI Tools panel. Works best with clear subject separation.'
      },
      {
        question: 'What is AI Enhance?',
        answer: 'AI Enhance automatically improves image quality by adjusting brightness, contrast, color balance, and sharpness. Choose from presets like "Portrait", "Landscape", or "Vivid".'
      },
      {
        question: 'Can I generate images from text?',
        answer: 'Yes! Pro and Enterprise users can generate images from text descriptions using our AI image generation. Access it from the AI Hub.'
      },
      {
        question: 'How many AI credits do I get?',
        answer: 'Free: 10 AI operations/month\nStarter: 50 AI operations/month\nPro: 500 AI operations/month\nEnterprise: 2000 AI operations/month'
      }
    ]
  },
  {
    id: 'layers',
    title: 'Layers & Editing',
    icon: Video,
    faqs: [
      {
        question: 'How do I add a new layer?',
        answer: 'Click the "+" button in the Layers panel, or simply add a new element to your canvas. Each element automatically creates a new layer.'
      },
      {
        question: 'How do I reorder layers?',
        answer: 'Drag layers up or down in the Layers panel. You can also use Ctrl+] to bring forward and Ctrl+[ to send backward.'
      },
      {
        question: 'What are adjustment layers?',
        answer: 'Adjustment layers apply effects to all layers below them without modifying the original content. Right-click in the Layers panel and select "Add Adjustment Layer".'
      },
      {
        question: 'How do I merge layers?',
        answer: 'Select multiple layers (hold Shift), right-click, and choose "Merge Layers". Note: this action cannot be undone, so consider duplicating first.'
      }
    ]
  },
  {
    id: 'export',
    title: 'Export & Sharing',
    icon: ExternalLink,
    faqs: [
      {
        question: 'What export formats are available?',
        answer: 'Image: PNG, JPG, WebP, GIF, TIFF, PDF\nVideo: MP4, WebM, GIF\nQuality settings vary by format. PNG supports transparency, JPG is best for photos.'
      },
      {
        question: 'How do I export with transparent background?',
        answer: 'Use PNG or WebP format and ensure your background layer is hidden or set to transparent. Check "Transparency" in export settings.'
      },
      {
        question: 'Can I export multiple versions at once?',
        answer: 'Yes! Pro users can use Batch Export to generate multiple sizes or formats simultaneously. Select your project and click "Batch Export".'
      },
      {
        question: 'Where are my exported files saved?',
        answer: 'Exports are available for download immediately. You can also find them in the "Exports" section of your dashboard. Files are stored for 30 days.'
      }
    ]
  },
  {
    id: 'billing',
    title: 'Billing & Plans',
    icon: HelpCircle,
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and bank transfers for Enterprise plans.'
      },
      {
        question: 'Can I change my plan later?',
        answer: 'Yes! You can upgrade or downgrade at any time from Settings > Billing. Changes take effect immediately, with prorated charges.'
      },
      {
        question: 'Do you offer refunds?',
        answer: 'We offer a 14-day money-back guarantee for all paid plans. Contact support within 14 days of purchase for a full refund.'
      },
      {
        question: 'Is there a student discount?',
        answer: 'Yes! Students and educators get 50% off Pro plans. Verify your status with a valid .edu email or student ID.'
      }
    ]
  }
];

const contactOptions = [
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with our support team',
    action: 'Start Chat',
    available: 'Available 24/7'
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help via email',
    action: 'Send Email',
    available: 'Response within 24h'
  },
  {
    icon: Book,
    title: 'Documentation',
    description: 'Browse our guides',
    action: 'View Docs',
    available: 'Always available'
  }
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState('getting-started');

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-editor-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-b border-editor-border">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <HelpCircle className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">How can we help you?</h1>
            <p className="text-surface-400 mb-6">Search our knowledge base or browse by category</p>
            
            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-editor-card border border-editor-border text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 sticky top-4">
              {faqCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                      activeCategory === category.id
                        ? 'bg-primary-500/10 text-primary-300 border border-primary-500/30'
                        : 'text-surface-400 hover:bg-editor-card hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{category.title}</span>
                  </button>
                );
              })}
            </nav>

            {/* Contact Options */}
            <div className="mt-8 p-4 rounded-xl bg-editor-card border border-editor-border">
              <h3 className="text-sm font-semibold text-white mb-3">Still need help?</h3>
              <div className="space-y-3">
                {contactOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.title}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-white">{option.title}</p>
                        <p className="text-xs text-surface-500">{option.available}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            {filteredCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <div key={category.id} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                      <CategoryIcon className="w-5 h-5 text-primary-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{category.title}</h2>
                  </div>

                  <div className="space-y-3">
                    {category.faqs.map((faq, index) => {
                      const isOpen = expandedFaq === `${category.id}-${index}`;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={false}
                          className="rounded-xl bg-editor-card border border-editor-border overflow-hidden"
                        >
                          <button
                            onClick={() => setExpandedFaq(isOpen ? null : `${category.id}-${index}`)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                          >
                            <span className="text-sm font-medium text-white pr-4">{faq.question}</span>
                            {isOpen ? (
                              <ChevronDown className="w-5 h-5 text-surface-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-surface-400 flex-shrink-0" />
                            )}
                          </button>
                          
                          <motion.div
                            initial={false}
                            animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 text-sm text-surface-300 whitespace-pre-line">
                              {faq.answer}
                            </div>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-surface-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
                <p className="text-surface-400">Try a different search term or browse categories</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

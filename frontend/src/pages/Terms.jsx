// frontend/src/pages/Terms.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing and using AI Media Editor ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.

These terms may be modified at any time by AI Media Editor without prior notice. Your continued use of the service after any modification constitutes acceptance of the new terms.`
  },
  {
    id: 'services',
    title: '2. Description of Service',
    content: `AI Media Editor provides AI-powered media editing tools including but not limited to:
    
• Image editing and enhancement
• Video editing and processing
• Audio editing and manipulation
• AI-powered features including background removal, image generation, and upscaling
• Cloud storage for projects
• Template library access

The service may be modified, updated, or discontinued at any time without notice.`
  },
  {
    id: 'accounts',
    title: '3. User Accounts',
    content: `To access certain features of the service, you must create an account. You are responsible for:

• Maintaining the security of your account credentials
• All activities that occur under your account
• Notifying us immediately of any unauthorized access

You must be at least 13 years old to use this service. Users under 18 require parental consent.

We reserve the right to suspend or terminate accounts that violate these terms.`
  },
  {
    id: 'subscription',
    title: '4. Subscription and Billing',
    content: `The service offers both free and paid subscription tiers:

**Free Plan:**
• Limited AI credits per month
• Basic editing features
• 500MB storage
• Watermarked exports

**Paid Plans (Starter, Pro, Enterprise):**
• Increased AI credits
• Advanced features
• More storage
• Priority support

Subscriptions automatically renew unless cancelled. Refunds are available within 30 days of purchase as per our refund policy.`
  },
  {
    id: 'acceptable',
    title: '5. Acceptable Use',
    content: `You agree NOT to:

• Use the service for illegal or unauthorized purposes
• Upload content that violates others' intellectual property rights
• Upload harmful, offensive, or inappropriate content
• Attempt to gain unauthorized access to the service
• Use the service to create deepfakes or misleading content
• Reverse engineer or attempt to access the AI models
• Share your account credentials
• Use automated systems to access the service without permission

Violations may result in account termination.`
  },
  {
    id: 'content',
    title: '6. User Content',
    content: `You retain ownership of content you upload to the service. However, you grant AI Media Editor a license to:

• Store and process your content for providing the service
• Create backups and enable access across devices
• Use anonymized data for service improvement

You are responsible for ensuring you have rights to all content you upload.

AI Media Editor may remove content that violates these terms.`
  },
  {
    id: 'ai',
    title: '7. AI-Generated Content',
    content: `When using AI-powered features:

• AI-generated content may have limitations and inaccuracies
• You are responsible for reviewing AI-generated outputs
• Certain uses of AI-generated content may have legal restrictions
• AI credits are consumed based on operation type

AI Media Editor does not guarantee the accuracy, quality, or fitness for purpose of AI-generated content.`
  },
  {
    id: 'privacy',
    title: '8. Privacy',
    content: `Your privacy is important to us. Our data collection and use practices are governed by our Privacy Policy, which is incorporated into these terms by reference.

Key points:
• We collect data necessary to provide the service
• Your content is processed according to our privacy practices
• We implement security measures to protect your data
• See our Privacy Policy for complete details`
  },
  {
    id: 'disclaimer',
    title: '9. Disclaimer of Warranties',
    content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:

• MERCHANTABILITY
• FITNESS FOR A PARTICULAR PURPOSE
• NON-INFRINGEMENT
• ACCURACY OF AI-GENERATED CONTENT

WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.`
  },
  {
    id: 'liability',
    title: '10. Limitation of Liability',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, AI MEDIA EDITOR SHALL NOT BE LIABLE FOR:

• INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES
• LOSS OF PROFITS, DATA, OR BUSINESS INTERRUPTION
• PERSONAL INJURY OR PROPERTY DAMAGE

OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID IN THE LAST 12 MONTHS.`
  },
  {
    id: 'indemnification',
    title: '11. Indemnification',
    content: `You agree to indemnify and hold harmless AI Media Editor, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from:

• Your use of the service
• Your violation of these terms
• Your infringement of third-party rights
• Content you upload or create`
  },
  {
    id: 'termination',
    title: '12. Termination',
    content: `Either party may terminate this agreement:

• You may cancel your account at any time through settings
• We may suspend or terminate accounts for violations
• Upon termination, your right to use the service ends
• Paid subscriptions may be eligible for prorated refunds

Sections on ownership, disclaimers, liability, and dispute resolution survive termination.`
  },
  {
    id: 'disputes',
    title: '13. Dispute Resolution',
    content: `Any disputes shall be resolved through:

1. **Informal Resolution:** Contact us first at support@aimediaeditor.com
2. **Mediation:** If informal resolution fails, mediation may be pursued
3. **Arbitration:** Binding arbitration for unresolved disputes
4. **Governing Law:** Laws of the jurisdiction where AI Media Editor operates

Class action waivers apply to the extent permitted by law.`
  },
  {
    id: 'changes',
    title: '14. Changes to Terms',
    content: `We may modify these terms at any time:

• Changes take effect upon posting to the service
• Continued use constitutes acceptance of changes
• Material changes may be communicated via email or in-app notice
• Check these terms periodically for updates`
  },
  {
    id: 'contact',
    title: '15. Contact Information',
    content: `For questions about these Terms of Service:

**Email:** legal@aimediaeditor.com
**Address:** [Company Address]
**Support:** support@aimediaeditor.com

We respond to inquiries within 5 business days.`
  }
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-editor-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-b border-editor-border">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
              <p className="text-surface-400">Last updated: March 1, 2024</p>
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm text-surface-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Terms of Service</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Quick Navigation */}
        <div className="mb-8 p-4 rounded-xl bg-editor-card border border-editor-border">
          <h2 className="text-sm font-semibold text-white mb-3">Quick Navigation</h2>
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-3 py-1.5 rounded-lg bg-surface-800 text-sm text-surface-300 hover:text-white hover:bg-surface-700 transition-colors"
              >
                {section.title.split('. ')[1]?.split(' ')[0] || section.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="scroll-mt-24"
            >
              <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
              <div className="prose prose-invert max-w-none">
                {section.content.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-surface-300 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Acceptance */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">By Using AI Media Editor</h3>
              <p className="text-surface-300">
                You acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                If you do not agree, please discontinue use of the service immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Top */}
        <div className="mt-12 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            Back to top
            <ChevronRight className="w-4 h-4 rotate-270" />
          </a>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-editor-border">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Have Questions?</h2>
            <p className="text-surface-400 mb-6">
              Contact our legal team at{' '}
              <a href="mailto:legal@aimediaeditor.com" className="text-primary-400 hover:text-primary-300">
                legal@aimediaeditor.com
              </a>
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/privacy">
                <Button variant="secondary">Privacy Policy</Button>
              </Link>
              <Link to="/help">
                <Button variant="primary">Help Center</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

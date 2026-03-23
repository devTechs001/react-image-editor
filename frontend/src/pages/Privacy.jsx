// frontend/src/pages/Privacy.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, Lock, Eye, Database, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    icon: Shield,
    content: `AI Media Editor ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered media editing service.

Please read this privacy policy carefully. By using our service, you consent to the data practices described in this policy.

**Last Updated:** March 1, 2024`
  },
  {
    id: 'collection',
    title: '2. Information We Collect',
    icon: Database,
    content: `**Information You Provide:**

• **Account Information:** Name, email address, password, profile picture
• **Payment Information:** Credit card details, billing address (processed securely by third-party processors)
• **User Content:** Images, videos, audio files, projects, and edits you create
• **Communications:** Support requests, feedback, survey responses

**Information Collected Automatically:**

• **Usage Data:** Features used, time spent, projects created, exports performed
• **Device Information:** IP address, browser type, operating system, device identifiers
• **Log Data:** Pages visited, actions taken, timestamps, referring URLs
• **Cookies:** Session cookies, preference cookies, analytics cookies`
  },
  {
    id: 'usage',
    title: '3. How We Use Your Information',
    icon: Eye,
    content: `We use the information we collect to:

• **Provide Services:** Process your media, store projects, enable editing features
• **Personalize Experience:** Remember preferences, suggest templates, customize interface
• **Improve Services:** Analyze usage patterns, test new features, train AI models (anonymized data)
• **Communicate:** Send service updates, respond to inquiries, marketing (with consent)
• **Security:** Detect fraud, prevent abuse, protect user safety
• **Legal Compliance:** Meet regulatory requirements, enforce terms`
  },
  {
    id: 'sharing',
    title: '4. Information Sharing',
    icon: Shield,
    content: `**We DO NOT sell your personal information.**

We may share information with:

• **Service Providers:** Cloud hosting, payment processing, email delivery, analytics
• **AI Processing Partners:** Secure processing of media for AI features (data is encrypted and deleted after processing)
• **Legal Requirements:** When required by law, subpoena, or to protect rights
• **Business Transfers:** In connection with merger, acquisition, or sale of assets
• **With Consent:** When you explicitly agree to sharing

All third parties are contractually obligated to protect your information.`
  },
  {
    id: 'content',
    title: '5. User Content',
    icon: Lock,
    content: `**Your Ownership:** You retain all rights to content you upload and create.

**Our License:** You grant us limited license to:
• Store and process content for service delivery
• Enable access across your devices
• Create backups and enable version history
• Use anonymized examples for marketing (opt-out available)

**Content Removal:** You can delete content at any time. Deleted content is removed from active systems within 30 days.

**Public Content:** Content you share publicly may be viewed and used by others. Be cautious about what you share.`
  },
  {
    id: 'ai',
    title: '6. AI Processing',
    icon: Database,
    content: `**How AI Works:**

• Images are processed through AI models for features like background removal, enhancement, and generation
• Processing may occur on our servers or trusted third-party services
• Content is encrypted in transit and at rest
• Temporary copies are deleted after processing (typically within 24 hours)

**AI Training:**

• We may use anonymized, aggregated data to improve AI models
• Personal identifiers are removed before any training use
• You can opt out of AI training data usage in settings
• Sensitive content is excluded from training datasets`
  },
  {
    id: 'cookies',
    title: '7. Cookies and Tracking',
    icon: Eye,
    content: `**Types of Cookies We Use:**

• **Essential:** Required for service functionality
• **Preferences:** Remember your settings and choices
• **Analytics:** Understand how you use our service (Google Analytics, Mixpanel)
• **Marketing:** Track campaign effectiveness (with consent)

**Your Choices:**
• Browser settings can block cookies
• Some features may not work without essential cookies
• Consent for non-essential cookies can be withdrawn anytime
• See our Cookie Policy for detailed information`
  },
  {
    id: 'security',
    title: '8. Data Security',
    icon: Lock,
    content: `**Security Measures:**

• **Encryption:** TLS/SSL for data in transit, AES-256 for data at rest
• **Access Controls:** Role-based access, multi-factor authentication for staff
• **Infrastructure:** Secure cloud providers (AWS, Google Cloud)
• **Monitoring:** 24/7 security monitoring, intrusion detection
• **Regular Audits:** Security assessments and penetration testing

**Important Notes:**
• No method of transmission is 100% secure
• You are responsible for protecting your account credentials
• Report security concerns to security@aimediaeditor.com`
  },
  {
    id: 'rights',
    title: '9. Your Privacy Rights',
    icon: CheckCircle,
    content: `**Depending on your location, you may have:**

• **Access:** Request copy of personal information we hold
• **Correction:** Update inaccurate or incomplete information
• **Deletion:** Request deletion of personal information
• **Portability:** Receive data in machine-readable format
• **Opt-Out:** Unsubscribe from marketing communications
• **Restriction:** Limit how we process your data
• **Object:** Object to certain processing activities

**To Exercise Rights:**
Contact privacy@aimediaeditor.com. We respond within 30 days.`
  },
  {
    id: 'children',
    title: '10. Children\'s Privacy',
    icon: Shield,
    content: `**Age Restrictions:**

• Service is not intended for children under 13
• Users 13-17 require parental consent
• We do not knowingly collect data from children under 13

**If We Learn:**
If we discover we have collected data from a child under 13 without consent, we will delete it immediately.

**Parental Rights:**
Parents can request review and deletion of their child's information by contacting us.`
  },
  {
    id: 'international',
    title: '11. International Transfers',
    icon: Database,
    content: `**Global Operations:**

Your information may be transferred to and processed in countries other than your own.

**Safeguards:**
• Standard Contractual Clauses (SCCs) for EU transfers
• Privacy Shield Framework compliance (where applicable)
• Adequacy decisions by relevant authorities
• Same level of protection regardless of location`
  },
  {
    id: 'retention',
    title: '12. Data Retention',
    icon: Database,
    content: `**Retention Periods:**

• **Active Accounts:** Data retained while account is active
• **Deleted Accounts:** Personal data deleted within 90 days
• **Usage Logs:** Anonymized after 12 months
• **Payment Records:** 7 years for legal compliance
• **Backups:** Deleted within 30 days of account deletion

**Factors Considered:**
• Amount, nature, and sensitivity of data
• Purpose of processing
• Legal requirements
• Risk of harm from unauthorized use`
  },
  {
    id: 'changes',
    title: '13. Policy Changes',
    icon: Shield,
    content: `**Updates:**

We may update this Privacy Policy periodically.

**Notification:**
• Material changes communicated via email or in-app notice
• Updated policy posted on website with new date
• Continued use constitutes acceptance of changes

**Your Rights:**
If you object to changes, you may close your account before changes take effect.`
  },
  {
    id: 'contact',
    title: '14. Contact Us',
    icon: Shield,
    content: `**Privacy Inquiries:**

**Email:** privacy@aimediaeditor.com
**Data Protection Officer:** dpo@aimediaeditor.com
**Address:** [Company Address]

**Response Time:** We respond within 30 days.

**Supervisory Authority:**
EU residents can lodge complaints with their local data protection authority.`
  }
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-editor-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-b border-editor-border">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
              <p className="text-surface-400">Your privacy is our priority</p>
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm text-surface-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Privacy Policy</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-editor-card border border-editor-border">
            <Lock className="w-6 h-6 text-primary-400 mb-2" />
            <h3 className="font-semibold text-white mb-1">Data Encryption</h3>
            <p className="text-sm text-surface-400">Your data is encrypted in transit and at rest</p>
          </div>
          <div className="p-4 rounded-xl bg-editor-card border border-editor-border">
            <Eye className="w-6 h-6 text-primary-400 mb-2" />
            <h3 className="font-semibold text-white mb-1">Transparent</h3>
            <p className="text-sm text-surface-400">Clear about what data we collect and why</p>
          </div>
          <div className="p-4 rounded-xl bg-editor-card border border-editor-border">
            <CheckCircle className="w-6 h-6 text-primary-400 mb-2" />
            <h3 className="font-semibold text-white mb-1">Your Control</h3>
            <p className="text-sm text-surface-400">You control your data and can delete anytime</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="scroll-mt-24"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{section.title}</h2>
                </div>
                <div className="prose prose-invert max-w-none pl-13">
                  {section.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-surface-300 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Quick Settings */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Manage Your Privacy</h3>
              <p className="text-surface-300 mb-4">
                You can control your privacy settings at any time from your account dashboard.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/settings">
                  <Button variant="primary">Privacy Settings</Button>
                </Link>
                <Link to="/profile">
                  <Button variant="secondary">Account Settings</Button>
                </Link>
              </div>
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
            <h2 className="text-xl font-bold text-white mb-2">Questions About Privacy?</h2>
            <p className="text-surface-400 mb-6">
              Contact our privacy team at{' '}
              <a href="mailto:privacy@aimediaeditor.com" className="text-primary-400 hover:text-primary-300">
                privacy@aimediaeditor.com
              </a>
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/terms">
                <Button variant="secondary">Terms of Service</Button>
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

// frontend/src/pages/Pricing.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  Zap,
  Crown,
  Building2,
  Sparkles,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Switch from '@/components/ui/Switch';
import { cn } from '@/utils/helpers/cn';

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: { monthly: 0, yearly: 0 },
    icon: Sparkles,
    color: 'from-slate-500 to-slate-600',
    features: [
      { text: '50 AI Credits/month', included: true },
      { text: '500MB Storage', included: true },
      { text: '10 Exports/month', included: true },
      { text: 'Basic filters & effects', included: true },
      { text: 'Watermark on exports', included: true },
      { text: 'Community support', included: true },
      { text: 'HD Export (1080p)', included: false },
      { text: 'Priority processing', included: false },
      { text: 'Custom branding', included: false },
      { text: 'API access', included: false }
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For hobbyists and creators',
    price: { monthly: 9, yearly: 7 },
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    features: [
      { text: '200 AI Credits/month', included: true },
      { text: '5GB Storage', included: true },
      { text: '50 Exports/month', included: true },
      { text: 'All filters & effects', included: true },
      { text: 'No watermark', included: true },
      { text: 'Email support', included: true },
      { text: 'HD Export (1080p)', included: true },
      { text: 'Priority processing', included: false },
      { text: 'Custom branding', included: false },
      { text: 'API access', included: false }
    ],
    cta: 'Start Free Trial',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals and teams',
    price: { monthly: 19, yearly: 15 },
    icon: Crown,
    color: 'from-primary-500 to-secondary-500',
    features: [
      { text: '1,000 AI Credits/month', included: true },
      { text: '50GB Storage', included: true },
      { text: 'Unlimited Exports', included: true },
      { text: 'All filters & effects', included: true },
      { text: 'No watermark', included: true },
      { text: 'Priority support', included: true },
      { text: '4K Export', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Custom branding', included: false },
      { text: 'API access', included: true }
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: { monthly: 49, yearly: 39 },
    icon: Building2,
    color: 'from-amber-500 to-orange-500',
    features: [
      { text: 'Unlimited AI Credits', included: true },
      { text: '500GB Storage', included: true },
      { text: 'Unlimited Exports', included: true },
      { text: 'All filters & effects', included: true },
      { text: 'No watermark', included: true },
      { text: 'Dedicated support', included: true },
      { text: '8K Export', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Full API access', included: true }
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

const faqs = [
  {
    question: 'What are AI Credits?',
    answer: 'AI Credits are used for AI-powered features like background removal, image enhancement, upscaling, and image generation. Different operations use different amounts of credits.'
  },
  {
    question: 'Can I change my plan anytime?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated amount. When downgrading, the change takes effect at the end of your billing cycle.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes, all paid plans come with a 14-day free trial. No credit card required to start. You can cancel anytime during the trial period.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise plans.'
  },
  {
    question: 'Do unused credits roll over?',
    answer: 'Credits reset at the beginning of each billing cycle and do not roll over. We recommend choosing a plan that matches your typical monthly usage.'
  },
  {
    question: 'Can I get a refund?',
    answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact support for a full refund.'
  }
];

export default function Pricing() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleSelectPlan = (planId) => {
    if (planId === 'free') {
      navigate('/register');
    } else if (planId === 'enterprise') {
      window.location.href = 'mailto:sales@aimediaeditor.com';
    } else {
      navigate(`/register?plan=${planId}&billing=${isYearly ? 'yearly' : 'monthly'}`);
    }
  };

  return (
    <div className="min-h-screen py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          Simple, Transparent Pricing
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-surface-400 max-w-2xl mx-auto mb-8"
        >
          Choose the perfect plan for your needs. All plans include a 14-day free trial.
        </motion.p>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-4 p-2 rounded-2xl bg-editor-card border border-editor-border"
        >
          <span className={cn(
            'text-sm font-medium transition-colors',
            !isYearly ? 'text-white' : 'text-surface-500'
          )}>
            Monthly
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <span className={cn(
            'text-sm font-medium transition-colors',
            isYearly ? 'text-white' : 'text-surface-500'
          )}>
            Yearly
            <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
              Save 20%
            </span>
          </span>
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const price = isYearly ? plan.price.yearly : plan.price.monthly;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={cn(
                'relative rounded-2xl overflow-hidden',
                plan.popular ? 'ring-2 ring-primary-500' : ''
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 py-1.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-center text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className={cn(
                'h-full flex flex-col p-6 bg-editor-card border border-editor-border',
                plan.popular && 'pt-10'
              )}>
                {/* Plan Header */}
                <div className="mb-6">
                  <div className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4',
                    plan.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-surface-400 mt-1">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">${price}</span>
                    <span className="text-surface-400">/month</span>
                  </div>
                  {isYearly && price > 0 && (
                    <p className="text-sm text-surface-500 mt-1">
                      Billed ${price * 12}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-surface-600 flex-shrink-0" />
                      )}
                      <span className={cn(
                        'text-sm',
                        feature.included ? 'text-surface-300' : 'text-surface-600'
                      )}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  fullWidth
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Compare All Features
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-editor-border">
                <th className="text-left py-4 px-4 text-surface-400 font-medium">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="text-center py-4 px-4 text-white font-semibold">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'AI Credits', values: ['50/mo', '200/mo', '1,000/mo', 'Unlimited'] },
                { feature: 'Storage', values: ['500MB', '5GB', '50GB', '500GB'] },
                { feature: 'Exports', values: ['10/mo', '50/mo', 'Unlimited', 'Unlimited'] },
                { feature: 'Max Export Resolution', values: ['720p', '1080p', '4K', '8K'] },
                { feature: 'Background Removal', values: [true, true, true, true] },
                { feature: 'AI Enhancement', values: [true, true, true, true] },
                { feature: 'AI Upscaling', values: ['2x', '4x', '4x', '8x'] },
                { feature: 'Image Generation', values: [false, true, true, true] },
                { feature: 'Video Editing', values: [false, true, true, true] },
                { feature: 'Team Collaboration', values: [false, false, true, true] },
                { feature: 'API Access', values: [false, false, true, true] },
                { feature: 'Custom Branding', values: [false, false, false, true] },
                { feature: 'Dedicated Support', values: [false, false, false, true] }
              ].map((row, i) => (
                <tr key={i} className="border-b border-editor-border">
                  <td className="py-4 px-4 text-surface-300">{row.feature}</td>
                  {row.values.map((value, j) => (
                    <td key={j} className="text-center py-4 px-4">
                      {typeof value === 'boolean' ? (
                        value ? (
                          <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-surface-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-surface-300">{value}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="rounded-xl bg-editor-card border border-editor-border overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-white">{faq.question}</span>
                <motion.div
                  animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HelpCircle className="w-5 h-5 text-surface-400" />
                </motion.div>
              </button>
              
              <motion.div
                initial={false}
                animate={{
                  height: expandedFaq === index ? 'auto' : 0,
                  opacity: expandedFaq === index ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="px-4 pb-4 text-surface-400">
                  {faq.answer}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-20 text-center">
        <div className="inline-block p-8 rounded-3xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/30">
          <h3 className="text-2xl font-bold text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-surface-400 mb-6">
            Our team is here to help you find the right plan.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="secondary">
              Contact Sales
            </Button>
            <Button variant="primary">
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
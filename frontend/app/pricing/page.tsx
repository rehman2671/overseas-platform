'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  Crown,
  Loader2,
  Building2,
  User
} from 'lucide-react';
import { subscriptionApi } from '@/lib/api';
import toast from 'react-hot-toast';

const jobSeekerPlans = [
  {
    name: 'Free',
    slug: 'free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for getting started',
    icon: User,
    features: [
      { text: '2 basic templates', included: true },
      { text: '5 job applications/month', included: true },
      { text: 'Basic ATS score', included: true },
      { text: 'Email support', included: true },
      { text: 'All templates', included: false },
      { text: 'AI optimization', included: false },
      { text: 'Unlimited applications', included: false },
      { text: 'Cover letter generator', included: false },
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    slug: 'pro',
    price: '₹299',
    period: 'per month',
    description: 'Best for active job seekers',
    icon: Zap,
    features: [
      { text: 'All templates', included: true },
      { text: 'Unlimited applications', included: true },
      { text: 'Advanced ATS score', included: true },
      { text: 'JD Match scoring', included: true },
      { text: 'Skill gap analysis', included: true },
      { text: 'Priority support', included: true },
      { text: 'AI optimization (5/month)', included: true },
      { text: 'Cover letter generator', included: false },
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
  {
    name: 'Premium',
    slug: 'premium',
    price: '₹699',
    period: 'per month',
    description: 'For serious professionals',
    icon: Crown,
    features: [
      { text: 'All Pro features', included: true },
      { text: 'Unlimited AI optimization', included: true },
      { text: 'Cover letter generator', included: true },
      { text: 'LinkedIn optimization', included: true },
      { text: 'Interview prep AI', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Resume rewrite service', included: true },
      { text: 'Priority job matching', included: true },
    ],
    cta: 'Go Premium',
    highlighted: false,
  },
];

const recruiterPlans = [
  {
    name: 'Basic',
    slug: 'recruiter-basic',
    price: '₹0',
    period: 'forever',
    description: 'Start posting jobs',
    icon: Building2,
    features: [
      { text: '1 free job post', included: true },
      { text: 'Basic applicant tracking', included: true },
      { text: 'Email notifications', included: true },
      { text: 'Resume search', included: false },
      { text: 'Featured listings', included: false },
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Standard',
    slug: 'recruiter-standard',
    price: '₹1,999',
    period: 'per month',
    description: 'For growing teams',
    icon: Zap,
    features: [
      { text: '10 job posts', included: true },
      { text: 'Featured listings (2)', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Resume search (50/month)', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Upgrade Now',
    highlighted: true,
  },
  {
    name: 'Premium',
    slug: 'recruiter-premium',
    price: '₹4,999',
    period: 'per month',
    description: 'For enterprises',
    icon: Crown,
    features: [
      { text: 'Unlimited job posts', included: true },
      { text: 'Unlimited featured listings', included: true },
      { text: 'AI shortlist', included: true },
      { text: 'Full resume database access', included: true },
      { text: 'Dedicated account manager', included: true },
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobseeker' | 'recruiter'>('jobseeker');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const plans = activeTab === 'jobseeker' ? jobSeekerPlans : recruiterPlans;

  const handleSubscribe = async (planSlug: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe');
      return;
    }

    setIsLoading(planSlug);
    try {
      // This would integrate with payment gateway
      toast.success('Redirecting to payment...');
    } catch (error) {
      toast.error('Failed to process subscription');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200 inline-flex">
            <button
              onClick={() => setActiveTab('jobseeker')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'jobseeker'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              Job Seeker
            </button>
            <button
              onClick={() => setActiveTab('recruiter')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'recruiter'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="h-4 w-4 inline mr-2" />
              Recruiter
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`card p-8 relative ${
                plan.highlighted
                  ? 'border-2 border-primary-500 shadow-xl scale-105'
                  : 'hover:shadow-lg transition-shadow'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                  plan.highlighted ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  <plan.icon className={`h-7 w-7 ${plan.highlighted ? 'text-primary-600' : 'text-gray-600'}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="flex items-baseline justify-center mt-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.slug)}
                disabled={isLoading === plan.slug || user?.plan_type === plan.slug}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.highlighted
                    ? 'btn-primary'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${user?.plan_type === plan.slug ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading === plan.slug ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : user?.plan_type === plan.slug ? (
                  'Current Plan'
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, debit cards, and UPI payments through our secure payment gateway.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, our Free plan gives you access to basic features forever. You can upgrade anytime to unlock premium features.',
              },
              {
                q: 'Can I switch between plans?',
                a: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes will take effect on your next billing cycle.',
              },
            ].map((faq, index) => (
              <div key={index} className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

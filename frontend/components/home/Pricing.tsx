'use client';

import Link from 'next/link';
import { Check, X } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      { text: '2 basic templates', included: true },
      { text: '5 job applications/month', included: true },
      { text: 'Basic ATS score', included: true },
      { text: 'Email support', included: true },
      { text: 'All templates', included: false },
      { text: 'AI optimization', included: false },
      { text: 'Unlimited applications', included: false },
    ],
    cta: 'Get Started',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₹299',
    period: 'per month',
    description: 'Best for active job seekers',
    features: [
      { text: 'All templates', included: true },
      { text: 'Unlimited applications', included: true },
      { text: 'Advanced ATS score', included: true },
      { text: 'JD Match scoring', included: true },
      { text: 'Skill gap analysis', included: true },
      { text: 'Priority support', included: true },
      { text: 'AI optimization (5/month)', included: true },
    ],
    cta: 'Upgrade to Pro',
    href: '/pricing?plan=pro',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '₹699',
    period: 'per month',
    description: 'For serious professionals',
    features: [
      { text: 'All Pro features', included: true },
      { text: 'Unlimited AI optimization', included: true },
      { text: 'Cover letter generator', included: true },
      { text: 'LinkedIn optimization', included: true },
      { text: 'Interview prep AI', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Resume rewrite service', included: true },
    ],
    cta: 'Go Premium',
    href: '/pricing?plan=premium',
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card p-8 ${
                plan.highlighted
                  ? 'border-2 border-primary-500 shadow-xl scale-105'
                  : 'hover:shadow-lg transition-shadow'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-success-500 mr-3 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${
                  plan.highlighted
                    ? 'btn-primary'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

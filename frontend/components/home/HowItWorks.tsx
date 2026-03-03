'use client';

import { UserPlus, FileEdit, Search, Send } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Sign up and create your profile. Tell us about your skills, experience, and career goals.',
  },
  {
    number: '02',
    icon: FileEdit,
    title: 'Build Your Resume',
    description: 'Use our AI-powered resume builder to create a professional, ATS-optimized resume.',
  },
  {
    number: '03',
    icon: Search,
    title: 'Get Matched',
    description: 'Our AI matches you with relevant jobs based on your profile and preferences.',
  },
  {
    number: '04',
    icon: Send,
    title: 'Apply & Succeed',
    description: 'Apply with your optimized resume and track your applications in real-time.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in minutes and let our AI do the heavy lifting.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="card p-6 text-center h-full">
                <div className="text-5xl font-bold text-primary-200 mb-4">{step.number}</div>
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

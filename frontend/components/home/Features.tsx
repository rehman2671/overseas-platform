'use client';

import { 
  FileText, 
  Brain, 
  Briefcase, 
  TrendingUp, 
  Shield, 
  Zap,
  CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Professional Templates',
    description: 'Choose from 9+ professionally designed templates optimized for ATS systems.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Brain,
    title: 'AI Optimization',
    description: 'Our AI analyzes job descriptions and optimizes your resume for better matches.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Briefcase,
    title: 'Job Matching',
    description: 'Get personalized job recommendations based on your skills and experience.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: TrendingUp,
    title: 'ATS Score',
    description: 'Get instant ATS compatibility score and improvement suggestions.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and secure. We never share your information.',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: Zap,
    title: 'Fast & Easy',
    description: 'Build your resume in minutes with our intuitive drag-and-drop builder.',
    color: 'bg-yellow-100 text-yellow-600',
  },
];

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Land Your Dream Job
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform combines AI technology with industry expertise to help you stand out.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

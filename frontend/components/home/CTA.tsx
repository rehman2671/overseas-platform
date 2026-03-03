'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 bg-primary-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Start Your Overseas Career?
        </h2>
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Join 50,000+ professionals who have built their resumes and found jobs abroad with our AI-powered platform.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Build Your Resume Free
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center px-8 py-4 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors border border-primary-500"
          >
            Browse Jobs
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>

        <p className="text-primary-200 text-sm mt-6">
          No credit card required. Free plan available forever.
        </p>
      </div>
    </section>
  );
}

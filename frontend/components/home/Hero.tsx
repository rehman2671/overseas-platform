'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Target, Globe } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 py-20 lg:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Resume Builder & Job Matching
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Create Smart Resume.
            <br />
            <span className="text-primary-600">Get Overseas Job Faster.</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Build ATS-optimized resumes, get AI-powered job matches, and land your dream job abroad. 
            All in one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/register" className="btn-primary text-lg px-8 py-4">
              Build Your Resume
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/jobs" className="btn-secondary text-lg px-8 py-4">
              Browse Jobs
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">50K+</div>
              <div className="text-sm text-gray-500">Resumes Built</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-500">Jobs Posted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">85%</div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="card p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-7 w-7 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Resume Builder</h3>
            <p className="text-gray-600">Create professional resumes with AI-powered suggestions and ATS optimization.</p>
          </div>

          <div className="card p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target className="h-7 w-7 text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Job Matching</h3>
            <p className="text-gray-600">Get matched with jobs based on your skills and experience using semantic AI.</p>
          </div>

          <div className="card p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Globe className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Overseas Focus</h3>
            <p className="text-gray-600">Specialized in international jobs with visa sponsorship opportunities.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

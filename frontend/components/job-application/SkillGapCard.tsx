'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, BookOpen, Target, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

interface SkillGap {
  skill_required: string;
  your_skill: string | null;
  similarity: number;
  recommendation: string;
}

interface SkillGapCardProps {
  resumeId: number;
  jobId: number;
  onClose?: () => void;
}

export default function SkillGapCard({ resumeId, jobId, onClose }: SkillGapCardProps) {
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSkillGaps();
  }, [resumeId, jobId]);

  const fetchSkillGaps = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post('/ai/skill-gap', {
        resume_id: resumeId,
        job_id: jobId,
      });

      if (response.data?.success) {
        setSkillGaps(response.data.data.skill_gaps || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to detect skill gaps');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Skill Gap Analysis</h3>
            <p className="text-sm text-gray-600">Analyzing your resume...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Skill Gap Analysis</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (skillGaps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Skill Gap Analysis</h3>
            <p className="text-sm text-gray-600">Great! Your resume matches all required skills.</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            Your skills align well with this job. Consider applying now!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Skill Gap Analysis</h3>
          <p className="text-sm text-gray-600">
            {skillGaps.length} skill{skillGaps.length !== 1 ? 's' : ''} to improve your match
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {skillGaps.map((gap, index) => (
          <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-orange-700">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {gap.skill_required}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {gap.recommendation}
                </p>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <button className="text-sm text-blue-600 hover:text-blue-700 underline">
                    Learn this skill
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Improve Your Match</h4>
            <p className="text-sm text-blue-800">
              Adding these skills to your resume could increase your match score by 15-25%.
              Consider updating your resume or taking relevant courses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

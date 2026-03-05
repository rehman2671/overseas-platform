'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  FileText,
  Target,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  Download,
} from 'lucide-react';
import { api } from '@/lib/api';
import SkillGapCard from '@/components/job-application/SkillGapCard';

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  salary_min: number;
  salary_max: number;
  employment_type: string;
  work_mode: string;
}

interface Resume {
  id: number;
  title: string;
  created_at: string;
  is_default: boolean;
}

interface MatchResult {
  score: number;
  skill_gaps: any[];
  missing_skills_count: number;
}

export default function JobApplicationPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (slug) {
      fetchJobAndResumes();
    }
  }, [authLoading, isAuthenticated, slug]);

  const fetchJobAndResumes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch job details
      const jobResponse = await api.get(`/jobs/${slug}`);
      if (jobResponse.data?.success) {
        setJob(jobResponse.data.data);
      }

      // Fetch user's resumes
      const resumesResponse = await api.get('/resumes');
      if (resumesResponse.data?.success) {
        const userResumes = resumesResponse.data.data.data || [];
        setResumes(userResumes);

        // Auto-select default resume if available
        const defaultResume = userResumes.find((r: Resume) => r.is_default);
        if (defaultResume) {
          setSelectedResumeId(defaultResume.id);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMatch = async () => {
    if (!selectedResumeId || !job) return;

    try {
      const response = await api.post('/ai/skill-gap', {
        resume_id: selectedResumeId,
        job_id: job.id,
      });

      if (response.data?.success) {
        setMatchResult({
          score: 85, // This would come from the AI service
          skill_gaps: response.data.data.skill_gaps || [],
          missing_skills_count: response.data.data.missing_skills_count || 0,
        });
      }
    } catch (err) {
      console.error('Failed to calculate match:', err);
    }
  };

  useEffect(() => {
    if (selectedResumeId && job) {
      calculateMatch();
    }
  }, [selectedResumeId, job]);

  const handleSubmit = async () => {
    if (!selectedResumeId || !job) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await api.post('/applications', {
        job_id: job.id,
        resume_id: selectedResumeId,
        cover_letter: coverLetter.trim() || null,
      });

      if (response.data?.success) {
        router.push('/dashboard?applied=true');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Job not found</p>
      </div>
    );
  }

  const canApply = selectedResumeId && !isSubmitting;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Apply for Job</h1>
              <p className="text-sm text-gray-600">{job.title} at {job.company}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Application Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resume Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Resume</h2>

              {resumes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes found</h3>
                  <p className="text-gray-600 mb-4">Create a resume before applying for jobs</p>
                  <Link
                    href="/resumes/new"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Resume
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {resumes.map((resume) => (
                    <label
                      key={resume.id}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedResumeId === resume.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="resume"
                        value={resume.id}
                        checked={selectedResumeId === resume.id}
                        onChange={() => setSelectedResumeId(resume.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{resume.title}</span>
                          {resume.is_default && (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(resume.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter (Optional)</h2>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're interested in this position and what makes you a great fit..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                maxLength={2000}
              />
              <p className="text-sm text-gray-600 mt-2">
                {coverLetter.length}/2000 characters
              </p>
            </div>

            {/* Application Preview */}
            {selectedResumeId && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Preview</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {resumes.find(r => r.id === selectedResumeId)?.title}
                      </p>
                      <p className="text-sm text-gray-600">Your selected resume</p>
                    </div>
                  </div>

                  {coverLetter && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Cover Letter Preview</h4>
                      <p className="text-sm text-gray-700 line-clamp-3">{coverLetter}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Match Analysis */}
          <div className="space-y-6">
            {/* Match Score */}
            {matchResult && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Match Analysis</h2>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {matchResult.score}%
                  </div>
                  <p className="text-sm text-gray-600">Match Score</p>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{ width: `${matchResult.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Skill Gap Analysis */}
            {selectedResumeId && job && (
              <SkillGapCard
                resumeId={selectedResumeId}
                jobId={job.id}
              />
            )}

            {/* Submit Button */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button
                onClick={handleSubmit}
                disabled={!canApply}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  canApply
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {!selectedResumeId && (
                <p className="text-sm text-gray-600 mt-3 text-center">
                  Select a resume to submit your application
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

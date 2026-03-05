'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  DollarSign,
  Building,
  Briefcase,
  ArrowLeft,
  Send,
  Bookmark,
  BookmarkCheck,
  Share2,
  Target,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import SkillGapCard from '@/components/job-application/SkillGapCard';

interface Job {
  id: number;
  slug: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  responsibilities: string;
  country: string;
  city: string;
  job_type: string;
  work_mode: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  experience_required: number;
  skills_required: string[];
  benefits: string[];
  published_at: string;
  is_saved: boolean;
  match_score?: number;
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSkillGap, setShowSkillGap] = useState(false);
  const [userResumes, setUserResumes] = useState<any[]>([]);

  useEffect(() => {
    if (slug) {
      fetchJob();
      if (isAuthenticated) {
        fetchUserResumes();
      }
    }
  }, [slug, isAuthenticated]);

  const fetchJob = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/jobs/${slug}`);
      if (response.data?.success) {
        setJob(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserResumes = async () => {
    try {
      const response = await api.get('/resumes');
      if (response.data?.success) {
        setUserResumes(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    }
  };

  const handleSaveJob = async () => {
    if (!job) return;

    try {
      setIsSaving(true);
      const response = await api.post(`/jobs/${job.id}/save`);
      if (response.data?.success) {
        setJob({ ...job, is_saved: !job.is_saved });
      }
    } catch (error) {
      console.error('Failed to save job:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
    if (min) return `From ${currency}${min.toLocaleString()}`;
    return `Up to ${currency}${max.toLocaleString()}`;
  };

  const hasResumes = userResumes.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-lg text-gray-600">{job.company}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveJob}
                disabled={isSaving}
                className={`p-2 rounded-lg transition-colors ${
                  job.is_saved
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {job.is_saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
              <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{job.city}, {job.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Job Type</p>
                    <p className="font-medium text-gray-900 capitalize">{job.job_type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Work Mode</p>
                    <p className="font-medium text-gray-900 capitalize">{job.work_mode.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="font-medium text-gray-900">{job.experience_required}+ years</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Salary Range</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatSalary(job.salary_min, job.salary_max, job.salary_currency || '$')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {job.skills_required?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.responsibilities}</p>
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions & Skill Gap */}
          <div className="space-y-6">
            {/* Apply Button */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {isAuthenticated ? (
                hasResumes ? (
                  <Link
                    href={`/jobs/${job.slug}/apply`}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Send className="w-5 h-5" />
                    Apply Now
                  </Link>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Create a resume to apply for this job</p>
                    <Link
                      href="/resumes/new"
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      Create Resume
                    </Link>
                  </div>
                )
              ) : (
                <Link
                  href="/login"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Send className="w-5 h-5" />
                  Sign In to Apply
                </Link>
              )}

              <p className="text-sm text-gray-600 mt-3 text-center">
                Posted {new Date(job.published_at).toLocaleDateString()}
              </p>
            </div>

            {/* Skill Gap Analysis */}
            {isAuthenticated && hasResumes && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Skill Analysis
                  </h3>
                  <button
                    onClick={() => setShowSkillGap(!showSkillGap)}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    {showSkillGap ? 'Hide' : 'Show'} Gaps
                  </button>
                </div>

                {showSkillGap && (
                  <div className="mt-4">
                    <SkillGapCard
                      resumeId={userResumes[0]?.id} // Use first/default resume
                      jobId={job.id}
                    />
                  </div>
                )}

                {!showSkillGap && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Check if your skills match this job
                    </p>
                    <button
                      onClick={() => setShowSkillGap(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                    >
                      Analyze Skill Gaps →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

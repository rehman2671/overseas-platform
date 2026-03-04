'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Briefcase,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Job {
  id: number;
  slug: string;
  title: string;
  company: string;
  location: string;
  employment_type: string;
  salary_min: number;
  salary_max: number;
  published_at: string;
  application_count: number;
  shortlisted_count: number;
  pending_count: number;
  active: boolean;
}

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredStatus, setFilteredStatus] = useState<'all' | 'active' | 'closed'>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!authLoading && user?.role !== 'recruiter') {
      router.push('/dashboard');
      return;
    }

    fetchJobs();
  }, [authLoading, isAuthenticated, user]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/recruiter/jobs');
      if (response.data?.success) {
        setJobs(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filteredStatus === 'active') return job.active;
    if (filteredStatus === 'closed') return !job.active;
    return true;
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your job postings and review applications</p>
            </div>
            <Link
              href="/recruiter/jobs/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Post New Job
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilteredStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filteredStatus === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setFilteredStatus('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filteredStatus === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Active ({jobs.filter((j) => j.active).length})
          </button>
          <button
            onClick={() => setFilteredStatus('closed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filteredStatus === 'closed'
                ? 'bg-gray-100 text-gray-700'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Closed ({jobs.filter((j) => !j.active).length})
          </button>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">Start by posting your first job opening</p>
            <Link
              href="/recruiter/jobs/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Post a Job
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        {job.active ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            Closed
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {job.company} • {job.location}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Job Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{job.application_count}</p>
                      <p className="text-sm text-gray-600">Total Applications</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{job.pending_count}</p>
                      <p className="text-sm text-gray-600">Pending Review</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{job.shortlisted_count}</p>
                      <p className="text-sm text-gray-600">Shortlisted</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/recruiter/jobs/${job.id}/applications`}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Applications
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

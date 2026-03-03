'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, 
  Briefcase, 
  Send, 
  TrendingUp, 
  Star,
  Loader2,
  Plus,
  ArrowRight,
  Target
} from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardStats {
  resumes_count: number;
  applications_count: number;
  saved_jobs_count: number;
  pending_applications: number;
  shortlisted_applications: number;
  average_match_score: number;
}

interface RecentApplication {
  id: number;
  job: {
    title: string;
    company_name: string;
  };
  status: string;
  match_score: number;
  applied_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        api.get('/applications/stats/summary'),
        api.get('/applications?per_page=5'),
      ]);

      setStats(statsRes.data.data);
      setRecentApplications(appsRes.data.data.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your job search
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/resumes/new"
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Resume
              </Link>
              <Link
                href="/jobs"
                className="btn-secondary flex items-center"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">My Resumes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.resumes_count || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.applications_count || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Saved Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.saved_jobs_count || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Avg Match Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(stats?.average_match_score || 0)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                <Link href="/applications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {recentApplications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No applications yet</p>
                    <Link href="/jobs" className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
                      Browse jobs
                    </Link>
                  </div>
                ) : (
                  recentApplications.map((app) => (
                    <div key={app.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{app.job?.title}</p>
                        <p className="text-sm text-gray-500">{app.job?.company_name || 'Company'}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            Match: {Math.round(app.match_score || 0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="card">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                <Link
                  href="/resumes"
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary-600" />
                  <span className="ml-3 font-medium text-gray-900">Manage Resumes</span>
                  <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                </Link>

                <Link
                  href="/jobs/recommended"
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="ml-3 font-medium text-gray-900">Recommended Jobs</span>
                  <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-600">
                      {user?.name?.charAt(0)}
                    </span>
                  </div>
                  <span className="ml-3 font-medium text-gray-900">Edit Profile</span>
                  <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                </Link>
              </div>
            </div>

            {/* Upgrade Card */}
            {user?.plan_type === 'free' && (
              <div className="card mt-6 bg-gradient-to-r from-primary-500 to-primary-600">
                <div className="p-6 text-white">
                  <h3 className="font-semibold text-lg">Upgrade to Pro</h3>
                  <p className="text-primary-100 mt-2 text-sm">
                    Get unlimited applications, AI optimization, and more.
                  </p>
                  <Link
                    href="/pricing"
                    className="mt-4 inline-block px-4 py-2 bg-white text-primary-600 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

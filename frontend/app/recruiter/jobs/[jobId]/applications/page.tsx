'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Filter,
  Loader2,
  Users,
  Clock,
  CheckCircle,
  X,
  ChevronDown,
  Eye,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Application {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    location: string;
  };
  resume: {
    id: number;
    title: string;
  };
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired' | 'withdrawn';
  match_score: number;
  applied_at: string;
  notes?: string;
  cover_letter?: string;
}

export default function JobApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'shortlisted' | 'rejected' | 'hired'>('all');
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!authLoading && user?.role !== 'recruiter') {
      router.push('/dashboard');
      return;
    }

    if (jobId) {
      fetchApplications();
    }
  }, [authLoading, isAuthenticated, user, jobId]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/jobs/${jobId}/applications`);
      if (response.data?.success) {
        setApplications(response.data.data.data || response.data.data);
        setJobTitle(response.data.data.job_title || 'Applications');
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      setActionLoading(applicationId);
      const response = await api.put(`/applications/${applicationId}/status`, {
        status: newStatus,
      });
      if (response.data?.success) {
        setApplications(
          applications.map((app) =>
            app.id === applicationId ? { ...app, status: newStatus as any } : app
          )
        );
        setSelectedApplicationId(null);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statusConfig = {
    pending: { color: 'bg-blue-100', textColor: 'text-blue-700', icon: Clock },
    shortlisted: { color: 'bg-green-100', textColor: 'text-green-700', icon: CheckCircle },
    rejected: { color: 'bg-red-100', textColor: 'text-red-700', icon: X },
    hired: { color: 'bg-purple-100', textColor: 'text-purple-700', icon: CheckCircle },
    withdrawn: { color: 'bg-gray-100', textColor: 'text-gray-700', icon: X },
  };

  const getStatusCounts = () => ({
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    hired: applications.filter((a) => a.status === 'hired').length,
  });

  const counts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/recruiter')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
              <p className="text-sm text-gray-600">{jobTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'shortlisted', 'rejected', 'hired'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status}
                  <span className="ml-1">({counts[status]})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'No applications match your search criteria' : 'No applications yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const StatusIcon = statusConfig[application.status].icon;
              return (
                <div
                  key={application.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{application.user.name}</h3>
                        <p className="text-sm text-gray-600">{application.user.email}</p>
                        <p className="text-sm text-gray-600">{application.user.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-2">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[application.status].color} ${statusConfig[application.status].textColor}`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            {application.status}
                          </span>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">
                          Applied: {new Date(application.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="mb-4 pb-4 border-t">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Match Score</p>
                        <p className="text-lg font-bold text-green-600">{application.match_score}%</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${application.match_score}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <Link
                        href={`/recruiter/jobs/${jobId}/applications/${application.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Application
                      </Link>
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Notes
                      </button>

                      {/* Status Change Dropdown */}
                      <div className="relative group">
                        <button
                          onClick={() =>
                            setSelectedApplicationId(
                              selectedApplicationId === application.id ? null : application.id
                            )
                          }
                          disabled={actionLoading === application.id}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading === application.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Change Status'
                          )}
                        </button>

                        {/* Dropdown Menu */}
                        {selectedApplicationId === application.id && (
                          <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] z-20">
                            {application.status === 'pending' && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusChange(application.id, 'shortlisted')
                                  }
                                  className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-sm border-b"
                                >
                                  ✓ Shortlist
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusChange(application.id, 'rejected')
                                  }
                                  className="block w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600"
                                >
                                  ✗ Reject
                                </button>
                              </>
                            )}
                            {application.status === 'shortlisted' && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusChange(application.id, 'hired')
                                  }
                                  className="block w-full text-left px-4 py-2 hover:bg-green-50 text-sm text-green-600 border-b"
                                >
                                  ✓ Hire
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusChange(application.id, 'rejected')
                                  }
                                  className="block w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600"
                                >
                                  ✗ Reject
                                </button>
                              </>
                            )}
                            {application.status === 'rejected' && (
                              <button
                                onClick={() =>
                                  handleStatusChange(application.id, 'pending')
                                }
                                className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-sm"
                              >
                                Revert to Pending
                              </button>
                            )}
                            {application.status === 'hired' && (
                              <p className="px-4 py-2 text-sm text-gray-600">
                                Application finalised - no changes allowed
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

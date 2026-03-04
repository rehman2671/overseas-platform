'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Save,
  Edit2,
  MessageSquare,
  Clock,
  FileText,
  Download,
  Share2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface TimelineEvent {
  id: number;
  event: string;
  timestamp: string;
  status?: string;
  notes?: string;
}

interface ApplicationDetail {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
  };
  job: {
    id: number;
    title: string;
    company: string;
  };
  resume: {
    id: number;
    title: string;
    url: string;
  };
  status: string;
  match_score: number;
  applied_at: string;
  cover_letter?: string;
  notes?: string;
  timeline: TimelineEvent[];
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const jobId = params.jobId;
  const applicationId = params.applicationId;

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notesText, setNotesText] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!authLoading && user?.role !== 'recruiter') {
      router.push('/dashboard');
      return;
    }

    if (applicationId && jobId) {
      fetchApplicationDetails();
    }
  }, [authLoading, isAuthenticated, user, applicationId, jobId]);

  const fetchApplicationDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/applications/${applicationId}`);
      if (response.data?.success) {
        const data = response.data.data;
        setApplication(data);
        setNotesText(data.notes || '');
      }
    } catch (error) {
      console.error('Failed to fetch application details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true);
      const response = await api.put(`/applications/${applicationId}/notes`, {
        notes: notesText,
      });
      if (response.data?.success) {
        setApplication((prev) => prev ? { ...prev, notes: notesText } : null);
        setIsEditingNotes(false);
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const response = await api.get(`/applications/${applicationId}/timeline`);
      if (response.data?.success && application) {
        setApplication({
          ...application,
          timeline: response.data.data,
        });
      }
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    }
  };

  useEffect(() => {
    if (application) {
      fetchTimeline();
    }
  }, [application?.id]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Application not found</p>
      </div>
    );
  }

  const statusConfig = {
    pending: { color: 'bg-blue-100', textColor: 'text-blue-700' },
    shortlisted: { color: 'bg-green-100', textColor: 'text-green-700' },
    rejected: { color: 'bg-red-100', textColor: 'text-red-700' },
    hired: { color: 'bg-purple-100', textColor: 'text-purple-700' },
    withdrawn: { color: 'bg-gray-100', textColor: 'text-gray-700' },
  };

  const config = statusConfig[application.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{application.user.name}</h1>
              <p className="text-sm text-gray-600">{application.job.title} at {application.job.company}</p>
            </div>
            <span className={`px-4 py-2 rounded-full font-medium ${config.color} ${config.textColor}`}>
              {application.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Applicant Details */}
          <div className="lg:col-span-2">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm font-medium">Email:</span>
                  <a href={`mailto:${application.user.email}`} className="text-blue-600 hover:underline">
                    {application.user.email}
                  </a>
                </div>
                {application.user.phone && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-sm font-medium">Phone:</span>
                    <a href={`tel:${application.user.phone}`} className="text-blue-600 hover:underline">
                      {application.user.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm font-medium">Location:</span>
                  <span className="text-gray-900">{application.user.location}</span>
                </div>
                {application.user.linkedin && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-sm font-medium">LinkedIn:</span>
                    <a
                      href={application.user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Match Score */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Match Analysis</h2>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Overall Match</span>
                  <span className="text-3xl font-bold text-green-600">{application.match_score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${application.match_score}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {application.match_score >= 80
                  ? 'Excellent match for this position'
                  : application.match_score >= 60
                  ? 'Good match for this position'
                  : 'Fair match for this position'}
              </p>
            </div>

            {/* Resume */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume</h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{application.resume.title}</p>
                    <p className="text-sm text-gray-600">PDF Document</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <Download className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            {application.cover_letter && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{application.cover_letter}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Application Timeline</h2>
              <div className="space-y-6">
                {application.timeline && application.timeline.length > 0 ? (
                  application.timeline.map((event, index) => (
                    <div key={event.id} className="relative">
                      {index < application.timeline!.length - 1 && (
                        <div className="absolute left-5 top-12 w-0.5 h-12 bg-gray-300"></div>
                      )}
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{event.event}</p>
                          {event.status && (
                            <p className="text-sm text-blue-600 font-medium capitalize">
                              Status: {event.status}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                          {event.notes && (
                            <p className="text-sm text-gray-600 mt-1 italic">{event.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">No timeline events yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Notes */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Notes
                </h2>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSavingNotes ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingNotes(false);
                        setNotesText(application.notes || '');
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-700 p-3 bg-gray-50 rounded-lg min-h-[200px] whitespace-pre-wrap">
                  {notesText || 'No notes yet. Click the edit button to add notes.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

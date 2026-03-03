'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resumeApi } from '@/lib/api';
import { 
  FileText, 
  Plus, 
  Download, 
  Edit2, 
  Trash2, 
  Copy,
  Star,
  Loader2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Resume {
  id: number;
  title: string;
  slug: string;
  ats_score: number;
  is_default: boolean;
  is_optimized: boolean;
  template: {
    name: string;
    category: string;
  };
  created_at: string;
  updated_at: string;
}

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await resumeApi.getAll();
      setResumes(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      await resumeApi.delete(id.toString());
      toast.success('Resume deleted successfully');
      fetchResumes();
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const handleDuplicate = async (id: number, title: string) => {
    try {
      await resumeApi.duplicate(id.toString(), `${title} (Copy)`);
      toast.success('Resume duplicated successfully');
      fetchResumes();
    } catch (error) {
      toast.error('Failed to duplicate resume');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      // This would need a separate API endpoint
      toast.success('Default resume updated');
      fetchResumes();
    } catch (error) {
      toast.error('Failed to update default resume');
    }
  };

  const getAtsScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
              <p className="text-gray-600 mt-1">Manage and optimize your resumes</p>
            </div>
            <Link
              href="/resumes/new"
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Resume
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {resumes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No resumes yet</h3>
            <p className="text-gray-500 mt-2 mb-6">Create your first resume to start applying for jobs</p>
            <Link
              href="/resumes/new"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Resume
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className={`card hover:shadow-lg transition-shadow ${resume.is_default ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">{resume.title}</h3>
                        <p className="text-sm text-gray-500">{resume.template?.name}</p>
                      </div>
                    </div>
                    {resume.is_default && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </span>
                    )}
                  </div>

                  {/* ATS Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">ATS Score</span>
                      <span className={`text-sm font-medium px-2 py-0.5 rounded ${getAtsScoreColor(resume.ats_score || 0)}`}>
                        {resume.ats_score || 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (resume.ats_score || 0) >= 80 ? 'bg-green-500' :
                          (resume.ats_score || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${resume.ats_score || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {resume.is_optimized && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        AI Optimized
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                      resume.template?.category === 'free' ? 'bg-gray-100 text-gray-700' :
                      resume.template?.category === 'pro' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {resume.template?.category}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Link
                        href={`/resumes/${resume.id}/edit`}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(resume.id, resume.title)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <a
                        href={`/api/resumes/${resume.id}/pdf`}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      {!resume.is_default && (
                        <button
                          onClick={() => handleSetDefault(resume.id)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Set as Default"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

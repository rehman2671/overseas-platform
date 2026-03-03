'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { jobApi } from '@/lib/api';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Loader2,
  Filter,
  Bookmark,
  Globe,
  ChevronDown
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  slug: string;
  company_name: string;
  country: string;
  city: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  job_type: string;
  visa_sponsorship: boolean;
  skills_required: string[];
  match_score?: number;
  featured: boolean;
  created_at: string;
}

export default function JobsPage() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    country: searchParams.get('country') || '',
    job_type: searchParams.get('job_type') || '',
    visa_sponsorship: searchParams.get('visa_sponsorship') === 'true',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (filters.country) params.country = filters.country;
      if (filters.job_type) params.job_type = filters.job_type;
      if (filters.visa_sponsorship) params.visa_sponsorship = true;

      const response = await jobApi.getAll(params);
      setJobs(response.data.data.data || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const getSalaryRange = (job: Job) => {
    if (!job.salary_min && !job.salary_max) return 'Salary not disclosed';
    if (job.salary_min && job.salary_max) {
      return `${job.salary_currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`;
    }
    return `${job.salary_currency} ${(job.salary_min || job.salary_max).toLocaleString()}+`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Dream Job</h1>
          <p className="text-gray-600 mt-2">Discover overseas opportunities with visa sponsorship</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
              <ChevronDown className={`h-4 w-4 ml-2 transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="submit"
              className="btn-primary px-8"
            >
              Search
            </button>
          </form>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Countries</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="Australia">Australia</option>
                  <option value="UAE">UAE</option>
                  <option value="Singapore">Singapore</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  value={filters.job_type}
                  onChange={(e) => setFilters({ ...filters, job_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Types</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.visa_sponsorship}
                    onChange={(e) => setFilters({ ...filters, visa_sponsorship: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Visa Sponsorship Only</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`bg-white rounded-lg shadow-sm border ${job.featured ? 'border-primary-300 ring-1 ring-primary-200' : 'border-gray-200'} p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        <Link href={`/jobs/${job.slug}`} className="hover:text-primary-600">
                          {job.title}
                        </Link>
                      </h3>
                      {job.featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                          Featured
                        </span>
                      )}
                      {job.visa_sponsorship && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <Globe className="h-3 w-3 mr-1" />
                          Visa Sponsorship
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mt-1">{job.company_name}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.city ? `${job.city}, ` : ''}{job.country}
                      </span>
                      <span className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.job_type.replace('_', ' ')}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {getSalaryRange(job)}
                      </span>
                    </div>

                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {job.skills_required.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills_required.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{job.skills_required.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    {job.match_score !== undefined && (
                      <div className="text-right">
                        <span className={`text-sm font-medium ${
                          job.match_score >= 80 ? 'text-green-600' :
                          job.match_score >= 60 ? 'text-yellow-600' : 'text-gray-500'
                        }`}>
                          {Math.round(job.match_score)}% Match
                        </span>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-primary-600 border border-gray-200 rounded-lg hover:border-primary-300">
                        <Bookmark className="h-5 w-5" />
                      </button>
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="btn-primary"
                      >
                        View Details
                      </Link>
                    </div>
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

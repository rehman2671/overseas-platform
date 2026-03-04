import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage');
    if (token) {
      const parsed = JSON.parse(token);
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Resume API
export const resumeApi = {
  getAll: () => api.get('/resumes'),
  getById: (id: string) => api.get(`/resumes/${id}`),
  create: (data: any) => api.post('/resumes', data),
  update: (id: string, data: any) => api.put(`/resumes/${id}`, data),
  autoSave: (id: string, data: any) => api.patch(`/resumes/${id}/auto-save`, data),
  delete: (id: string) => api.delete(`/resumes/${id}`),
  duplicate: (id: string, title: string) => api.post(`/resumes/${id}/duplicate`, { title }),
  // note: backend route uses /download which returns file response
  downloadPdf: (id: string) => api.get(`/resumes/${id}/download`, { responseType: 'blob' }),
  getAtsScore: (id: string) => api.get(`/resumes/${id}/ats-score`),
  optimize: (id: string, jobId: string) => api.post(`/resumes/${id}/optimize`, { job_id: jobId }),
  parse: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resumes/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Job API
export const jobApi = {
  getAll: (params?: any) => api.get('/jobs', { params }),
  getBySlug: (slug: string) => api.get(`/jobs/${slug}`),
  create: (data: any) => api.post('/jobs', data),
  update: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  getRecommended: () => api.get('/jobs/recommended/list'),
  saveJob: (id: string) => api.post(`/jobs/${id}/save`),
  unsaveJob: (id: string) => api.delete(`/jobs/${id}/save`),
  getSavedJobs: () => api.get('/jobs/saved/list'),
  getCountries: () => api.get('/jobs/countries/list'),
};

// Application API
export const applicationApi = {
  getAll: () => api.get('/applications'),
  getById: (id: string) => api.get(`/applications/${id}`),
  apply: (data: any) => api.post('/applications', data),
  withdraw: (id: string) => api.post(`/applications/${id}/withdraw`),
  getStats: () => api.get('/applications/stats/summary'),
  getJobApplications: (jobId: string) => api.get(`/jobs/${jobId}/applications`),
  updateStatus: (id: string, status: string, notes?: string) => 
    api.put(`/applications/${id}/status`, { status, notes }),
};

// Template API
export const templateApi = {
  getAll: (params?: any) => api.get('/templates', { params }),
  getById: (id: string) => api.get(`/templates/${id}`),
  getCategories: () => api.get('/templates/categories/list'),
  getPreview: (id: string) => api.get(`/templates/${id}/preview`),
};

// AI API
export const aiApi = {
  parseResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ai/parse-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  extractJd: (jobDescription: string) => api.post('/ai/extract-jd', { job_description: jobDescription }),
  calculateMatch: (resumeId: string, jobId: string) => 
    api.post('/ai/calculate-match', { resume_id: resumeId, job_id: jobId }),
  calculateAts: (resumeId: string) => api.post('/ai/calculate-ats', { resume_id: resumeId }),
  optimizeResume: (resumeId: string, jobId: string) => 
    api.post('/ai/optimize-resume', { resume_id: resumeId, job_id: jobId }),
  detectSkillGaps: (resumeId: string, jobId: string) => 
    api.post('/ai/skill-gap', { resume_id: resumeId, job_id: jobId }),
  suggestImprovements: (resumeId: string) => 
    api.post('/ai/suggest-improvements', { resume_id: resumeId }),
};

// Subscription API
export const subscriptionApi = {
  getPlans: (type?: string) => api.get('/plans', { params: { type } }),
  getCurrent: () => api.get('/subscriptions/current'),
  subscribe: (planId: string, paymentMethod: string) => 
    api.post('/subscriptions', { plan_id: planId, payment_method: paymentMethod }),
  cancel: () => api.post('/subscriptions/cancel'),
  getFeatures: () => api.get('/subscriptions/features'),
};

// Payment API
export const paymentApi = {
  createOrder: (planId: string) => api.post('/payments/create-order', { plan_id: planId }),
  verify: (data: any) => api.post('/payments/verify', data),
  getHistory: () => api.get('/payments/history'),
};

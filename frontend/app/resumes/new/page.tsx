'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resumeApi, templateApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  Check,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  Folder,
  FileText,
  Sparkles
} from 'lucide-react';
import ExperienceStep from '@/components/resume-builder/ExperienceStep';
import EducationStep from '@/components/resume-builder/EducationStep';
import CertificationsStep from '@/components/resume-builder/CertificationsStep';
import ProjectsStep from '@/components/resume-builder/ProjectsStep';
import PreviewPanel from '@/components/resume-builder/PreviewPanel';
import toast from 'react-hot-toast';

interface Template {
  id: number;
  name: string;
  category: string;
  preview_image: string;
  description: string;
}

const steps = [
  { id: 'template', label: 'Template', icon: FileText },
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'summary', label: 'Summary', icon: Sparkles },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'projects', label: 'Projects', icon: Folder },
];

export default function NewResumePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    template_id: '',
    personal_info: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
    },
    summary: '',
    experience: [] as any[],
    education: [] as any[],
    skills: [] as string[],
    certifications: [] as any[],
    projects: [] as any[],
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await templateApi.getAll();
      return response.data.data;
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (resumeId) {
        // update existing resume
        await resumeApi.update(resumeId.toString(), {
          title: formData.title || 'My Resume',
          template_id: formData.template_id,
          sections_json: formData,
          personal_info: formData.personal_info,
          summary: formData.summary,
          experience: formData.experience,
          education: formData.education,
          skills: formData.skills,
          certifications: formData.certifications,
          projects: formData.projects,
        });
        toast.success('Resume updated successfully!');
      } else {
        const response = await resumeApi.create({
          title: formData.title || 'My Resume',
          template_id: formData.template_id,
          sections_json: formData,
          personal_info: formData.personal_info,
          summary: formData.summary,
          experience: formData.experience,
          education: formData.education,
          skills: formData.skills,
          certifications: formData.certifications,
          projects: formData.projects,
        });
        setResumeId(response.data.data.id);
        toast.success('Resume created successfully!');
      }
      router.push('/resumes');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create resume');
    } finally {
      setIsSubmitting(false);
    }
  };

  // autosave draft when resumeId exists
  useEffect(() => {
    if (!resumeId) return;
    const timer = setInterval(() => {
      autoSaveDraft();
    }, 30000);
    return () => clearInterval(timer);
  }, [resumeId, formData]);

  const autoSaveDraft = async () => {
    if (!resumeId) return;
    try {
      await resumeApi.autoSave(resumeId.toString(), formData);
      console.debug('Draft auto-saved');
    } catch (e) {
      console.error('Auto-save failed', e);
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'template':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Software Developer Resume"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Choose a Template
              </label>
              {templatesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {templates?.map((template: Template) => (
                    <div
                      key={template.id}
                      onClick={() => setFormData({ ...formData, template_id: template.id.toString() })}
                      className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                        formData.template_id === template.id.toString()
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="aspect-[3/4] bg-gray-100 rounded mb-3 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-900">{template.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{template.category}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.personal_info.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    personal_info: { ...formData.personal_info, name: e.target.value }
                  })}
                  className="input"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.personal_info.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    personal_info: { ...formData.personal_info, email: e.target.value }
                  })}
                  className="input"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.personal_info.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    personal_info: { ...formData.personal_info, phone: e.target.value }
                  })}
                  className="input"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.personal_info.location}
                  onChange={(e) => setFormData({
                    ...formData,
                    personal_info: { ...formData.personal_info, location: e.target.value }
                  })}
                  className="input"
                  placeholder="New York, USA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={formData.personal_info.linkedin}
                  onChange={(e) => setFormData({
                    ...formData,
                    personal_info: { ...formData.personal_info, linkedin: e.target.value }
                  })}
                  className="input"
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website/Portfolio</label>
                <input
                  type="url"
                  value={formData.personal_info.website}
                  onChange={(e) => setFormData({
                    ...formData,
                    personal_info: { ...formData.personal_info, website: e.target.value }
                  })}
                  className="input"
                  placeholder="https://johndoe.com"
                />
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Summary
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={6}
                className="input"
                placeholder="Write a brief summary of your professional background, key skills, and career goals..."
              />
              <p className="text-sm text-gray-500 mt-2">
                Tip: Keep it concise (2-4 sentences) and highlight your most relevant achievements.
              </p>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                  >
                    {skill}
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        skills: formData.skills.filter((_, i) => i !== index)
                      })}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type a skill and press Enter"
                className="input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value && !formData.skills.includes(value)) {
                      setFormData({ ...formData, skills: [...formData.skills, value] });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <p className="text-sm text-gray-500 mt-2">
                Add technical skills, soft skills, languages, tools, etc.
              </p>
            </div>
          </div>
        );

      case 'experience':
        return <ExperienceStep data={formData} onChange={(field, value) => setFormData({ ...formData, [field]: value })} />;
      case 'education':
        return <EducationStep data={formData} onChange={(field, value) => setFormData({ ...formData, [field]: value })} />;
      case 'certifications':
        return <CertificationsStep data={formData} onChange={(field, value) => setFormData({ ...formData, [field]: value })} />;
      case 'projects':
        return <ProjectsStep data={formData} onChange={(field, value) => setFormData({ ...formData, [field]: value })} />;

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">This section will be implemented in the full version.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-bold text-gray-900">Create New Resume</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index < currentStep
                      ? 'bg-primary-600 text-white'
                      : index === currentStep
                      ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <span
                key={step.id}
                className={`text-xs ${
                  index <= currentStep ? 'text-primary-600 font-medium' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content + Preview for large screens */}
        <div className="lg:flex lg:space-x-8">
          <div className="card p-6 lg:w-2/3">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {steps[currentStep].label}
            </h2>
            {renderStepContent()}
          </div>
          <div className="hidden lg:block lg:w-1/3">
            <PreviewPanel data={formData} />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="btn-secondary flex items-center disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="btn-primary flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.template_id}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Resume
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

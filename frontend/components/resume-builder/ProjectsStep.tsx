import React from 'react';
import { X, Plus } from 'lucide-react';

interface ProjectEntry {
  name: string;
  description: string;
  stack: string;
  link: string;
}

interface ProjectsStepProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export default function ProjectsStep({ data, onChange }: ProjectsStepProps) {
  const list: ProjectEntry[] = data.projects || [];

  const updateEntry = (i: number, field: keyof ProjectEntry, value: string) => {
    const updated = list.map((p, idx) => (idx === i ? { ...p, [field]: value } : p));
    onChange('projects', updated);
  };

  const addEntry = () => {
    onChange('projects', [...list, { name: '', description: '', stack: '', link: '' }]);
  };

  const removeEntry = (i: number) => {
    onChange('projects', list.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      {list.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No projects yet. Add your notable projects or portfolios.</p>
      ) : (
        list.map((proj, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-gray-900">{proj.name || `Project ${idx + 1}`}</h3>
              <button
                onClick={() => removeEntry(idx)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={proj.name}
                  onChange={(e) => updateEntry(idx, 'name', e.target.value)}
                  placeholder="e.g., E-commerce Platform"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={proj.description}
                  onChange={(e) => updateEntry(idx, 'description', e.target.value)}
                  placeholder="Describe what the project does and your role..."
                  className="input"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tech Stack
                  </label>
                  <input
                    type="text"
                    value={proj.stack}
                    onChange={(e) => updateEntry(idx, 'stack', e.target.value)}
                    placeholder="e.g., React, Node.js, PostgreSQL"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Link
                  </label>
                  <input
                    type="url"
                    value={proj.link}
                    onChange={(e) => updateEntry(idx, 'link', e.target.value)}
                    placeholder="https://github.com/..."
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>
        ))
      )}
      <button onClick={addEntry} className="btn-outline flex items-center justify-center w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Project
      </button>
    </div>
  );
}

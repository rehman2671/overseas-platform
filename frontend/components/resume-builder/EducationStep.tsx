import React from 'react';
import { X, Plus } from 'lucide-react';

interface EducationEntry {
  school: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
}

interface EducationStepProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export default function EducationStep({ data, onChange }: EducationStepProps) {
  const list: EducationEntry[] = data.education || [];

  const updateEntry = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = list.map((e, i) => (i === index ? { ...e, [field]: value } : e));
    onChange('education', updated);
  };

  const addEntry = () => {
    onChange('education', [...list, { school: '', degree: '', field_of_study: '', start_date: '', end_date: '' }]);
  };

  const removeEntry = (i: number) => {
    onChange('education', list.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      {list.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No education entries yet. Add one to get started.</p>
      ) : (
        list.map((edu, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-gray-900">{edu.school || `Education ${idx + 1}`}</h3>
              <button
                onClick={() => removeEntry(idx)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School/University *
                  </label>
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => updateEntry(idx, 'school', e.target.value)}
                    placeholder="e.g., Stanford University"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree *
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEntry(idx, 'degree', e.target.value)}
                    placeholder="e.g., Bachelor of Science"
                    className="input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    value={edu.field_of_study}
                    onChange={(e) => updateEntry(idx, 'field_of_study', e.target.value)}
                    placeholder="e.g., Computer Science"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={edu.start_date}
                    onChange={(e) => updateEntry(idx, 'start_date', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={edu.end_date}
                  onChange={(e) => updateEntry(idx, 'end_date', e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </div>
        ))
      )}
      <button onClick={addEntry} className="btn-outline flex items-center justify-center w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Education
      </button>
    </div>
  );
}

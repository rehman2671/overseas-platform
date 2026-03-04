import React from 'react';

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
    <div>
      <h2 className="text-xl font-semibold mb-4">Education</h2>
      {list.map((edu, idx) => (
        <div key={idx} className="border p-4 rounded mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span>School/University</span>
              <input
                type="text"
                value={edu.school}
                onChange={(e) => updateEntry(idx, 'school', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
              />
            </label>
            <label className="block">
              <span>Degree</span>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEntry(idx, 'degree', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <label className="block">
              <span>Field of Study</span>
              <input
                type="text"
                value={edu.field_of_study}
                onChange={(e) => updateEntry(idx, 'field_of_study', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
              />
            </label>
            <label className="block">
              <span>Start Date</span>
              <input
                type="date"
                value={edu.start_date}
                onChange={(e) => updateEntry(idx, 'start_date', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
              />
            </label>
          </div>
          <label className="block mt-4">
            <span>End Date</span>
            <input
              type="date"
              value={edu.end_date}
              onChange={(e) => updateEntry(idx, 'end_date', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </label>
          <button onClick={() => removeEntry(idx)} className="text-red-600 mt-2 text-sm">
            Remove
          </button>
        </div>
      ))}
      <button onClick={addEntry} className="btn-outline">
        + Add Education
      </button>
    </div>
  );
}

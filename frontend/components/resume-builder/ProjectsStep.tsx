import React from 'react';

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
    <div>
      <h2 className="text-xl font-semibold mb-4">Projects</h2>
      {list.map((proj, idx) => (
        <div key={idx} className="border p-4 rounded mb-4">
          <label className="block">
            <span>Name</span>
            <input
              type="text"
              value={proj.name}
              onChange={(e) => updateEntry(idx, 'name', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </label>
          <label className="block mt-2">
            <span>Description</span>
            <textarea
              value={proj.description}
              onChange={(e) => updateEntry(idx, 'description', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
              rows={3}
            />
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <label className="block">
              <span>Tech Stack</span>
              <input
                type="text"
                value={proj.stack}
                onChange={(e) => updateEntry(idx, 'stack', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
              />
            </label>
            <label className="block">
              <span>Link</span>
              <input
                type="url"
                value={proj.link}
                onChange={(e) => updateEntry(idx, 'link', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
              />
            </label>
          </div>
          <button onClick={() => removeEntry(idx)} className="text-red-600 mt-2 text-sm">
            Remove
          </button>
        </div>
      ))}
      <button onClick={addEntry} className="btn-outline">
        + Add Project
      </button>
    </div>
  );
}

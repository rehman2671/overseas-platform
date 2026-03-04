import React from 'react';

interface CertEntry {
  name: string;
  issuer: string;
  date: string;
}

interface CertificationsStepProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export default function CertificationsStep({ data, onChange }: CertificationsStepProps) {
  const list: CertEntry[] = data.certifications || [];
  const updateEntry = (i: number, field: keyof CertEntry, value: string) => {
    const updated = list.map((c, idx) => (idx === i ? { ...c, [field]: value } : c));
    onChange('certifications', updated);
  };
  const addEntry = () => {
    onChange('certifications', [...list, { name: '', issuer: '', date: '' }]);
  };
  const removeEntry = (i: number) => {
    onChange('certifications', list.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Certifications</h2>
      {list.map((cert, idx) => (
        <div key={idx} className="border p-4 rounded mb-4">
          <label className="block">
            <span>Name</span>
            <input
              type="text"
              value={cert.name}
              onChange={(e) => updateEntry(idx, 'name', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </label>
          <label className="block mt-2">
            <span>Issuer</span>
            <input
              type="text"
              value={cert.issuer}
              onChange={(e) => updateEntry(idx, 'issuer', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </label>
          <label className="block mt-2">
            <span>Date</span>
            <input
              type="date"
              value={cert.date}
              onChange={(e) => updateEntry(idx, 'date', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </label>
          <button onClick={() => removeEntry(idx)} className="text-red-600 mt-2 text-sm">
            Remove
          </button>
        </div>
      ))}
      <button onClick={addEntry} className="btn-outline">
        + Add Certification
      </button>
    </div>
  );
}

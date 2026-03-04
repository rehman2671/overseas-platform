import React from 'react';
import { X, Plus } from 'lucide-react';

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
    <div className="space-y-4">
      {list.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No certifications yet. Add one to showcase your credentials.</p>
      ) : (
        list.map((cert, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-gray-900">{cert.name || `Certification ${idx + 1}`}</h3>
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
                  Certification Name *
                </label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateEntry(idx, 'name', e.target.value)}
                  placeholder="e.g., AWS Certified Solutions Architect"
                  className="input"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuer *
                  </label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => updateEntry(idx, 'issuer', e.target.value)}
                    placeholder="e.g., Amazon Web Services"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Obtained
                  </label>
                  <input
                    type="date"
                    value={cert.date}
                    onChange={(e) => updateEntry(idx, 'date', e.target.value)}
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
        Add Certification
      </button>
    </div>
  );
}

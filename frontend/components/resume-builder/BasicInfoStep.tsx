import React from 'react';

interface BasicInfoStepProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export default function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      <div className="space-y-4">
        <label className="block">
          <span>Name</span>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md"
          />
        </label>
        {/* Additional inputs (email, phone, location, etc.) will go here */}
      </div>
    </div>
  );
}

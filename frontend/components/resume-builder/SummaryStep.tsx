import React from 'react';

interface SummaryStepProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export default function SummaryStep({ data, onChange }: SummaryStepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Summary</h2>
      <p className="text-gray-500">(Professional summary editor with AI assistance will be added here.)</p>
    </div>
  );
}

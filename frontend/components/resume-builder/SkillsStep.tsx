import React from 'react';

interface SkillsStepProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export default function SkillsStep({ data, onChange }: SkillsStepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Skills</h2>
      <p className="text-gray-500">(Skill tags and proficiency levels will be implemented here.)</p>
    </div>
  );
}

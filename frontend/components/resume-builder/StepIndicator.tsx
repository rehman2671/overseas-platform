import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center space-x-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div
          key={idx}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium 
            ${idx + 1 === currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`
        >
          {idx + 1}
        </div>
      ))}
    </div>
  );
}

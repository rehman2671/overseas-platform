import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface ExperienceEntry {
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface ExperienceStepProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export default function ExperienceStep({ data, onChange }: ExperienceStepProps) {
  const experiences: ExperienceEntry[] = data.experience || [];

  const updateEntry = (index: number, field: keyof ExperienceEntry, value: string) => {
    const updated = experiences.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    );
    onChange('experience', updated);
  };

  const addEntry = () => {
    onChange('experience', [...experiences, { company: '', title: '', start_date: '', end_date: '', description: '' }]);
  };

  const removeEntry = (index: number) => {
    onChange('experience', experiences.filter((_, i) => i !== index));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(experiences);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onChange('experience', items);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="experience-list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {experiences.map((exp, idx) => (
                <Draggable key={idx} draggableId={`exp-${idx}`} index={idx}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="border p-4 rounded mb-4"
                    >
                      <div {...provided.dragHandleProps} className="cursor-move mb-2 text-gray-400">
                        ☰ Drag
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                          <span>Company</span>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateEntry(idx, 'company', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md"
                          />
                        </label>
                        <label className="block">
                          <span>Title</span>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => updateEntry(idx, 'title', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md"
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <label className="block">
                          <span>Start Date</span>
                          <input
                            type="date"
                            value={exp.start_date}
                            onChange={(e) => updateEntry(idx, 'start_date', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md"
                          />
                        </label>
                        <label className="block">
                          <span>End Date</span>
                          <input
                            type="date"
                            value={exp.end_date}
                            onChange={(e) => updateEntry(idx, 'end_date', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md"
                          />
                        </label>
                      </div>
                      <label className="block mt-4">
                        <span>Description</span>
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateEntry(idx, 'description', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md"
                          rows={3}
                        />
                      </label>
                      <button
                        onClick={() => removeEntry(idx)}
                        className="text-red-600 mt-2 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <button onClick={addEntry} className="btn-outline">
        + Add Experience
      </button>
    </div>
  );
}

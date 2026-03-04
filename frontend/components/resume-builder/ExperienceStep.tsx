import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { X, Plus, GripVertical } from 'lucide-react';

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
    <div className="space-y-4">
      {experiences.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No work experience yet. Add your professional experience to get started.</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="experience-list">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-primary-50 rounded-lg p-2' : ''}`}
              >
                {experiences.map((exp, idx) => (
                  <Draggable key={idx} draggableId={`exp-${idx}`} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`border rounded-lg p-4 transition-all ${
                          snapshot.isDragging ? 'shadow-lg bg-white' : 'border-gray-200 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-move">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <h3 className="font-medium text-gray-900 flex-1">
                              {exp.title || exp.company || `Experience ${idx + 1}`}
                            </h3>
                          </div>
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
                                Company *
                              </label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateEntry(idx, 'company', e.target.value)}
                                placeholder="e.g., Google"
                                className="input"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Job Title *
                              </label>
                              <input
                                type="text"
                                value={exp.title}
                                onChange={(e) => updateEntry(idx, 'title', e.target.value)}
                                placeholder="e.g., Senior Software Engineer"
                                className="input"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                              </label>
                              <input
                                type="date"
                                value={exp.start_date}
                                onChange={(e) => updateEntry(idx, 'start_date', e.target.value)}
                                className="input"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                              </label>
                              <input
                                type="date"
                                value={exp.end_date}
                                onChange={(e) => updateEntry(idx, 'end_date', e.target.value)}
                                className="input"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={exp.description}
                              onChange={(e) => updateEntry(idx, 'description', e.target.value)}
                              placeholder="Describe your responsibilities and accomplishments..."
                              className="input"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
      <button onClick={addEntry} className="btn-outline flex items-center justify-center w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Experience
      </button>
    </div>
  );
}

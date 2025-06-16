'use client';
import { DndContext, closestCenter, useSensors, useSensor, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { OptionPrefixPattern } from '@/../../types';

interface SelectorProps {
  options: string[];
  selectedAnswer: string;
  selectedAnswers: number[];
  onSelect: (value: string | number[]) => void;
  onReorder?: (newOptions: string[]) => void;
  isMultiSelect?: boolean;
  isSortable?: boolean;
  optionPrefixPattern?: OptionPrefixPattern;
}

const SortableItem = ({
  id,
  option,
  prefix,
}: {
  id: number;
  option: string;
  prefix: string;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move p-2 border rounded bg-white mb-1"
    >
      {prefix} {option}
    </li>
  );
};

export function AnswerSelector({
  options,
  selectedAnswer,
  selectedAnswers,
  onSelect,
  onReorder,
  isMultiSelect = false,
  isSortable = false,
  optionPrefixPattern = (index) => `${String.fromCharCode(97 + index)})`,
}: SelectorProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);
    if (oldIndex !== newIndex) {
      const reordered = arrayMove(options, oldIndex, newIndex);
      onReorder?.(reordered);
    }
  };

  if (options.length === 0) return null;

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {isSortable ? 'Answer Order:' : 'Correct Answer:'}
      </label>

      {isSortable ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={options.map((_, idx) => idx)} strategy={verticalListSortingStrategy}>
            <ul>
              {options.map((opt, index) => (
                <SortableItem key={index} id={index} option={opt} prefix={optionPrefixPattern(index)} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : isMultiSelect ? (
        <div className="space-y-2">
          {options.map((opt, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedAnswers.includes(index)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...selectedAnswers, index]
                    : selectedAnswers.filter((a) => a !== index);
                  onSelect(updated);
                }}
              />
              <span>{optionPrefixPattern(index)} {opt}</span>
            </label>
          ))}
        </div>
      ) : (
        <select
          value={selectedAnswer}
          onChange={(e) => onSelect(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="">Select answer...</option>
          {options.map((opt, index) => (
            <option key={index} value={opt}>
              {optionPrefixPattern(index)} {opt}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

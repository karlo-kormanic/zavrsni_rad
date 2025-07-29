'use client';
import {
  DndContext,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { OptionPrefixPattern } from '@/../../types';

interface SelectorProps {
  options: string[];
  selectedAnswer: number | '';
  selectedAnswers: number[];
  answerOrder?: number[]; // For sortable mode (host slide editor for scale)
  setAnswerOrder?: (order: number[]) => void;
  onSelect: (value: string | number | number[]) => void;
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
  answerOrder,
  setAnswerOrder,
  onSelect,
  isMultiSelect = false,
  isSortable = false,
  optionPrefixPattern = (index) => `${String.fromCharCode(97 + index)})`,
}: SelectorProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    if (!answerOrder || !setAnswerOrder) return;

    const { active, over } = event;
    if (!over) return;

    const oldIndex = answerOrder.indexOf(Number(active.id));
    const newIndex = answerOrder.indexOf(Number(over.id));
    if (oldIndex !== newIndex) {
      const newOrder = arrayMove(answerOrder, oldIndex, newIndex);
      setAnswerOrder(newOrder);
      onSelect(newOrder); // set the answer as an array of indices
    }
  };

  if (options.length === 0) return null;

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {isSortable ? 'Answer Order:' : 'Correct Answer:'}
      </label>

      {isSortable && answerOrder && setAnswerOrder ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={answerOrder} strategy={verticalListSortingStrategy}>
            <ul>
              {answerOrder.map((optIndex) => (
                <SortableItem
                  key={optIndex}
                  id={optIndex}
                  option={options[optIndex]}
                  prefix={optionPrefixPattern(optIndex)}
                />
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
              <span>
                {optionPrefixPattern(index)} {opt}
              </span>
            </label>
          ))}
        </div>
      ) : (
        <select
          value={selectedAnswer}
          onChange={(e) => onSelect(parseInt(e.target.value))}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="">Select answer...</option>
          {options.map((opt, index) => (
            <option key={index} value={index}>
              {optionPrefixPattern(index)} {opt}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

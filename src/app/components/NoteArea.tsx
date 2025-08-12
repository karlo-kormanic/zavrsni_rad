type NoteAreaProps = {
  note: string;
  onChange: (note: string) => void;
};

const NoteArea = ({ note, onChange }: NoteAreaProps) => {
  return (
    <div className="h-[10vh] bg-gray-50 border border-gray-300 p-2 rounded">
      <textarea
        value={note}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full border border-gray-300 rounded p-2"
        placeholder="Click to add notes..."
      />
    </div>
  );
};

export default NoteArea;
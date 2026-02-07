export default function StrokeColor({
  color,
  selected,
  onSelect,
  label,
}: {
  color: string;
  selected: boolean;
  onSelect: (color: string) => void;
  label?: string;
}) {
  return (
    <div
      className={`h-6 w-6 rounded-sm border border-black/20 cursor-pointer ${
        selected ? "ring-2 ring-black/60" : ""
      }`}
      style={{ backgroundColor: color }}
      onClick={() => onSelect(color)}
      role="button"
      aria-pressed={selected}
      aria-label={label}
    />
  );
}

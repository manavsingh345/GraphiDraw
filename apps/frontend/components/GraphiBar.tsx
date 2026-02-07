import StrokeColor from "./StrokeColor";

const strokeColors = ["#FFFFFF", "#111827", "#EF4444", "#22C55E", "#3B82F6", "#F59E0B"];
const fillColors = ["transparent", "#FFFFFF", "#111827", "#EF4444", "#22C55E", "#3B82F6", "#F59E0B"];

export default function GraphiBar({strokeColor,setStrokeColor,fillColor,setFillColor,}: {
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  fillColor: string;
  setFillColor: (color: string) => void;
}) {
  return (
    <div className="bg-yellow-200 h-1/2 w-1/7 left-2 top-20 fixed z-10 rounded-2xl">
      <div className="w-full pt-2">
        <span className="pl-3 text-md">Stroke</span>

        <div className="px-3 pt-2 flex gap-2 flex-wrap">
          {strokeColors.map((color) => (
            <StrokeColor
              key={color}
              color={color}
              selected={strokeColor === color}
              onSelect={setStrokeColor}
              label={`Stroke ${color}`}
            />
          ))}
        </div>

        <span className="pl-3 text-md">Fill</span>
        <div className="px-3 pt-2 flex gap-2 flex-wrap">
          {fillColors.map((color) => (
            <StrokeColor
              key={color}
              color={color}
              selected={fillColor === color}
              onSelect={setFillColor}
              label={color === "transparent" ? "No fill" : `Fill ${color}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

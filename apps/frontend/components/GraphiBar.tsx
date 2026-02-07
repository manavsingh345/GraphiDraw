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
    <div className="h-1/2 w-1/7 left-4 top-20 fixed z-10 rounded-2xl" style={{backgroundColor:"#FAF7F7"}}>
      <div className="w-full pt-3">
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

        <div className="pt-4">
        <span className="pl-3 text-md">Background</span>
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
    </div>
  );
}

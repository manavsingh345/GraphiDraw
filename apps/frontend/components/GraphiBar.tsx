import StrokeColor from "./StrokeColor";

const strokeColors = ["#FFFFFF", "#111827", "#EF4444", "#22C55E", "#3B82F6", "#F59E0B"];
const fillColors = ["transparent", "#FFFFFF", "#111827", "#EF4444", "#22C55E", "#3B82F6", "#F59E0B"];
const strokeWidths = [1, 2, 4, 6, 8];

export default function GraphiBar({strokeColor,setStrokeColor,fillColor,setFillColor,strokeWidth,setStrokeWidth,}: {
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  fillColor: string;
  setFillColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
}) {
  return (
    <div className="fixed left-4 top-20 z-40 w-55 rounded-2xl border border-slate-200/70 bg-white/90 shadow-lg shadow-slate-900/10 backdrop-blur-md">
      <div className="w-full px-3 pb-3 pt-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stroke</span>
        <div className="mt-2 flex flex-wrap gap-2">
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
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stroke Width</span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {strokeWidths.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setStrokeWidth(w)}
                className={`h-8 w-8 rounded-md border border-slate-200 bg-white/80 text-slate-900 shadow-sm transition hover:-translate-y-px hover:shadow ${
                  strokeWidth === w ? "ring-2 ring-slate-900/60" : ""
                }`}
                aria-label={`Stroke width ${w}`}
              >
                <span className="block mx-auto w-5 rounded-full" style={{ height: w, backgroundColor: "#111827" }} />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Background</span>
        <div className="mt-2 flex flex-wrap gap-2">
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

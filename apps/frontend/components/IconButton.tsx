import { ReactNode } from "react";
import { cn } from "./lib/util";

export function IconButton({
  icon,
  onClick,
  active = false,
  label,
}: {
  icon?: ReactNode;
  onClick?: () => void;
  active?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "h-9 w-9 flex items-center justify-center rounded-md border shadow-sm",
        "bg-popover text-popover-foreground",
        "hover:bg-accent hover:text-accent-foreground",
        "transition-colors",
        active && "bg-accent text-accent-foreground"
      )}
    >
      {icon}
    </button>
  );
}

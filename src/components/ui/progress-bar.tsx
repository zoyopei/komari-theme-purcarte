import { getProgressBarClass } from "@/utils";

export const ProgressBar = ({
  value,
  h = "h-3",
  className,
  tooltip,
}: {
  value: number;
  h?: string;
  className?: string;
  tooltip?: string;
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));
  const progressRoundedClass =
    clampedValue < 10 ? "rounded-sm" : "rounded-full";

  return (
    <div
      className={`w-full bg-(--accent-4)/50 rounded-full ${h} overflow-hidden relative group cursor-help`}
      title={tooltip}>
      <div
        className={`${h} ${progressRoundedClass} transition-all duration-500 ${getProgressBarClass(
          clampedValue
        )} ${className}`}
        style={{ width: `${clampedValue}%` }}></div>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

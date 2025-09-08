import { getProgressBarClass } from "@/utils";

export const ProgressBar = ({
  value,
  h = "h-3",
  className,
}: {
  value: number;
  h?: string;
  className?: string;
}) => (
  <div className={`w-full bg-(--accent-4)/50 rounded-full ${h}`}>
    <div
      className={`${h} rounded-full transition-all duration-500 ${getProgressBarClass(
        value
      )} ${className}`}
      style={{ width: `${value}%` }}></div>
  </div>
);

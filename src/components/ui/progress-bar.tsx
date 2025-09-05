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
  <div className={`w-full bg-gray-200 rounded-full ${h} dark:bg-gray-700`}>
    <div
      className={`${h} rounded-full transition-all duration-500 ${getProgressBarClass(
        value
      )} ${className}`}
      style={{ width: `${value}%` }}></div>
  </div>
);

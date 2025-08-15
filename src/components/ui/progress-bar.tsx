export const ProgressBar = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => (
  <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
    <div
      className={`h-3 rounded-full transition-all duration-500 ${className}`}
      style={{ width: `${value}%` }}></div>
  </div>
);

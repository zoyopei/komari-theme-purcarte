import { Badge } from "@radix-ui/themes";
import React from "react";
import { cn } from "@/utils";

interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  tags: string[];
}

const colors: Array<
  | "ruby"
  | "gray"
  | "gold"
  | "bronze"
  | "brown"
  | "yellow"
  | "amber"
  | "orange"
  | "tomato"
  | "red"
  | "crimson"
  | "pink"
  | "plum"
  | "purple"
  | "violet"
  | "iris"
  | "indigo"
  | "blue"
  | "cyan"
  | "teal"
  | "jade"
  | "green"
  | "grass"
  | "lime"
  | "mint"
  | "sky"
> = [
  "ruby",
  "gray",
  "gold",
  "bronze",
  "brown",
  "yellow",
  "amber",
  "orange",
  "tomato",
  "red",
  "crimson",
  "pink",
  "plum",
  "purple",
  "violet",
  "iris",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "jade",
  "green",
  "grass",
  "lime",
  "mint",
  "sky",
];

// 解析带颜色的标签
const parseTagWithColor = (tag: string) => {
  const colorMatch = tag.match(/<(\w+)>$/);
  if (colorMatch) {
    const color = colorMatch[1].toLowerCase();
    const text = tag.replace(/<\w+>$/, "");
    // 检查颜色是否在支持的颜色列表中
    if (colors.includes(color as any)) {
      return { text, color: color as (typeof colors)[number] };
    }
  }
  return { text: tag, color: null };
};

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ className, tags, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap gap-1", className)}
        {...props}>
        {tags.map((tag, index) => {
          const { text, color } = parseTagWithColor(tag);
          const badgeColor = color || colors[index % colors.length];

          return (
            <Badge
              key={index}
              color={badgeColor}
              variant="soft"
              className="text-sm">
              <label className="text-xs">{text}</label>
            </Badge>
          );
        })}
      </div>
    );
  }
);

Tag.displayName = "Tag";

export { Tag };

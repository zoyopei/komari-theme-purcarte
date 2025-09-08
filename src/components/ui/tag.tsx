import { Badge } from "@radix-ui/themes";
import React from "react";
import { cn } from "@/utils";
import { useConfigItem } from "@/config";

interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  tags: string[];
}

// 定义颜色类型
type ColorType =
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
  | "sky";

// 完整的颜色列表，用于标签颜色匹配
const allColors: ColorType[] = [
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
    // 检查颜色是否在完整的颜色列表中
    if (allColors.includes(color as ColorType)) {
      return { text, color: color as ColorType };
    }
  }
  return { text: tag, color: null as unknown as ColorType | null };
};

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ className, tags, ...props }, ref) => {
    // 在组件内部使用 useConfigItem 钩子
    const tagDefaultColorList = useConfigItem("tagDefaultColorList");
    const enableTransparentTags = useConfigItem("enableTransparentTags");

    // 解析配置的颜色列表，仅用于循环排序
    const colorList = React.useMemo(() => {
      return tagDefaultColorList
        .split(",")
        .map((color: string) => color.trim()) as ColorType[];
    }, [tagDefaultColorList]);

    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap gap-1", className)}
        {...props}>
        {tags.map((tag, index) => {
          const { text, color } = parseTagWithColor(tag);
          const badgeColor = color || colorList[index % colorList.length];
          if (!enableTransparentTags) {
            return (
              <Badge
                key={index}
                color={badgeColor as ColorType}
                variant="surface"
                className="text-sm">
                <label className="text-xs">{text}</label>
              </Badge>
            );
          } else {
            return (
              <div
                key={index}
                data-accent-color={badgeColor}
                className={cn(
                  "rt-reset rt-Badge rt-r-size-1 transition-colors rt-Badge-tag-transparent"
                )}>
                {text}
              </div>
            );
          }
        })}
      </div>
    );
  }
);

Tag.displayName = "Tag";

export { Tag };

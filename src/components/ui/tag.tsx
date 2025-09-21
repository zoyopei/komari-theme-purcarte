import { Badge } from "@radix-ui/themes";
import React from "react";
import { cn } from "@/utils";
import { useAppConfig } from "@/config";
import { allColors } from "@/config/default";
import type { ColorType } from "@/config/default";

interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  tags: string[];
}

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
    const { enableTransparentTags, tagDefaultColorList } = useAppConfig();

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

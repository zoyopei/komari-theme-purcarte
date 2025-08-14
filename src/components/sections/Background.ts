import { useEffect, useMemo } from "react";
import { BACKGROUND } from "@/config/default";
import type { PublicInfo } from "@/types/node.d";

/**
 * 动态效果不佳，暂时仅使用静态背景
 */
interface ThemeSettings {
  backgroundImage?: string; // 背景图片URL
}

interface BackgroundProps {
  publicSettings: PublicInfo;
}

function Background({ publicSettings }: BackgroundProps) {
  const theme = (publicSettings?.theme_settings as ThemeSettings) || {};

  // 使用 useMemo 缓存背景图片列表，避免每次渲染时重新计算
  const imageUrl = useMemo(() => {
    return theme.backgroundImage
      ? theme.backgroundImage
      : BACKGROUND.backgroundImage;
  }, [theme.backgroundImage]);

  // 背景切换逻辑
  useEffect(() => {
    // 当当前图片URL变化时，更新CSS变量
    document.body.style.setProperty(
      "--body-background-url",
      `url(${imageUrl})`
    );
  }, [imageUrl]);

  // 此组件不渲染任何可见内容
  return null;
}

export default Background;

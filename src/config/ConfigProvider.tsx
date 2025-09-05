import { type ReactNode, useEffect, useMemo } from "react";
import type { PublicInfo } from "@/types/node.d";
import { ConfigContext } from "./ConfigContext";
import { DEFAULT_CONFIG, type ConfigOptions } from "./default";

// 配置提供者属性类型
interface ConfigProviderProps {
  publicSettings: PublicInfo | null; // 公共设置，可能为 null
  children: ReactNode;
}

/**
 * 配置提供者组件，用于将配置传递给子组件
 */
export function ConfigProvider({
  publicSettings,
  children,
}: ConfigProviderProps) {
  const theme = useMemo(() => {
    return (publicSettings?.theme_settings as ConfigOptions) || {};
  }, [publicSettings?.theme_settings]);

  // 使用 useMemo 缓存背景图片，避免每次渲染时重新计算
  const backgroundImage = useMemo(() => {
    return theme.backgroundImage || "";
  }, [theme.backgroundImage]);

  // 使用 useMemo 缓存模糊值，避免每次渲染时重新计算
  const blurValue = useMemo(() => {
    return theme.blurValue ?? DEFAULT_CONFIG.blurValue ?? 10;
  }, [theme.blurValue]);

  // 使用 useMemo 缓存模糊背景颜色，避免每次渲染时重新计算
  const blurBackgroundColor = useMemo(() => {
    return (
      theme.blurBackgroundColor || DEFAULT_CONFIG.blurBackgroundColor || ""
    );
  }, [theme.blurBackgroundColor]);

  // 合并的样式设置逻辑
  useEffect(() => {
    // 设置背景图片
    if (backgroundImage) {
      document.body.style.setProperty(
        "--body-background-url",
        `url(${backgroundImage})`
      );
    } else {
      document.body.style.removeProperty("--body-background-url");
    }

    // 设置模糊值
    document.documentElement.style.setProperty(
      "--purcarte-blur",
      `${blurValue}px`
    );

    // 设置模糊背景颜色（亮色/暗色模式）
    if (blurBackgroundColor) {
      // 解析颜色字符串，支持逗号分隔的亮色,暗色
      const colors = blurBackgroundColor
        .split("|")
        .map((color) => color.trim());
      if (colors.length >= 2) {
        // 第一个颜色用于亮色模式，第二个颜色用于暗色模式
        document.documentElement.style.setProperty("--card-light", colors[0]);
        document.documentElement.style.setProperty("--card-dark", colors[1]);
      } else if (colors.length === 1) {
        // 只有一个颜色，同时用于亮色和暗色模式
        document.documentElement.style.setProperty("--card-light", colors[0]);
        document.documentElement.style.setProperty("--card-dark", colors[0]);
      }
    }
  }, [backgroundImage, blurValue, blurBackgroundColor]);

  const config: ConfigOptions = useMemo(
    () => ({
      tagDefaultColorList:
        theme.tagDefaultColorList || DEFAULT_CONFIG.tagDefaultColorList,
      enableLogo: theme.enableLogo ?? DEFAULT_CONFIG.enableLogo,
      logoUrl: theme.logoUrl || DEFAULT_CONFIG.logoUrl,
      enableTitle: theme.enableTitle ?? DEFAULT_CONFIG.enableTitle,
      titleText:
        theme.titleText || publicSettings?.sitename || DEFAULT_CONFIG.titleText,
      enableSearchButton:
        theme.enableSearchButton ?? DEFAULT_CONFIG.enableSearchButton,
      selectedDefaultView:
        theme.selectedDefaultView || DEFAULT_CONFIG.selectedDefaultView,
      selectedDefaultAppearance:
        theme.selectedDefaultAppearance ||
        DEFAULT_CONFIG.selectedDefaultAppearance,
      enableAdminButton:
        theme.enableAdminButton ?? DEFAULT_CONFIG.enableAdminButton,
      enableStatsBar: theme.enableStatsBar ?? DEFAULT_CONFIG.enableStatsBar,
      enableGroupedBar:
        theme.enableGroupedBar ?? DEFAULT_CONFIG.enableGroupedBar,
      enableInstanceDetail:
        theme.enableInstanceDetail ?? DEFAULT_CONFIG.enableInstanceDetail,
      enablePingChart: theme.enablePingChart ?? DEFAULT_CONFIG.enablePingChart,
      enableConnectBreaks:
        theme.enableConnectBreaks ?? DEFAULT_CONFIG.enableConnectBreaks,
      pingChartMaxPoints:
        theme.pingChartMaxPoints || DEFAULT_CONFIG.pingChartMaxPoints,
      backgroundImage,
      blurValue,
      blurBackgroundColor,
      enableSwap: theme.enableSwap ?? DEFAULT_CONFIG.enableSwap,
      enableListItemProgressBar:
        theme.enableListItemProgressBar ??
        DEFAULT_CONFIG.enableListItemProgressBar,
    }),
    [
      theme,
      backgroundImage,
      blurValue,
      blurBackgroundColor,
      publicSettings?.sitename,
    ]
  );

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}

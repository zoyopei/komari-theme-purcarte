import { type ReactNode, useEffect, useMemo, useState } from "react";
import type { PublicInfo } from "@/types/node.d";
import { ConfigContext } from "./ConfigContext";
import { DEFAULT_CONFIG, type ConfigOptions } from "./default";
import { apiService } from "@/services/api";
import Loading from "@/components/loading";

// 配置提供者属性类型
interface ConfigProviderProps {
  children: ReactNode;
}

/**
 * 配置提供者组件，用于将配置传递给子组件
 */
export function ConfigProvider({ children }: ConfigProviderProps) {
  const [publicSettings, setPublicSettings] = useState<PublicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchPublicSettings = async () => {
      try {
        const settings = await apiService.getPublicSettings();
        setPublicSettings(settings);
      } catch (error) {
        console.error("Failed to fetch public settings:", error);
      } finally {
        setLoading(false);
        setTimeout(() => setIsLoaded(true), 300); // 动画过渡
      }
    };

    fetchPublicSettings();
  }, []);

  const config: ConfigOptions = useMemo(() => {
    const themeSettings =
      (publicSettings?.theme_settings as ConfigOptions) || {};
    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...themeSettings,
      titleText:
        themeSettings.titleText ||
        publicSettings?.sitename ||
        DEFAULT_CONFIG.titleText,
    };

    return mergedConfig;
  }, [publicSettings]);

  useEffect(() => {
    const { backgroundImage, blurValue, blurBackgroundColor } = config;

    if (backgroundImage) {
      document.body.style.setProperty(
        "--body-background-url",
        `url(${backgroundImage})`
      );
    } else {
      document.body.style.removeProperty("--body-background-url");
    }

    document.documentElement.style.setProperty(
      "--purcarte-blur",
      `${blurValue}px`
    );

    if (blurBackgroundColor) {
      const colors = blurBackgroundColor
        .split("|")
        .map((color) => color.trim());
      if (colors.length >= 2) {
        document.documentElement.style.setProperty("--card-light", colors[0]);
        document.documentElement.style.setProperty("--card-dark", colors[1]);
      } else if (colors.length === 1) {
        document.documentElement.style.setProperty("--card-light", colors[0]);
        document.documentElement.style.setProperty("--card-dark", colors[0]);
      }
    }
  }, [config]);

  if (!isLoaded) {
    return (
      <Loading text="加载配置中..." className={!loading ? "fade-out" : ""} />
    );
  }

  return (
    <ConfigContext.Provider value={{ ...config, publicSettings }}>
      <div className="fade-in">{children}</div>
    </ConfigContext.Provider>
  );
}

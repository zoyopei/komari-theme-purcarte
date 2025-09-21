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
  const [config, setConfig] = useState<ConfigOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchPublicSettings = async () => {
      try {
        const settings = await apiService.getPublicSettings();
        setPublicSettings(settings);

        if (settings) {
          const themeSettings =
            (settings.theme_settings as ConfigOptions) || {};
          const mergedConfig = {
            ...DEFAULT_CONFIG,
            ...themeSettings,
            titleText:
              themeSettings.titleText ||
              settings.sitename ||
              DEFAULT_CONFIG.titleText,
          };
          setConfig(mergedConfig);
        } else {
          setConfig(DEFAULT_CONFIG);
        }
      } catch (error) {
        console.error("Failed to fetch public settings:", error);
        setConfig(DEFAULT_CONFIG);
      } finally {
        setLoading(false);
        setTimeout(() => setIsLoaded(true), 300); // 动画过渡
      }
    };

    fetchPublicSettings();
  }, []);

  const dynamicStyles = useMemo(() => {
    if (!config) return "";

    const { backgroundImage, blurValue, blurBackgroundColor } = config;
    const styles: string[] = [];

    if (backgroundImage) {
      styles.push(`--body-background-url: url(${backgroundImage});`);
    }

    if (blurValue) {
      styles.push(`--purcarte-blur: ${blurValue}px;`);
    }

    if (blurBackgroundColor) {
      const colors = blurBackgroundColor
        .split("|")
        .map((color) => color.trim());
      if (colors.length >= 2) {
        styles.push(`--card-light: ${colors[0]};`);
        styles.push(`--card-dark: ${colors[1]};`);
      } else if (colors.length === 1) {
        styles.push(`--card-light: ${colors[0]};`);
        styles.push(`--card-dark: ${colors[0]};`);
      }
    }

    return `:root { ${styles.join(" ")} }`;
  }, [config]);

  if (!isLoaded || !config) {
    return (
      <Loading text="加载配置中..." className={!loading ? "fade-out" : ""} />
    );
  }

  return (
    <ConfigContext.Provider value={{ ...config, publicSettings }}>
      <style>{dynamicStyles}</style>
      <div className="fade-in">{children}</div>
    </ConfigContext.Provider>
  );
}

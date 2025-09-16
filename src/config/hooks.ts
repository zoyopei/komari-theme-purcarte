import { useContext } from "react";
import type { ConfigOptions } from "./default";
import { ConfigContext } from "./ConfigContext";
import { DEFAULT_CONFIG } from "./default";

/**
 * 使用全局配置 Hook，用于获取当前应用配置
 * @returns 配置对象（合并了默认配置，确保所有属性都有值）
 */
export function useAppConfig(): ConfigOptions {
  const config = useContext(ConfigContext);
  return { ...DEFAULT_CONFIG, ...config };
}

/**
 * 使用特定配置项 Hook，直接获取某个配置项的值
 * @param key 配置项键名
 * @returns 配置项的值
 */
export function useConfigItem<K extends keyof ConfigOptions>(
  key: K
): ConfigOptions[K] {
  const config = useContext(ConfigContext);
  // 如果 context 中的值存在则使用，否则回退到默认值
  return config[key] ?? DEFAULT_CONFIG[key];
}

// 导出配置类型
export type { ConfigOptions } from "./default";

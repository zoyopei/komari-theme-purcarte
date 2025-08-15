import { useContext } from "react";
import type { ConfigOptions } from "./default";
import { ConfigContext } from "./ConfigContext";

/**
 * 使用全局配置 Hook，用于获取当前应用配置
 * @returns 配置对象
 */
export function useAppConfig(): ConfigOptions {
  return useContext(ConfigContext);
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
  return config[key];
}

// 导出配置类型
export type { ConfigOptions } from "./default";

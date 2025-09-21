import { useContext } from "react";
import { ConfigContext } from "./ConfigContext";
import type { ConfigContextType } from "./ConfigContext";
import { DEFAULT_CONFIG } from "./default";

/**
 * 使用全局配置 Hook，用于获取当前应用配置
 * @returns 配置对象（合并了默认配置，确保所有属性都有值）
 */

export function useAppConfig(): ConfigContextType {
  const config = useContext(ConfigContext);
  return { ...DEFAULT_CONFIG, ...config };
}

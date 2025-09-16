import { createContext } from "react";
import type { ConfigOptions } from "./default";
import { DEFAULT_CONFIG } from "./default";
import type { PublicInfo } from "@/types/node.d";

export interface ConfigContextType extends ConfigOptions {
  publicSettings: PublicInfo | null;
}

// 创建配置上下文
export const ConfigContext = createContext<ConfigContextType>({
  ...DEFAULT_CONFIG,
  publicSettings: null,
});

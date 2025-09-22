// 配置类型定义
export interface ConfigOptions {
  backgroundImage: string; // 背景图片URL
  enableVideoBackground: boolean; // 是否启用视频背景
  videoBackgroundUrl: string; // 视频背景URL
  blurValue: number; // 磨砂玻璃模糊值
  blurBackgroundColor: string; // 磨砂玻璃背景颜色
  enableTransparentTags: boolean; // 是否启用标签透明背景
  tagDefaultColorList: string; // 标签默认颜色列表
  selectThemeColor: ColorType; // 默认主题颜色
  enableLocalStorage: boolean; // 是否启用本地存储
  selectedDefaultView: ViewModeType; // 默认视图模式
  selectedDefaultAppearance: AppearanceType; // 默认外观模式
  statusCardsVisibility: string; // 状态卡片显示控制
  enableLogo: boolean; // 是否启用Logo
  logoUrl: string; // Logo图片URL
  enableTitle: boolean; // 是否启用标题
  titleText: string; // 标题文本
  enableSearchButton: boolean; // 是否启用搜索按钮
  enableAdminButton: boolean; // 是否启用管理员按钮
  enableJsonRPC2Api: boolean; // 是否启用 JSON-RPC2 API 适配
  enableCompactMode: boolean; // 是否启用紧凑模式
  mergeGroupsWithStats: boolean; // 是否在统计栏中合并分组
  enableStatsBar: boolean; // 是否启用统计栏
  enableGroupedBar: boolean; // 是否启用分组栏
  enableInstanceDetail: boolean; // 是否启用实例详情
  enablePingChart: boolean; // 是否启用延迟图表
  enableConnectBreaks: boolean; // 是否启用连接断点
  pingChartMaxPoints: number; // 延迟图表最大点数
  enableSwap: boolean; // 是否启用SWAP显示
  selectTrafficProgressStyle: "circular" | "linear"; // 流量进度条样式
  enableListItemProgressBar: boolean; // 是否启用列表视图进度条
}

// 默认配置值
export const DEFAULT_CONFIG: ConfigOptions = {
  backgroundImage: "/assets/Moonlit-Scenery.webp",
  enableVideoBackground: false,
  videoBackgroundUrl: "/assets/LanternRivers_1080p15fps2Mbps3s.mp4",
  blurValue: 10,
  blurBackgroundColor: "rgba(255, 255, 255, 0.5)|rgba(0, 0, 0, 0.5)",
  enableTransparentTags: true,
  tagDefaultColorList:
    "ruby,gray,gold,bronze,brown,yellow,amber,orange,tomato,red",
  selectThemeColor: "violet",
  enableLocalStorage: true,
  selectedDefaultView: "grid",
  selectedDefaultAppearance: "system",
  statusCardsVisibility:
    "currentTime:true,currentOnline:true,regionOverview:true,trafficOverview:true,networkSpeed:true",
  enableLogo: false,
  logoUrl: "/assets/logo.png",
  enableTitle: true,
  titleText: "Komari",
  enableSearchButton: true,
  enableAdminButton: true,
  enableJsonRPC2Api: false,
  enableCompactMode: false,
  mergeGroupsWithStats: false,
  enableStatsBar: true,
  enableGroupedBar: true,
  enableInstanceDetail: true,
  enablePingChart: true,
  enableConnectBreaks: false,
  pingChartMaxPoints: 0,
  enableSwap: true,
  selectTrafficProgressStyle: "linear",
  enableListItemProgressBar: true,
};

// 定义颜色类型
export type ColorType =
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
export const allColors: ColorType[] = [
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

export type AppearanceType = "light" | "dark" | "system";
export const allAppearance: AppearanceType[] = ["light", "dark", "system"];

export type ViewModeType = "grid" | "table";

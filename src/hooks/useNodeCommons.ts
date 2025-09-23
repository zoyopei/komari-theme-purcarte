import { useMemo } from "react";
import { formatPrice } from "@/utils";
import type { NodeData } from "@/types/node";

export const useNodeCommons = (node: NodeData & { stats?: any }) => {
  const { stats } = node;
  const isOnline = stats ? stats.online : false;
  const price = formatPrice(node.price, node.currency, node.billing_cycle);

  const cpuUsage = stats && isOnline ? stats.cpu : 0;
  const memUsage =
    stats && isOnline && node.mem_total > 0
      ? (stats.ram / node.mem_total) * 100
      : 0;
  const swapUsage =
    stats && isOnline && node.swap_total > 0
      ? (stats.swap / node.swap_total) * 100
      : 0;
  const diskUsage =
    stats && isOnline && node.disk_total > 0
      ? (stats.disk / node.disk_total) * 100
      : 0;

  const load =
    stats && isOnline
      ? `${stats.load.toFixed(2)} | ${stats.load5.toFixed(
          2
        )} | ${stats.load15.toFixed(2)}`
      : "N/A";

  const daysLeft =
    node.expired_at && new Date(node.expired_at).getTime() > 0
      ? Math.ceil(
          (new Date(node.expired_at).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  let daysLeftTag = null;
  if (daysLeft !== null) {
    if (daysLeft < 0) {
      daysLeftTag = "已过期<red>";
    } else if (daysLeft <= 7) {
      daysLeftTag = `余 ${daysLeft} 天<red>`;
    } else if (daysLeft <= 15) {
      daysLeftTag = `余 ${daysLeft} 天<orange>`;
    } else if (daysLeft < 36500) {
      daysLeftTag = `余 ${daysLeft} 天<green>`;
    } else {
      daysLeftTag = "长期<green>";
    }
  }

  const expired_at =
    daysLeft !== null && daysLeft > 36500
      ? "长期"
      : node.expired_at && new Date(node.expired_at).getTime() > 0
      ? new Date(node.expired_at).toLocaleDateString()
      : "未设置";

  const tagList = [
    ...(price ? [price] : []),
    ...(daysLeftTag ? [daysLeftTag] : []),
    ...(typeof node.tags === "string"
      ? node.tags
          .split(";")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : []),
  ];

  // 计算流量使用百分比
  const trafficPercentage = useMemo(() => {
    if (!node.traffic_limit || !stats || !isOnline) return 0;

    // 根据流量限制类型确定使用的流量值
    let usedTraffic = 0;
    switch (node.traffic_limit_type) {
      case "up":
        usedTraffic = stats.net_total_up;
        break;
      case "down":
        usedTraffic = stats.net_total_down;
        break;
      case "sum":
        usedTraffic = stats.net_total_up + stats.net_total_down;
        break;
      case "min":
        usedTraffic = Math.min(stats.net_total_up, stats.net_total_down);
        break;
      default: // max 或者未设置
        usedTraffic = Math.max(stats.net_total_up, stats.net_total_down);
        break;
    }

    return (usedTraffic / node.traffic_limit) * 100;
  }, [node.traffic_limit, node.traffic_limit_type, stats, isOnline]);

  return {
    stats,
    isOnline,
    tagList,
    cpuUsage,
    memUsage,
    swapUsage,
    diskUsage,
    load,
    expired_at,
    trafficPercentage,
  };
};

import { useMemo } from "react";
import type { NodeWithStatus } from "@/types/node";
import { formatPrice } from "@/utils";

export const useNodeCommons = (node: NodeWithStatus) => {
  const { stats, isOnline } = useMemo(() => {
    return {
      stats: node.stats,
      isOnline: node.status === "online",
    };
  }, [node]);

  const price = formatPrice(node.price, node.currency, node.billing_cycle);

  const cpuUsage = stats && isOnline ? stats.cpu.usage : 0;
  const memUsage =
    stats && isOnline && stats.ram.total > 0
      ? (stats.ram.used / stats.ram.total) * 100
      : 0;
  const swapUsage =
    stats && isOnline && stats.swap.total > 0
      ? (stats.swap.used / stats.swap.total) * 100
      : 0;
  const diskUsage =
    stats && isOnline && stats.disk.total > 0
      ? (stats.disk.used / stats.disk.total) * 100
      : 0;

  const load = stats
    ? `${stats.load.load1.toFixed(2)} | ${stats.load.load5.toFixed(
        2
      )} | ${stats.load.load15.toFixed(2)}`
    : "N/A";

  const daysLeft = node.expired_at
    ? Math.ceil(
        (new Date(node.expired_at).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  let daysLeftTag = null;
  if (daysLeft !== null) {
    if (daysLeft < 0) {
      daysLeftTag = "已过期";
    } else if (daysLeft < 36500) {
      daysLeftTag = `余 ${daysLeft} 天`;
    } else {
      daysLeftTag = "长期";
    }
  }

  const expired_at =
    daysLeft !== null && daysLeft > 36500
      ? "长期"
      : node.expired_at
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
  };
};

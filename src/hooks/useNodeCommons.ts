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

  const tagList = [
    price,
    `${daysLeft && daysLeft < 0 ? "已过期" : ""}${
      daysLeft && daysLeft >= 0 && daysLeft < 36500
        ? "余 " + daysLeft + " 天"
        : ""
    }`,
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
    daysLeft,
  };
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NodeWithStatus } from "@/types/node";
import { useMemo, memo } from "react";
import { formatBytes, formatUptime } from "@/utils";

interface InstanceProps {
  node: NodeWithStatus;
}

const formatTrafficLimit = (
  limit?: number,
  type?: "sum" | "max" | "min" | "up" | "down"
) => {
  if (!limit) return "未设置";

  const limitText = formatBytes(limit);

  const typeText =
    {
      sum: "总和",
      max: "最大值",
      min: "最小值",
      up: "上传",
      down: "下载",
    }[type || "max"] || "";

  return `${limitText} (${typeText})`;
};

const Instance = memo(({ node }: InstanceProps) => {
  const { stats, isOnline } = useMemo(() => {
    return {
      stats: node.stats,
      isOnline: node.status === "online",
    };
  }, [node]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>详细信息</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <p className="text-muted-foreground text-sm">CPU</p>
          <p className="text-sm">{`${node.cpu_name} (x${node.cpu_cores})`}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">架构</p>
          <p className="text-sm">{node.arch}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">虚拟化</p>
          <p className="text-sm">{node.virtualization}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">GPU</p>
          <p className="text-sm">{node.gpu_name || "N/A"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">操作系统</p>
          <p className="text-sm">{node.os}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">内存</p>
          <p className="text-sm">
            {stats && isOnline
              ? `${formatBytes(stats.ram.used)} / ${formatBytes(
                  node.mem_total
                )}`
              : `N/A / ${formatBytes(node.mem_total)}`}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">交换</p>
          <p className="text-sm">
            {stats && isOnline
              ? `${formatBytes(stats.swap.used)} / ${formatBytes(
                  node.swap_total
                )}`
              : `N/A / ${formatBytes(node.swap_total)}`}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">磁盘</p>
          <p className="text-sm">
            {stats && isOnline
              ? `${formatBytes(stats.disk.used)} / ${formatBytes(
                  node.disk_total
                )}`
              : `N/A / ${formatBytes(node.disk_total)}`}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">运行时间</p>
          <p className="text-sm">{formatUptime(stats?.uptime || 0)}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-muted-foreground text-sm">实时网络</p>
          <p className="text-sm">
            {stats && isOnline
              ? `↑ ${formatBytes(stats.network.up, true)} ↓ ${formatBytes(
                  stats.network.down,
                  true
                )}`
              : "N/A"}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-muted-foreground text-sm">总流量</p>
          <p className="text-sm">
            {stats && isOnline
              ? `↑ ${formatBytes(stats.network.totalUp)} ↓ ${formatBytes(
                  stats.network.totalDown
                )}`
              : "N/A"}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-muted-foreground text-sm">流量限制</p>
          <p className="text-sm">
            {formatTrafficLimit(node.traffic_limit, node.traffic_limit_type)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">最后上报</p>
          <p className="text-sm">
            {stats && isOnline
              ? new Date(stats.updated_at).toLocaleString()
              : "N/A"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

export default Instance;

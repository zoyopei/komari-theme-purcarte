import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NodeWithStatus } from "@/types/node";
import { useMemo, memo } from "react";

interface InstanceProps {
  node: NodeWithStatus;
}

const formatUptime = (uptime: number) => {
  if (!uptime) return "N/A";
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  let result = "";
  if (days > 0) result += `${days} 天 `;
  if (hours > 0 || days > 0) result += `${hours} 时 `;
  if (minutes > 0 || hours > 0 || days > 0) result += `${minutes} 分 `;
  result += `${seconds} 秒`;

  return result.trim();
};

const formatBytes = (bytes: number, unit: "KB" | "MB" | "GB" = "GB") => {
  if (bytes === 0) return `0 ${unit}`;
  const k = 1024;
  switch (unit) {
    case "KB":
      return `${(bytes / k).toFixed(2)} KB`;
    case "MB":
      return `${(bytes / (k * k)).toFixed(2)} MB`;
    case "GB":
      return `${(bytes / (k * k * k)).toFixed(2)} GB`;
    default:
      return `${bytes} B`;
  }
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
      <CardHeader>
        <CardTitle>详细信息</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <p className="text-muted-foreground">CPU</p>
          <p>{`${node.cpu_name} (x${node.cpu_cores})`}</p>
        </div>
        <div>
          <p className="text-muted-foreground">架构</p>
          <p>{node.arch}</p>
        </div>
        <div>
          <p className="text-muted-foreground">虚拟化</p>
          <p>{node.virtualization}</p>
        </div>
        <div>
          <p className="text-muted-foreground">GPU</p>
          <p>{node.gpu_name || "N/A"}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-muted-foreground">操作系统</p>
          <p>{node.os}</p>
        </div>
        <div>
          <p className="text-muted-foreground">内存</p>
          <p>
            {stats && isOnline
              ? `${formatBytes(stats.ram.used)} / ${formatBytes(
                  node.mem_total
                )}`
              : `N/A / ${formatBytes(node.mem_total)}`}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">交换</p>
          <p>
            {stats && isOnline
              ? `${formatBytes(stats.swap.used, "MB")} / ${formatBytes(
                  node.swap_total
                )}`
              : `N/A / ${formatBytes(node.swap_total)}`}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">磁盘</p>
          <p>
            {stats && isOnline
              ? `${formatBytes(stats.disk.used)} / ${formatBytes(
                  node.disk_total
                )}`
              : `N/A / ${formatBytes(node.disk_total)}`}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-muted-foreground">网络</p>
          <p>
            {stats && isOnline
              ? `↑ ${formatBytes(stats.network.up, "KB")}/s ↓ ${formatBytes(
                  stats.network.down,
                  "KB"
                )}/s`
              : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">总流量</p>
          <p>
            {stats && isOnline
              ? `↑ ${formatBytes(stats.network.totalUp)} ↓ ${formatBytes(
                  stats.network.totalDown
                )}`
              : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">运行时间</p>
          <p>{formatUptime(stats?.uptime || 0)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">最后上报</p>
          <p>
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

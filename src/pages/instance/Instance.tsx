import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NodeWithStatus } from "@/types/node";
import { useMemo, memo } from "react";
import { formatBytes, formatUptime, formatTrafficLimit } from "@/utils";
import { CircleProgress } from "@/components/ui/circle-progress";

interface InstanceProps {
  node: NodeWithStatus;
}

const Instance = memo(({ node }: InstanceProps) => {
  const { stats, isOnline } = useMemo(() => {
    return {
      stats: node.stats,
      isOnline: node.status === "online",
    };
  }, [node]);

  // 计算流量使用百分比
  const trafficPercentage = useMemo(() => {
    if (!node.traffic_limit || !stats || !isOnline) return 0;

    // 根据流量限制类型确定使用的流量值
    let usedTraffic = 0;
    switch (node.traffic_limit_type) {
      case "up":
        usedTraffic = stats.network.totalUp;
        break;
      case "down":
        usedTraffic = stats.network.totalDown;
        break;
      case "sum":
        usedTraffic = stats.network.totalUp + stats.network.totalDown;
        break;
      case "min":
        usedTraffic = Math.min(stats.network.totalUp, stats.network.totalDown);
        break;
      default: // max 或者未设置
        usedTraffic = Math.max(stats.network.totalUp, stats.network.totalDown);
        break;
    }

    return (usedTraffic / node.traffic_limit) * 100;
  }, [node.traffic_limit, node.traffic_limit_type, stats, isOnline]);

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
        <div>
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
        <div>
          <p className="text-muted-foreground text-sm">总流量</p>
          <p className="flex items-center gap-2">
            {node.traffic_limit && isOnline && (
              <CircleProgress
                value={trafficPercentage}
                maxValue={100}
                size={36}
              />
            )}
            <div>
              <p className="text-sm">
                {stats && isOnline
                  ? `↑ ${formatBytes(stats.network.totalUp)} ↓ ${formatBytes(
                      stats.network.totalDown
                    )}`
                  : "N/A"}
              </p>
              <p className="text-sm">
                {formatTrafficLimit(
                  node.traffic_limit,
                  node.traffic_limit_type
                )}
              </p>
            </div>
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">负载</p>
          <p className="text-sm">
            {stats && isOnline
              ? `${stats.load.load1.toFixed(2)} | ${stats.load.load5.toFixed(
                  2
                )} | ${stats.load.load15.toFixed(2)}`
              : "N/A"}
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

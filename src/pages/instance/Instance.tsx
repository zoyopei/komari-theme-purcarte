import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NodeData } from "@/types/node";
import { memo } from "react";
import { formatBytes, formatUptime, formatTrafficLimit } from "@/utils";
import { CircleProgress } from "@/components/ui/progress-circle";
import { useNodeCommons } from "@/hooks/useNodeCommons";

interface InstanceProps {
  node: NodeData;
}

const Instance = memo(({ node }: InstanceProps) => {
  const { stats, isOnline, trafficPercentage } = useNodeCommons(node);

  // 计算流量使用百分比

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>详细信息</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <p className="theme-text-muted">CPU</p>
          <p>{`${node.cpu_name} (x${node.cpu_cores})`}</p>
        </div>
        <div>
          <p className="theme-text-muted">架构</p>
          <p>{node.arch}</p>
        </div>
        <div>
          <p className="theme-text-muted">虚拟化</p>
          <p>{node.virtualization}</p>
        </div>
        <div>
          <p className="theme-text-muted">GPU</p>
          <p>{node.gpu_name || "N/A"}</p>
        </div>
        <div>
          <p className="theme-text-muted">操作系统</p>
          <p>{node.os}</p>
        </div>
        <div>
          <p className="theme-text-muted">内存</p>
          <p>
            {stats && isOnline
              ? `${formatBytes(stats.ram)} / ${formatBytes(node.mem_total)}`
              : `N/A / ${formatBytes(node.mem_total)}`}
          </p>
        </div>
        <div>
          <p className="theme-text-muted">交换</p>
          <p>
            {stats && isOnline
              ? `${formatBytes(stats.swap)} / ${formatBytes(node.swap_total)}`
              : `N/A / ${formatBytes(node.swap_total)}`}
          </p>
        </div>
        <div>
          <p className="theme-text-muted">磁盘</p>
          <p>
            {stats && isOnline
              ? `${formatBytes(stats.disk)} / ${formatBytes(node.disk_total)}`
              : `N/A / ${formatBytes(node.disk_total)}`}
          </p>
        </div>
        <div>
          <p className="theme-text-muted">运行时间</p>
          <p>{formatUptime(stats?.uptime || 0)}</p>
        </div>
        <div>
          <p className="theme-text-muted">实时网络</p>
          <p>
            {stats && isOnline
              ? `↑ ${formatBytes(stats.net_out, true)} ↓ ${formatBytes(
                  stats.net_in,
                  true
                )}`
              : "N/A"}
          </p>
        </div>
        <div>
          <p className="theme-text-muted">总流量</p>
          <div className="flex items-center gap-2">
            {node.traffic_limit !== 0 && isOnline && stats && (
              <CircleProgress
                value={trafficPercentage}
                maxValue={100}
                size={32}
                strokeWidth={4}
                showPercentage={true}
              />
            )}
            <div>
              <p>
                {stats && isOnline
                  ? `↑ ${formatBytes(stats.net_total_up)} ↓ ${formatBytes(
                      stats.net_total_down
                    )}`
                  : "N/A"}
              </p>
              <p>
                {formatTrafficLimit(
                  node.traffic_limit,
                  node.traffic_limit_type
                )}
              </p>
            </div>
          </div>
        </div>
        <div>
          <p className="theme-text-muted">负载</p>
          <p>
            {stats && isOnline
              ? `${stats.load.toFixed(2)} | ${stats.load5.toFixed(
                  2
                )} | ${stats.load15.toFixed(2)}`
              : "N/A"}
          </p>
        </div>
        <div>
          <p className="theme-text-muted">最后上报</p>
          <p>
            {stats && isOnline ? new Date(stats.time).toLocaleString() : "N/A"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

export default Instance;

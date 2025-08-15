import { formatBytes, formatTrafficLimit, formatUptime } from "@/utils";
import type { NodeWithStatus } from "@/types/node";
import { Link } from "react-router-dom";
import { CpuIcon, MemoryStickIcon, HardDriveIcon } from "lucide-react";
import Flag from "./Flag";
import { Tag } from "../ui/tag";
import { useNodeCommons } from "@/hooks/useNodeCommons";
import { CircleProgress } from "../ui/circle-progress";

interface NodeListItemProps {
  node: NodeWithStatus;
}

export const NodeListItem = ({ node }: NodeListItemProps) => {
  const {
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
  } = useNodeCommons(node);

  return (
    <div
      className={`grid grid-cols-10 text-center shadow-md gap-4 p-2 items-center rounded-lg ${
        isOnline
          ? ""
          : "striped-bg-red-translucent-diagonal ring-2 ring-red-500/50"
      } text-secondary-foreground transition-colors duration-200`}>
      <div className="col-span-2 flex items-center text-left">
        <Flag flag={node.region} />
        <Link to={`/instance/${node.uuid}`}>
          <div className="ml-2 w-full">
            <div className="text-base font-bold">{node.name}</div>
            <Tag className="text-xs" tags={tagList} />
            <div className="flex text-xs text-nowrap">
              <div className="flex">
                <span className="text-secondary-foreground">到期：</span>
                <div className="flex items-center gap-1">{expired_at}</div>
              </div>
              <div className="border-l border-border/60 mx-2"></div>
              <div className="flex">
                <span className="text-secondary-foreground">在线：</span>
                <span>
                  {isOnline && stats ? formatUptime(stats.uptime) : "离线"}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
      <div className="col-span-1">
        <div className="gap-1 flex items-center justify-center whitespace-nowrap">
          <CpuIcon className="inline-block size-4 flex-shrink-0 text-blue-600" />
          {node.cpu_cores} Cores
        </div>
        <div className="mt-1">
          {isOnline ? `${cpuUsage.toFixed(1)}%` : "N/A"}
        </div>
      </div>
      <div className="col-span-1">
        <div className="gap-1 flex items-center justify-center whitespace-nowrap">
          <MemoryStickIcon className="inline-block size-4 flex-shrink-0 text-green-600" />
          {formatBytes(node.mem_total)}
        </div>
        <div className="mt-1">
          {isOnline ? `${memUsage.toFixed(1)}%` : "N/A"}
        </div>
      </div>
      {node.swap_total > 0 ? (
        <div className="col-span-1">
          {isOnline ? `${swapUsage.toFixed(1)}%` : "N/A"}
        </div>
      ) : (
        <div className="col-span-1 text-secondary-foreground">OFF</div>
      )}
      <div className="col-span-1">
        <div className="gap-1 flex items-center justify-center whitespace-nowrap">
          <HardDriveIcon className="inline-block size-4 flex-shrink-0 text-red-600" />
          {formatBytes(node.disk_total)}
        </div>
        <div className="mt-1">
          {isOnline ? `${diskUsage.toFixed(1)}%` : "N/A"}
        </div>
      </div>
      <div className="col-span-1">
        <div>↑ {stats ? formatBytes(stats.network.up, true) : "N/A"}</div>
        <div>↓ {stats ? formatBytes(stats.network.down, true) : "N/A"}</div>
      </div>
      <div className="col-span-2">
        <div className="flex items-center justify-around">
          {node.traffic_limit !== 0 && isOnline && stats && (
            <div className="flex items-center">
              <CircleProgress
                value={trafficPercentage}
                maxValue={100}
                size={32}
                strokeWidth={4}
                showPercentage={true}
              />
            </div>
          )}
          <div className={node.traffic_limit !== 0 ? "w-2/3" : "w-full"}>
            <div>
              <span>
                ↑ {stats ? formatBytes(stats.network.totalUp) : "N/A"}
              </span>
              <span className="ml-2">
                ↓ {stats ? formatBytes(stats.network.totalDown) : "N/A"}
              </span>
            </div>
            {node.traffic_limit !== 0 && isOnline && stats && (
              <div>
                {formatTrafficLimit(
                  node.traffic_limit,
                  node.traffic_limit_type
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-span-1">
        <span>{load}</span>
      </div>
    </div>
  );
};

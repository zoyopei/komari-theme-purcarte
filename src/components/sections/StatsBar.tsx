import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/utils";
import { useIsMobile } from "@/hooks/useMobile";

interface StatsBarProps {
  displayOptions: {
    currentTime: boolean;
    currentOnline: boolean;
    regionOverview: boolean;
    trafficOverview: boolean;
    networkSpeed: boolean;
  };
  setDisplayOptions: (options: any) => void;
  stats: {
    onlineCount: number;
    totalCount: number;
    uniqueRegions: number;
    totalTrafficUp: number;
    totalTrafficDown: number;
    currentSpeedUp: number;
    currentSpeedDown: number;
  };
  loading: boolean;
}

export const StatsBar = ({
  displayOptions,
  setDisplayOptions,
  stats,
  loading,
}: StatsBarProps) => {
  const isMobile = useIsMobile();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 获取已启用的统计项列表
  const enabledStats = Object.keys(displayOptions).filter(
    (key) => displayOptions[key as keyof typeof displayOptions]
  );

  // 渲染统计项
  const renderStatItem = (key: string) => {
    switch (key) {
      case "currentTime":
        return (
          displayOptions.currentTime && (
            <div className="w-full py-1" key="currentTime">
              <div className="flex flex-col gap-2">
                <label className="text-secondary-foreground text-sm">
                  当前时间
                </label>
                <label className="font-medium -mt-2 text-md">
                  {time.toLocaleTimeString()}
                </label>
              </div>
            </div>
          )
        );
      case "currentOnline":
        return (
          displayOptions.currentOnline && (
            <div className="w-full py-1" key="currentOnline">
              <div className="flex flex-col gap-2">
                <label className="text-secondary-foreground text-sm">
                  当前在线
                </label>
                <label className="font-medium -mt-2 text-md">
                  {loading
                    ? "..."
                    : `${stats.onlineCount} / ${stats.totalCount}`}
                </label>
              </div>
            </div>
          )
        );
      case "regionOverview":
        return (
          displayOptions.regionOverview && (
            <div className="w-full py-1" key="regionOverview">
              <div className="flex flex-col gap-2">
                <label className="text-secondary-foreground text-sm">
                  点亮地区
                </label>
                <label className="font-medium -mt-2 text-md">
                  {loading ? "..." : stats.uniqueRegions}
                </label>
              </div>
            </div>
          )
        );
      case "trafficOverview":
        return (
          displayOptions.trafficOverview && (
            <div className="w-full py-1" key="trafficOverview">
              <div className="flex flex-col gap-2">
                <label className="text-secondary-foreground text-sm">
                  流量概览
                </label>
                <div className="font-medium -mt-2 text-md">
                  {loading ? (
                    "..."
                  ) : (
                    <div className="flex flex-col items-center">
                      <span>{`↑ ${formatBytes(stats.totalTrafficUp)}`}</span>
                      <span>{`↓ ${formatBytes(stats.totalTrafficDown)}`}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        );
      case "networkSpeed":
        return (
          displayOptions.networkSpeed && (
            <div className="w-full py-1" key="networkSpeed">
              <div className="flex flex-col gap-2">
                <label className="text-secondary-foreground text-sm">
                  网络速率
                </label>
                <div className="font-medium -mt-2 text-md">
                  {loading ? (
                    "..."
                  ) : (
                    <div className="flex flex-col items-center">
                      <span>{`↑ ${formatBytes(stats.currentSpeedUp)}/s`}</span>
                      <span>{`↓ ${formatBytes(
                        stats.currentSpeedDown
                      )}/s`}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        );
      default:
        return null;
    }
  };
  return (
    <div className="purcarte-blur min-w-[300px] text-secondary-foreground my-6 mx-4 px-4 theme-card-style text-sm relative flex items-center min-h-[5rem]">
      <div className="absolute top-2 right-2">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Settings2 />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>状态显示设置</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
              <span>当前时间</span>
              <Switch
                checked={displayOptions.currentTime}
                onCheckedChange={(checked) =>
                  setDisplayOptions({
                    ...displayOptions,
                    currentTime: checked,
                  })
                }
              />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
              <span>当前在线</span>
              <Switch
                checked={displayOptions.currentOnline}
                onCheckedChange={(checked) =>
                  setDisplayOptions({
                    ...displayOptions,
                    currentOnline: checked,
                  })
                }
              />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
              <span>点亮地区</span>
              <Switch
                checked={displayOptions.regionOverview}
                onCheckedChange={(checked) =>
                  setDisplayOptions({
                    ...displayOptions,
                    regionOverview: checked,
                  })
                }
              />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
              <span>流量概览</span>
              <Switch
                checked={displayOptions.trafficOverview}
                onCheckedChange={(checked) =>
                  setDisplayOptions({
                    ...displayOptions,
                    trafficOverview: checked,
                  })
                }
              />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
              <span>网络速率</span>
              <Switch
                checked={displayOptions.networkSpeed}
                onCheckedChange={(checked) =>
                  setDisplayOptions({
                    ...displayOptions,
                    networkSpeed: checked,
                  })
                }
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div
        className="grid w-full gap-2 text-center items-center py-3"
        style={{
          gridTemplateColumns: isMobile
            ? "repeat(2, 1fr)"
            : "repeat(auto-fit, minmax(180px, 1fr))",
          gridAutoRows: "min-content",
        }}>
        {enabledStats.map((key) => renderStatItem(key))}
      </div>
    </div>
  );
};

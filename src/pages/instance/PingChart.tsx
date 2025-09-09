import { memo, useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useMobile";
import { Eye, EyeOff, ArrowRightToLine, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@radix-ui/react-label";
import type { NodeData } from "@/types/node";
import Loading from "@/components/loading";
import { usePingChart } from "@/hooks/usePingChart";
import fillMissingTimePoints, {
  cutPeakValues,
  calculateTaskStats,
} from "@/utils/RecordHelper";
import { useConfigItem } from "@/config";
import { CustomTooltip } from "@/components/ui/tooltip";
import Tips from "@/components/ui/tips";
import { generateColor, lableFormatter } from "@/utils/chartHelper";

interface PingChartProps {
  node: NodeData;
  hours: number;
}

const PingChart = memo(({ node, hours }: PingChartProps) => {
  const { loading, error, pingHistory } = usePingChart(node, hours);
  const [visiblePingTasks, setVisiblePingTasks] = useState<number[]>([]);
  const [timeRange, setTimeRange] = useState<[number, number] | null>(null);
  const [brushIndices, setBrushIndices] = useState<{
    startIndex?: number;
    endIndex?: number;
  }>({});
  const [cutPeak, setCutPeak] = useState(false);
  const [connectBreaks, setConnectBreaks] = useState(
    useConfigItem("enableConnectBreaks")
  );
  const [isResetting, setIsResetting] = useState(false);
  const maxPointsToRender = useConfigItem("pingChartMaxPoints") || 0; // 0表示不限制
  const isMobile = useIsMobile();

  useEffect(() => {
    if (pingHistory?.tasks) {
      const taskIds = pingHistory.tasks.map((t) => t.id);
      setVisiblePingTasks((prevVisibleTasks) => {
        const newVisibleTasks = taskIds.filter(
          (id) => prevVisibleTasks.length === 0 || prevVisibleTasks.includes(id)
        );
        return newVisibleTasks.length > 0 ? newVisibleTasks : taskIds;
      });
    }
  }, [pingHistory?.tasks]);

  useEffect(() => {
    if (isResetting) {
      setTimeRange(null);
      setBrushIndices({});
      setIsResetting(false);
    }
  }, [isResetting]);

  const chartMargin = { top: 8, right: 16, bottom: 8, left: 16 };

  const chartData = useMemo(() => {
    if (!pingHistory || !pingHistory.records || !pingHistory.tasks) return [];

    const grouped: Record<string, any> = {};
    const timeKeys: number[] = [];

    for (const rec of pingHistory.records) {
      const t = new Date(rec.time).getTime();
      let foundKey = null;
      // 查找是否可以合并到现有时间点
      for (const key of timeKeys) {
        if (Math.abs(key - t) <= 5000) {
          foundKey = key;
          break;
        }
      }
      const useKey = foundKey !== null ? foundKey : t;
      if (!grouped[useKey]) {
        grouped[useKey] = { time: useKey };
        // 如果是新的时间点，则添加到 timeKeys 中
        if (foundKey === null) {
          timeKeys.push(useKey);
        }
      }
      grouped[useKey][rec.task_id] = rec.value === -1 ? null : rec.value;
    }

    let full = Object.values(grouped).sort((a: any, b: any) => a.time - b.time);

    if (hours !== 0) {
      const task = pingHistory.tasks;
      let interval = task[0]?.interval || 60; // base interval in seconds
      const maxGap = interval * 1.2;

      // 使用固定的 hours 值进行降采样计算，不依赖 timeRange
      const selectedDurationHours = hours;
      const totalDurationSeconds = hours * 60 * 60;

      // 根据所选视图调整间隔，进行更积极的降采样
      if (selectedDurationHours > 30 * 24) {
        // > 30 天
        interval = 60 * 60; // 1 hour
      } else if (selectedDurationHours > 7 * 24) {
        // > 7 天
        interval = 15 * 60; // 15 minutes
      } else if (selectedDurationHours > 24) {
        // > 1 天
        interval = 5 * 60; // 5 minutes
      }

      full = fillMissingTimePoints(
        full,
        interval,
        totalDurationSeconds,
        maxGap
      );

      full = full.map((d: any) => ({
        ...d,
        time: new Date(d.time).getTime(),
      }));
    }

    // 添加渲染硬限制以防止崩溃，即使在间隔调整后也是如此
    if (full.length > maxPointsToRender && maxPointsToRender > 0) {
      console.log(
        `数据量过大 (${full.length}), 降采样至 ${maxPointsToRender} 个点。`
      );
      const samplingFactor = Math.ceil(full.length / maxPointsToRender);
      const sampledData = [];
      for (let i = 0; i < full.length; i += samplingFactor) {
        sampledData.push(full[i]);
      }
      full = sampledData;
    }

    if (cutPeak && pingHistory.tasks.length > 0) {
      const taskKeys = pingHistory.tasks.map((task) => String(task.id));
      full = cutPeakValues(full, taskKeys);
    }

    return full;
  }, [pingHistory, hours, maxPointsToRender, cutPeak]);

  const handleTaskVisibilityToggle = (taskId: number) => {
    setVisiblePingTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleToggleAll = () => {
    if (!pingHistory?.tasks) return;
    if (visiblePingTasks.length === pingHistory.tasks.length) {
      setVisiblePingTasks([]);
    } else {
      setVisiblePingTasks(pingHistory.tasks.map((t) => t.id));
    }
  };

  const sortedTasks = useMemo(() => {
    if (!pingHistory?.tasks) return [];
    return [...pingHistory.tasks].sort((a, b) => a.id - b.id);
  }, [pingHistory?.tasks]);

  const breakPoints = useMemo(() => {
    if (!connectBreaks || !chartData || chartData.length < 2) {
      return [];
    }
    const points: { x: number; color: string }[] = [];
    for (const task of sortedTasks) {
      if (!visiblePingTasks.includes(task.id)) {
        continue;
      }
      const taskKey = String(task.id);
      for (let i = 1; i < chartData.length; i++) {
        const prevPoint = chartData[i - 1];
        const currentPoint = chartData[i];

        const isBreak =
          (currentPoint[taskKey] === null ||
            currentPoint[taskKey] === undefined) &&
          prevPoint[taskKey] !== null &&
          prevPoint[taskKey] !== undefined;

        if (isBreak) {
          points.push({
            x: currentPoint.time,
            color: generateColor(task.name, sortedTasks),
          });
        }
      }
    }
    return points;
  }, [chartData, sortedTasks, visiblePingTasks, connectBreaks]);

  const taskStats = useMemo(() => {
    if (!pingHistory?.records || !sortedTasks.length) return [];

    return sortedTasks.map((task) => {
      const { loss, latestValue, latestTime } = calculateTaskStats(
        pingHistory.records,
        task.id,
        timeRange
      );
      return {
        ...task,
        value: latestValue,
        time: latestTime,
        loss: loss,
        color: generateColor(task.name, sortedTasks),
      };
    });
  }, [pingHistory?.records, sortedTasks, timeRange]);

  return (
    <div className="relative space-y-4">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center purcarte-blur rounded-lg z-10">
          <Loading text="正在加载图表数据..." />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center purcarte-blur rounded-lg z-10">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {pingHistory?.tasks && pingHistory.tasks.length > 0 && (
        <Card className="relative">
          <div className="absolute top-2 right-2">
            <Tips>
              <span
                dangerouslySetInnerHTML={{
                  __html: "<p>丢包率计算算法并不准确，谨慎参考</p>",
                }}></span>
            </Tips>
          </div>
          <CardContent className="p-2">
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {taskStats.map((task) => {
                const isVisible = visiblePingTasks.includes(task.id);

                return (
                  <div
                    key={task.id}
                    className={`h-auto px-3 py-1.5 flex flex-col leading-snug text-center cursor-pointer rounded-md transition-all outline-2 outline ${
                      isVisible ? "" : "outline-transparent"
                    }`}
                    onClick={() => handleTaskVisibilityToggle(task.id)}
                    style={{
                      outlineColor: isVisible ? task.color : undefined,
                      boxShadow: isVisible
                        ? `0 0 8px ${task.color}`
                        : undefined,
                    }}>
                    <div className="font-semibold">{task.name}</div>
                    <div className="flex text-xs font-normal">
                      <span>
                        {task.value !== null
                          ? `${task.value.toFixed(1)} ms | ${task.loss.toFixed(
                              1
                            )}%`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap">
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center space-x-2">
                <Switch
                  id="peak-shaving"
                  checked={cutPeak}
                  onCheckedChange={setCutPeak}
                />
                <Label htmlFor="peak-shaving">平滑</Label>
                <Tips>
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        '<h2 class="text-lg font-bold">关于数据平滑的提示</h2><p>当您开启平滑后，您在统计图中看到的曲线经过<strong>指数加权移动平均 (EWMA)</strong> 算法处理，这是一种常用的数据平滑技术。</p></br><p>需要注意的是，经过EWMA算法平滑后的曲线所展示的数值，<strong>并非原始的、真实的测量数据</strong>。它们是根据EWMA算法计算得出的一个<strong>平滑趋势线</strong>，旨在减少数据波动，使数据模式和趋势更容易被识别。</p></br><p>因此，您看到的数值更像是<strong>视觉上的呈现</strong>，帮助您更好地理解数据的整体走向和长期趋势，而不是每一个时间点的精确真实值。如果您需要查看具体、原始的数据点，请参考未经平滑处理的数据视图。</p>',
                    }}
                  />
                </Tips>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="connect-breaks"
                  checked={connectBreaks}
                  onCheckedChange={setConnectBreaks}
                />
                <Label htmlFor="connect-breaks">连接断点</Label>
                <Tips>
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        '<h2 class="text-lg font-bold">关于连接断点的提示</h2><p><strong>默认关闭，可在后台配置</strong></p><p>当您开启"连接断点"功能后，图表中的曲线将会跨过那些由于网络问题或其他原因导致的丢包点，形成一条连续的线条。同时，系统会在丢包位置显示<strong>半透明的垂直参考线</strong>来标记断点位置。</p>',
                    }}
                  />
                </Tips>
              </div>
            </div>
            <div className={`flex gap-2 ${isMobile ? "w-full mt-2" : ""}`}>
              <Button variant="secondary" onClick={handleToggleAll} size="sm">
                {pingHistory?.tasks &&
                visiblePingTasks.length === pingHistory.tasks.length ? (
                  <>
                    <EyeOff size={16} />
                    隐藏全部
                  </>
                ) : (
                  <>
                    <Eye size={16} />
                    显示全部
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (timeRange) {
                    if (chartData.length > 1) {
                      const endIndex = chartData.length - 1;
                      const startIndex = 0;
                      setTimeRange([
                        chartData[startIndex].time,
                        chartData[endIndex].time,
                      ]);
                      setBrushIndices({ startIndex, endIndex });
                      setIsResetting(true);
                    }
                  } else if (chartData.length > 1) {
                    const endIndex = chartData.length - 1;
                    const startIndex = Math.floor(endIndex * 0.75);
                    setTimeRange([
                      chartData[startIndex].time,
                      chartData[endIndex].time,
                    ]);
                    setBrushIndices({ startIndex, endIndex });
                  }
                }}
                size="sm">
                {timeRange ? (
                  <RefreshCw size={16} />
                ) : (
                  <ArrowRightToLine size={16} />
                )}
                {timeRange ? "重置范围" : "四分之一"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {pingHistory?.tasks && pingHistory.tasks.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid
                  strokeDasharray="2 4"
                  stroke="var(--theme-line-muted-color)"
                  vertical={false}
                />
                <XAxis
                  type="number"
                  dataKey="time"
                  domain={timeRange || ["dataMin", "dataMax"]}
                  tickFormatter={(time) => {
                    const date = new Date(time);
                    if (hours === 0) {
                      return date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      });
                    }
                    return date.toLocaleString([], {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  }}
                  tick={{ fill: "var(--theme-text-muted-color)" }}
                  axisLine={{
                    stroke: "var(--theme-line-muted-color)",
                  }}
                  scale="time"
                />
                <YAxis
                  mirror={true}
                  width={30}
                  tick={{ fill: "var(--theme-text-muted-color)" }}
                  axisLine={{
                    stroke: "var(--theme-line-muted-color)",
                  }}
                />
                <Tooltip
                  cursor={false}
                  content={
                    <CustomTooltip
                      labelFormatter={(value) => lableFormatter(value, hours)}
                    />
                  }
                />
                {connectBreaks &&
                  breakPoints.map((point, index) => (
                    <ReferenceLine
                      key={`break-${index}`}
                      x={point.x}
                      stroke={point.color}
                      strokeWidth={1.5}
                      strokeOpacity={0.5}
                    />
                  ))}
                {sortedTasks.map((task) => (
                  <Line
                    key={task.id}
                    type={"monotone"}
                    dataKey={String(task.id)}
                    name={task.name}
                    stroke={generateColor(task.name, sortedTasks)}
                    strokeWidth={2}
                    hide={!visiblePingTasks.includes(task.id)}
                    dot={false}
                    connectNulls={connectBreaks}
                  />
                ))}
                <Brush
                  {...brushIndices}
                  dataKey="time"
                  height={30}
                  stroke="var(--theme-text-muted-color)"
                  fill="var(--accent-a4)"
                  tickFormatter={(time) => {
                    const date = new Date(time);
                    if (hours === 0) {
                      return date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      });
                    }
                    return date.toLocaleDateString([], {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  }}
                  onChange={(e: any) => {
                    if (
                      e.startIndex !== undefined &&
                      e.endIndex !== undefined &&
                      chartData[e.startIndex] &&
                      chartData[e.endIndex]
                    ) {
                      setTimeRange([
                        chartData[e.startIndex].time,
                        chartData[e.endIndex].time,
                      ]);
                      setBrushIndices({
                        startIndex: e.startIndex,
                        endIndex: e.endIndex,
                      });
                    } else {
                      setTimeRange(null);
                      setBrushIndices({});
                    }
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center">
              <p>暂无数据</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default PingChart;

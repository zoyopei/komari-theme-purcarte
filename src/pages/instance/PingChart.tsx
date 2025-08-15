import { memo, useState, useMemo, useCallback, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@radix-ui/react-label";
import type { NodeData } from "@/types/node";
import Loading from "@/components/loading";
import { usePingChart } from "@/hooks/usePingChart";
import fillMissingTimePoints, { cutPeakValues } from "@/utils/RecordHelper";
import { Button } from "@/components/ui/button";
import { useConfigItem } from "@/config";

interface PingChartProps {
  node: NodeData;
  hours: number;
}

const PingChart = memo(({ node, hours }: PingChartProps) => {
  const { loading, error, pingHistory } = usePingChart(node, hours);
  const [visiblePingTasks, setVisiblePingTasks] = useState<number[]>([]);
  const [timeRange, setTimeRange] = useState<[number, number] | null>(null);
  const [cutPeak, setCutPeak] = useState(false);
  const maxPointsToRender = useConfigItem("pingChartMaxPoints") || 0; // 0表示不限制

  useEffect(() => {
    if (pingHistory?.tasks) {
      setVisiblePingTasks(pingHistory.tasks.map((t) => t.id));
    }
  }, [pingHistory]);

  const lableFormatter = useCallback(
    (value: any) => {
      const date = new Date(value);
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
    },
    [hours]
  );

  const chartData = useMemo(() => {
    if (!pingHistory || !pingHistory.records || !pingHistory.tasks) return [];

    const grouped: Record<string, any> = {};
    // 优化：将2秒窗口内的点分组，以合并几乎同时的记录
    for (const rec of pingHistory.records) {
      const t = new Date(rec.time).getTime();
      const useKey = Math.round(t / 2000) * 2000;
      if (!grouped[useKey]) {
        grouped[useKey] = { time: useKey };
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

  const stringToColor = useCallback((str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  }, []);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-lg z-10">
          <Loading text="正在加载图表数据..." />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-lg z-10">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-sm font-medium">Ping 延迟</CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  id="peak-shaving"
                  checked={cutPeak}
                  onCheckedChange={setCutPeak}
                />
                <Label htmlFor="peak-shaving">开启削峰</Label>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {(pingHistory?.tasks || []).map((task) => {
                const values = chartData
                  .map((d) => d[task.id])
                  .filter((v) => v !== null && v !== undefined) as number[];
                const loss =
                  chartData.length > 0
                    ? (1 - values.length / chartData.length) * 100
                    : 0;
                const min = values.length > 0 ? Math.min(...values) : 0;
                const isVisible = visiblePingTasks.includes(task.id);

                return (
                  <div key={task.id} className="flex flex-col items-center">
                    <Button
                      variant={isVisible ? "default" : "outline"}
                      size="sm"
                      className="h-auto px-2 py-1 flex flex-col"
                      onClick={() => handleTaskVisibilityToggle(task.id)}
                      style={{
                        backgroundColor: isVisible
                          ? stringToColor(task.name)
                          : undefined,
                        color: isVisible ? "white" : undefined,
                      }}>
                      <div>{task.name}</div>
                      <span className="text-xs">
                        {loss.toFixed(1)}% | {min.toFixed(0)}ms
                      </span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pingHistory?.tasks && pingHistory.tasks.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="2 4" vertical={false} />
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
                  scale="time"
                />
                <YAxis />
                <Tooltip labelFormatter={lableFormatter} />
                {pingHistory.tasks.map((task) => (
                  <Line
                    key={task.id}
                    type={cutPeak ? "basis" : "linear"}
                    dataKey={String(task.id)}
                    name={task.name}
                    stroke={stringToColor(task.name)}
                    strokeWidth={2}
                    hide={!visiblePingTasks.includes(task.id)}
                    dot={false}
                    connectNulls={false}
                  />
                ))}
                <Brush
                  dataKey="time"
                  height={30}
                  stroke="#8884d8"
                  alwaysShowText
                  tickFormatter={(time) => {
                    const date = new Date(time);
                    if (hours === 0) {
                      return date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
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
                    } else {
                      setTimeRange(null);
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

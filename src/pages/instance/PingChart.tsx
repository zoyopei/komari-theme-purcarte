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

interface PingChartProps {
  node: NodeData;
  hours: number;
}

const PingChart = memo(({ node, hours }: PingChartProps) => {
  const { loading, error, pingHistory } = usePingChart(node, hours);
  const [visiblePingTasks, setVisiblePingTasks] = useState<number[]>([]);
  const [timeRange, setTimeRange] = useState<[number, number] | null>(null);
  const [cutPeak, setCutPeak] = useState(false);

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
    const timeKeys: number[] = [];

    for (const rec of pingHistory.records) {
      const t = new Date(rec.time).getTime();
      let foundKey = null;
      for (const key of timeKeys) {
        if (Math.abs(key - t) <= 1500) {
          foundKey = key;
          break;
        }
      }
      const useKey = foundKey !== null ? foundKey : t;
      if (!grouped[useKey]) {
        grouped[useKey] = { time: useKey };
        if (foundKey === null) timeKeys.push(useKey);
      }
      grouped[useKey][rec.task_id] = rec.value === -1 ? null : rec.value;
    }

    let full = Object.values(grouped).sort((a: any, b: any) => a.time - b.time);

    if (hours !== 0) {
      const task = pingHistory.tasks;
      let interval = task[0]?.interval || 60;
      let maxGap = interval * 1.2;
      const selectedHours = timeRange
        ? (timeRange[1] - timeRange[0]) / (1000 * 60 * 60)
        : hours;

      if (selectedHours > 24) {
        interval *= 60;
      }

      full = fillMissingTimePoints(full, interval, hours * 60 * 60, maxGap);

      full = full.map((d: any) => ({
        ...d,
        time: new Date(d.time).getTime(),
      }));
    }

    if (cutPeak && pingHistory.tasks.length > 0) {
      const taskKeys = pingHistory.tasks.map((task) => String(task.id));
      full = cutPeakValues(full, taskKeys);
    }

    return full;
  }, [pingHistory, hours, cutPeak, timeRange]);

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
                      className="h-8 px-2"
                      onClick={() => handleTaskVisibilityToggle(task.id)}
                      style={{
                        backgroundColor: isVisible
                          ? stringToColor(task.name)
                          : undefined,
                        color: isVisible ? "white" : undefined,
                      }}>
                      {task.name}
                      <span className="text-xs mt-1">
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="time"
                  {...(chartData.length > 1 && {
                    domain: ["dataMin", "dataMax"],
                  })}
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

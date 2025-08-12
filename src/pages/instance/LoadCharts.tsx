import { memo, useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { NodeData, NodeStats } from "@/types/node";
import { formatBytes } from "@/utils";
import fillMissingTimePoints, { type RecordFormat } from "@/utils/RecordHelper";
import { Flex } from "@radix-ui/themes";
import Loading from "@/components/loading";
import { useNodeData } from "@/contexts/NodeDataContext";

interface LoadChartsProps {
  node: NodeData;
  hours: number;
  data?: RecordFormat[];
  liveData?: NodeStats;
}

const ChartTitle = (text: string, left: React.ReactNode) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{text}</CardTitle>
      <span className="text-sm font-bold">{left}</span>
    </CardHeader>
  );
};

const LoadCharts = memo(
  ({ node, hours, data = [], liveData: live_data }: LoadChartsProps) => {
    const { getLoadHistory } = useNodeData();
    const [historicalData, setHistoricalData] = useState<RecordFormat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isRealtime = hours === 0;

    useEffect(() => {
      if (!isRealtime) {
        const fetchHistoricalData = async () => {
          setLoading(true);
          setError(null);
          try {
            const data = await getLoadHistory(node.uuid, hours);
            setHistoricalData(data?.records || []);
          } catch (err: any) {
            setError(err.message || "Failed to fetch historical data");
          } finally {
            setLoading(false);
          }
        };
        fetchHistoricalData();
      } else {
        // For realtime, we expect data to be passed via props.
        // We can set loading to false if data is present.
        setLoading(false);
      }
    }, [node.uuid, hours, getLoadHistory, isRealtime]);

    const minute = 60;
    const hour = minute * 60;
    const chartData = isRealtime
      ? data
      : hours === 1
      ? fillMissingTimePoints(historicalData ?? [], minute, hour, minute * 2)
      : (() => {
          const interval = hours > 120 ? hour : minute * 15;
          const maxGap = interval * 2;
          return fillMissingTimePoints(
            historicalData ?? [],
            interval,
            hour * hours,
            maxGap
          );
        })();
    const chartDataLengthRef = useRef(0);
    chartDataLengthRef.current = chartData.length;

    const timeFormatter = useCallback((value: any, index: number) => {
      if (chartDataLengthRef.current === 0) {
        return "";
      }
      if (index === 0 || index === chartDataLengthRef.current - 1) {
        return new Date(value).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return "";
    }, []);

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

    const cn = "flex flex-col w-full h-full gap-4 justify-between";
    const chartMargin = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    };
    const colors = ["#F38181", "#FCE38A", "#EAFFD0", "#95E1D3"];
    const primaryColor = colors[0];
    const secondaryColor = colors[1];
    const percentageFormatter = (value: number) => {
      return `${value.toFixed(2)}%`;
    };

    const memoryChartData = useMemo(() => {
      return chartData.map((item) => ({
        time: item.time,
        ram: ((item.ram ?? 0) / (node?.mem_total ?? 1)) * 100,
        ram_raw: item.ram,
        swap: ((item.swap ?? 0) / (node?.swap_total ?? 1)) * 100,
        swap_raw: item.swap,
      }));
    }, [chartData, node?.mem_total, node?.swap_total]);

    // 通用自定义 Tooltip 组件
    const CustomTooltip = ({ active, payload, label, chartType }: any) => {
      if (!active || !payload || !payload.length) return null;

      return (
        <div className="bg-background/80 p-3 border rounded-lg shadow-lg max-w-xs">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {lableFormatter(label)}
          </p>
          <div className="space-y-1">
            {payload.map((item: any, index: number) => {
              let value = item.value;
              let displayName = item.name || item.dataKey;

              // 根据图表类型和 dataKey 格式化值和显示名称
              switch (chartType) {
                case "cpu":
                  value = percentageFormatter(value);
                  displayName = "CPU 使用率";
                  break;

                case "memory":
                  if (item.dataKey === "ram") {
                    const rawValue = item.payload?.ram_raw;
                    if (rawValue !== undefined) {
                      value = `${formatBytes(rawValue)} (${value.toFixed(0)}%)`;
                    } else {
                      value = percentageFormatter(value);
                    }
                    displayName = "内存";
                  } else if (item.dataKey === "swap") {
                    const rawValue = item.payload?.swap_raw;
                    if (rawValue !== undefined) {
                      value = `${formatBytes(rawValue)} (${value.toFixed(0)}%)`;
                    } else {
                      value = percentageFormatter(value);
                    }
                    displayName = "交换";
                  }
                  break;

                case "disk":
                  value = formatBytes(value);
                  displayName = "磁盘使用";
                  break;

                case "network":
                  if (item.dataKey === "net_in") {
                    value = `${formatBytes(value)}/s`;
                    displayName = "下载";
                  } else if (item.dataKey === "net_out") {
                    value = `${formatBytes(value)}/s`;
                    displayName = "上传";
                  }
                  break;

                case "connections":
                  if (item.dataKey === "connections") {
                    displayName = "TCP 连接";
                  } else if (item.dataKey === "connections_udp") {
                    displayName = "UDP 连接";
                  }
                  value = value.toString();
                  break;

                case "process":
                  displayName = "进程数";
                  value = value.toString();
                  break;

                default:
                  value = value.toString();
              }

              return (
                <div
                  key={`${item.dataKey}-${index}`}
                  className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {displayName}:
                    </span>
                  </div>
                  <span className="text-sm font-bold ml-2">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* CPU */}
          <Card className={cn}>
            {ChartTitle(
              "CPU",
              live_data?.cpu?.usage ? `${live_data.cpu.usage.toFixed(2)}%` : "-"
            )}
            <ChartContainer
              config={{
                cpu: {
                  label: "CPU",
                  color: primaryColor,
                },
              }}>
              <AreaChart data={chartData} margin={chartMargin}>
                <CartesianGrid
                  strokeDasharray="2 4"
                  vertical={false}
                  stroke="var(--gray-a3)"
                />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={timeFormatter}
                  interval={0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(value, index) =>
                    index !== 0 ? `${value}%` : ""
                  }
                  orientation="left"
                  type="number"
                  tick={{ dx: -10 }}
                  mirror={true}
                />
                <Tooltip
                  cursor={false}
                  content={(props) => (
                    <CustomTooltip {...props} chartType="cpu" />
                  )}
                />
                <Area
                  dataKey="cpu"
                  animationDuration={0}
                  stroke={primaryColor}
                  fill={primaryColor}
                  opacity={0.8}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </Card>

          {/* Ram */}
          <Card className={cn}>
            {ChartTitle(
              "内存",
              <Flex gap="0" direction="column" align="end" className="text-sm">
                <label>
                  {live_data?.ram?.used
                    ? `${formatBytes(live_data.ram.used)} / ${formatBytes(
                        node?.mem_total || 0
                      )}`
                    : "-"}
                </label>
                <label>
                  {live_data?.swap?.used
                    ? `${formatBytes(live_data.swap.used)} / ${formatBytes(
                        node?.swap_total || 0
                      )}`
                    : "-"}
                </label>
              </Flex>
            )}
            <ChartContainer
              config={{
                ram: {
                  label: "Ram",
                  color: primaryColor,
                },
                swap: {
                  label: "Swap",
                  color: secondaryColor,
                },
              }}>
              <AreaChart data={memoryChartData} margin={chartMargin}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={timeFormatter}
                  interval={0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(value, index) =>
                    index !== 0 ? `${value}%` : ""
                  }
                  orientation="left"
                  type="number"
                  tick={{ dx: -10 }}
                  mirror={true}
                />
                <Tooltip
                  cursor={false}
                  content={(props) => (
                    <CustomTooltip {...props} chartType="memory" />
                  )}
                />
                <Area
                  dataKey="ram"
                  animationDuration={0}
                  stroke={primaryColor}
                  fill={primaryColor}
                  opacity={0.8}
                  dot={false}
                />
                <Area
                  dataKey="swap"
                  animationDuration={0}
                  stroke={secondaryColor}
                  fill={secondaryColor}
                  opacity={0.8}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </Card>

          {/* Disk */}
          <Card className={cn}>
            {ChartTitle(
              "磁盘",
              live_data?.disk?.used
                ? `${formatBytes(live_data.disk.used)} / ${formatBytes(
                    node?.disk_total || 0
                  )}`
                : "-"
            )}
            <ChartContainer
              config={{
                disk: {
                  label: "Disk",
                  color: primaryColor,
                },
              }}>
              <AreaChart data={chartData} margin={chartMargin}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={timeFormatter}
                  interval={0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={[0, node?.disk_total || 100]}
                  tickFormatter={(value, index) =>
                    index !== 0 ? `${formatBytes(value)}` : ""
                  }
                  orientation="left"
                  type="number"
                  tick={{ dx: -10 }}
                  mirror={true}
                />
                <Tooltip
                  cursor={false}
                  content={(props) => (
                    <CustomTooltip {...props} chartType="disk" />
                  )}
                />
                <Area
                  dataKey="disk"
                  animationDuration={0}
                  stroke={primaryColor}
                  fill={primaryColor}
                  opacity={0.8}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </Card>

          {/* Network */}
          <Card className={cn}>
            {ChartTitle(
              "网络",
              <Flex gap="0" align="end" direction="column" className="text-sm">
                <span>↑ {formatBytes(live_data?.network.up || 0)}/s</span>
                <span>↓ {formatBytes(live_data?.network.down || 0)}/s</span>
              </Flex>
            )}
            <ChartContainer
              config={{
                net_in: {
                  label: "网络下载",
                  color: primaryColor,
                },
                net_out: {
                  label: "网络上传",
                  color: colors[3],
                },
              }}>
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={timeFormatter}
                  interval={0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value, index) =>
                    index !== 0 ? `${formatBytes(value)}` : ""
                  }
                  orientation="left"
                  type="number"
                  tick={{ dx: -10 }}
                  mirror={true}
                />
                <Tooltip
                  cursor={false}
                  content={(props) => (
                    <CustomTooltip {...props} chartType="network" />
                  )}
                />
                <Line
                  dataKey="net_in"
                  animationDuration={0}
                  stroke={primaryColor}
                  fill={primaryColor}
                  opacity={0.8}
                  dot={false}
                />
                <Line
                  dataKey="net_out"
                  animationDuration={0}
                  stroke={colors[3]}
                  fill={colors[3]}
                  opacity={0.8}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </Card>

          {/* Connections */}
          <Card className={cn}>
            {ChartTitle(
              "连接数",
              <Flex gap="0" align="end" direction="column" className="text-sm">
                <span>TCP: {live_data?.connections.tcp}</span>
                <span>UDP: {live_data?.connections.udp}</span>
              </Flex>
            )}
            <ChartContainer
              config={{
                connections: {
                  label: "TCP",
                  color: primaryColor,
                },
                connections_udp: {
                  label: "UDP",
                  color: colors[3],
                },
              }}>
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={timeFormatter}
                  interval={0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value, index) =>
                    index !== 0 ? `${value}` : ""
                  }
                  orientation="left"
                  type="number"
                  tick={{ dx: -10 }}
                  mirror={true}
                />
                <Tooltip
                  cursor={false}
                  content={(props) => (
                    <CustomTooltip {...props} chartType="connections" />
                  )}
                />
                <Line
                  dataKey="connections"
                  animationDuration={0}
                  stroke={primaryColor}
                  opacity={0.8}
                  dot={false}
                  name="TCP"
                />
                <Line
                  dataKey="connections_udp"
                  animationDuration={0}
                  stroke={secondaryColor}
                  opacity={0.8}
                  dot={false}
                  name="UDP"
                />
              </LineChart>
            </ChartContainer>
          </Card>

          {/* Process */}
          <Card className={cn}>
            {ChartTitle("进程数", live_data?.process || "-")}
            <ChartContainer
              config={{
                process: {
                  label: "进程数",
                  color: primaryColor,
                },
              }}>
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={timeFormatter}
                  interval={0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value, index) =>
                    index !== 0 ? `${value}` : ""
                  }
                  orientation="left"
                  type="number"
                  tick={{ dx: -10 }}
                  mirror={true}
                />
                <Tooltip
                  cursor={false}
                  content={(props) => (
                    <CustomTooltip {...props} chartType="process" />
                  )}
                />
                <Line
                  dataKey="process"
                  animationDuration={0}
                  stroke={primaryColor}
                  opacity={0.8}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </Card>
        </div>
      </div>
    );
  }
);

export default LoadCharts;

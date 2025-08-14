import { memo, useCallback, useState, useEffect, useRef } from "react";
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

const LoadCharts = memo(
  ({ node, hours, data = [], liveData }: LoadChartsProps) => {
    const { getLoadHistory } = useNodeData();
    const [historicalData, setHistoricalData] = useState<RecordFormat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isRealtime = hours === 0;

    // 获取历史数据
    useEffect(() => {
      if (!isRealtime) {
        const fetchHistoricalData = async () => {
          setLoading(true);
          setError(null);
          try {
            const data = await getLoadHistory(node.uuid, hours);
            setHistoricalData(data?.records || []);
          } catch (err: any) {
            setError(err.message || "获取历史数据失败");
          } finally {
            setLoading(false);
          }
        };
        fetchHistoricalData();
      } else {
        setLoading(false);
      }
    }, [node.uuid, hours, getLoadHistory, isRealtime]);

    // 准备图表数据
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

    // 内存图表数据转换
    const memoryChartData = chartData.map((item) => ({
      ...item,
      ram: ((item.ram ?? 0) / (node?.mem_total ?? 1)) * 100,
      ram_raw: item.ram,
      swap: ((item.swap ?? 0) / (node?.swap_total ?? 1)) * 100,
      swap_raw: item.swap,
    }));

    // 格式化函数
    const timeFormatter = useCallback((value: any, index: number) => {
      if (chartDataLengthRef.current === 0) return "";
      if (index === 0 || index === chartDataLengthRef.current - 1) {
        return new Date(value).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return "";
    }, []);

    const labelFormatter = useCallback(
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

    // 样式和颜色
    const cn = "flex flex-col w-full h-full gap-4 justify-between";
    const chartMargin = { top: 10, right: 16, bottom: 10, left: 16 };
    const colors = ["#F38181", "#FCE38A", "#EAFFD0", "#95E1D3"];

    // 图表配置
    const chartConfigs = [
      {
        id: "cpu",
        title: "CPU",
        type: "area",
        value: liveData?.cpu?.usage ? `${liveData.cpu.usage.toFixed(2)}%` : "-",
        dataKey: "cpu",
        yAxisDomain: [0, 100],
        yAxisFormatter: (value: number, index: number) =>
          index !== 0 ? `${value}%` : "",
        color: colors[0],
        data: chartData,
        tooltipFormatter: (value: number) => `${value.toFixed(2)}%`,
        tooltipLabel: "CPU 使用率",
      },
      {
        id: "memory",
        title: "内存",
        type: "area",
        value: (
          <Flex gap="0" direction="column" align="end" className="text-sm">
            <label>
              {liveData?.ram?.used
                ? `${formatBytes(liveData.ram.used)} / ${formatBytes(
                    node?.mem_total || 0
                  )}`
                : "-"}
            </label>
            <label>
              {liveData?.swap?.used
                ? `${formatBytes(liveData.swap.used)} / ${formatBytes(
                    node?.swap_total || 0
                  )}`
                : "-"}
            </label>
          </Flex>
        ),
        series: [
          {
            dataKey: "ram",
            color: colors[0],
            tooltipLabel: "内存",
            tooltipFormatter: (value: number, raw: any) =>
              `${formatBytes(raw?.ram_raw || 0)} (${value.toFixed(0)}%)`,
          },
          {
            dataKey: "swap",
            color: colors[1],
            tooltipLabel: "交换",
            tooltipFormatter: (value: number, raw: any) =>
              `${formatBytes(raw?.swap_raw || 0)} (${value.toFixed(0)}%)`,
          },
        ],
        yAxisDomain: [0, 100],
        yAxisFormatter: (value: number, index: number) =>
          index !== 0 ? `${value}%` : "",
        data: memoryChartData,
      },
      {
        id: "disk",
        title: "磁盘",
        type: "area",
        value: liveData?.disk?.used
          ? `${formatBytes(liveData.disk.used)} / ${formatBytes(
              node?.disk_total || 0
            )}`
          : "-",
        dataKey: "disk",
        yAxisDomain: [0, node?.disk_total || 100],
        yAxisFormatter: (value: number, index: number) =>
          index !== 0 ? formatBytes(value) : "",
        color: colors[0],
        data: chartData,
        tooltipFormatter: (value: number) => formatBytes(value),
        tooltipLabel: "磁盘使用",
      },
      {
        id: "network",
        title: "网络",
        type: "line",
        value: (
          <>
            <Flex gap="0" align="end" direction="column" className="text-sm">
              <span>↑ {formatBytes(liveData?.network.up || 0)}/s</span>
              <span>↓ {formatBytes(liveData?.network.down || 0)}/s</span>
            </Flex>
          </>
        ),
        series: [
          {
            dataKey: "net_in",
            color: colors[0],
            tooltipLabel: "下载",
            tooltipFormatter: (value: number) => `${formatBytes(value)}/s`,
          },
          {
            dataKey: "net_out",
            color: colors[3],
            tooltipLabel: "上传",
            tooltipFormatter: (value: number) => `${formatBytes(value)}/s`,
          },
        ],
        yAxisFormatter: (value: number, index: number) =>
          index !== 0 ? formatBytes(value) : "",
        data: chartData,
      },
      {
        id: "connections",
        title: "连接数",
        type: "line",
        value: (
          <Flex gap="0" align="end" direction="column" className="text-sm">
            <span>TCP: {liveData?.connections.tcp}</span>
            <span>UDP: {liveData?.connections.udp}</span>
          </Flex>
        ),
        series: [
          {
            dataKey: "connections",
            color: colors[0],
            tooltipLabel: "TCP 连接",
          },
          {
            dataKey: "connections_udp",
            color: colors[1],
            tooltipLabel: "UDP 连接",
          },
        ],
        data: chartData,
      },
      {
        id: "process",
        title: "进程数",
        type: "line",
        value: liveData?.process || "-",
        dataKey: "process",
        color: colors[0],
        data: chartData,
        tooltipLabel: "进程数",
      },
    ];

    // 通用提示组件
    const CustomTooltip = ({ active, payload, label, chartConfig }: any) => {
      if (!active || !payload || !payload.length) return null;

      return (
        <div className="bg-background/80 p-3 border rounded-lg shadow-lg max-w-xs">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {labelFormatter(label)}
          </p>
          <div className="space-y-1">
            {payload.map((item: any, index: number) => {
              const series = chartConfig.series
                ? chartConfig.series.find(
                    (s: any) => s.dataKey === item.dataKey
                  )
                : {
                    dataKey: chartConfig.dataKey,
                    tooltipLabel: chartConfig.tooltipLabel,
                    tooltipFormatter: chartConfig.tooltipFormatter,
                  };

              let value = item.value;
              if (series?.tooltipFormatter) {
                value = series.tooltipFormatter(value, item.payload);
              } else {
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
                      {series?.tooltipLabel || item.dataKey}:
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

    // 根据配置渲染图表
    const renderChart = (config: any) => {
      const ChartComponent = config.type === "area" ? AreaChart : LineChart;
      const DataComponent =
        config.type === "area" ? Area : (Line as React.ComponentType<any>);

      const chartConfig = config.series
        ? config.series.reduce((acc: any, series: any) => {
            acc[series.dataKey] = {
              label: series.tooltipLabel || series.dataKey,
              color: series.color,
            };
            return acc;
          }, {})
        : {
            [config.dataKey]: {
              label: config.tooltipLabel || config.dataKey,
              color: config.color,
            },
          };

      return (
        <Card className={cn} key={config.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {config.title}
            </CardTitle>
            <span className="text-sm font-bold">{config.value}</span>
          </CardHeader>
          <ChartContainer config={chartConfig}>
            <ChartComponent data={config.data} margin={chartMargin}>
              <CartesianGrid strokeDasharray="2 4" vertical={false} />
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
                domain={config.yAxisDomain}
                tickFormatter={config.yAxisFormatter}
                orientation="left"
                type="number"
                tick={{ dx: -10 }}
                mirror={true}
              />
              <Tooltip
                cursor={false}
                content={(props: any) => (
                  <CustomTooltip {...props} chartConfig={config} />
                )}
              />
              {config.series ? (
                config.series.map((series: any) => (
                  <DataComponent
                    key={series.dataKey}
                    dataKey={series.dataKey}
                    animationDuration={0}
                    stroke={series.color}
                    fill={config.type === "area" ? series.color : undefined}
                    opacity={0.8}
                    dot={false}
                  />
                ))
              ) : (
                <DataComponent
                  dataKey={config.dataKey}
                  animationDuration={0}
                  stroke={config.color}
                  fill={config.type === "area" ? config.color : undefined}
                  opacity={0.8}
                  dot={false}
                />
              )}
            </ChartComponent>
          </ChartContainer>
        </Card>
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
          {chartConfigs.map(renderChart)}
        </div>
      </div>
    );
  }
);

export default LoadCharts;

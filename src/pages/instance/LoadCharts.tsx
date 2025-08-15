import { memo, useCallback, useRef } from "react";
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
import { Flex } from "@radix-ui/themes";
import Loading from "@/components/loading";
import { useLoadCharts } from "@/hooks/useLoadCharts";

interface LoadChartsProps {
  node: NodeData;
  hours: number;
  liveData?: NodeStats;
}

const LoadCharts = memo(({ node, hours, liveData }: LoadChartsProps) => {
  const { loading, error, chartData, memoryChartData } = useLoadCharts(
    node,
    hours
  );

  const chartDataLengthRef = useRef(0);
  chartDataLengthRef.current = chartData.length;

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
  const cn = "flex flex-col w-full overflow-hidden";
  const chartMargin = { top: 8, right: 16, bottom: 8, left: 16 };
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
              ? chartConfig.series.find((s: any) => s.dataKey === item.dataKey)
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

    // 只指定高度，让宽度自适应
    const chartProps = {
      height: 140, // 更小的高度以确保完全适应容器
      style: { overflow: "visible" }, // 通过内联样式解决Safari溢出问题
    };

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
      <Card className={cn} key={config.id} style={{ height: "220px" }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 h-[80px]">
          <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
          <div className="text-sm font-bold min-h-[20px] flex items-center">
            {config.value}
          </div>
        </CardHeader>
        <div
          className="h-[150px] w-full px-2 pb-2 align-bottom"
          style={{ minHeight: 0 }}>
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ChartComponent
              data={config.data}
              margin={chartMargin}
              {...chartProps}>
              <CartesianGrid strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={timeFormatter}
                interval={0}
                height={20}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={config.yAxisDomain}
                tickFormatter={config.yAxisFormatter}
                orientation="left"
                type="number"
                tick={{ fontSize: 10, dx: -8 }}
                width={25}
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
        </div>
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
      <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        style={{ minHeight: 0, overflow: "hidden" }}>
        {chartConfigs.map(renderChart)}
      </div>
    </div>
  );
});

export default LoadCharts;

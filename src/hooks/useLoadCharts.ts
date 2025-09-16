import { useState, useEffect, useMemo } from "react";
import { useNodeData } from "@/contexts/NodeDataContext";
import type { HistoryRecord, NodeData, NodeStats } from "@/types/node";
import { useLiveData } from "@/contexts/LiveDataContext";
import fillMissingTimePoints from "@/utils/RecordHelper";

export const useLoadCharts = (node: NodeData | null, hours: number) => {
  const { getLoadHistory, getRecentLoadHistory } = useNodeData();
  const { liveData } = useLiveData();
  const [historicalData, setHistoricalData] = useState<HistoryRecord[]>([]);
  const [realtimeData, setRealtimeData] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataEmpty, setIsDataEmpty] = useState(false);

  const isRealtime = hours === 0;

  // Fetch historical data
  useEffect(() => {
    if (isRealtime || !node?.uuid) return;

    const fetchHistoricalData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getLoadHistory(node.uuid, hours);
        const records = data?.records || [];
        setHistoricalData(records);
        setIsDataEmpty(records.length === 0);
        console.log(isDataEmpty);

        setRealtimeData([]); // Clear realtime data
      } catch (err: any) {
        setError(err.message || "Failed to fetch historical data");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [node?.uuid, hours, getLoadHistory, isRealtime, isDataEmpty]);

  // Fetch initial real-time data and handle WebSocket updates
  useEffect(() => {
    if (!isRealtime || !node?.uuid) return;

    const fetchInitialRealtimeData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecentLoadHistory(node.uuid);
        setRealtimeData(data?.records || []);
        setHistoricalData([]); // Clear historical data
      } catch (err: any) {
        setError(err.message || "Failed to fetch initial real-time data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialRealtimeData();
  }, [node?.uuid, getRecentLoadHistory, isRealtime]);

  // Separate effect for WebSocket updates
  useEffect(() => {
    if (!isRealtime || !node?.uuid || !liveData?.data[node.uuid]) return;

    const stats: NodeStats = liveData.data[node.uuid];
    const newRecord: HistoryRecord = {
      client: node.uuid,
      time: new Date(stats.updated_at).toISOString(),
      cpu: stats.cpu.usage,
      ram: stats.ram.used,
      disk: stats.disk.used,
      load: stats.load.load1,
      net_in: stats.network.down,
      net_out: stats.network.up,
      process: stats.process,
      connections: stats.connections.tcp,
      gpu: 0,
      ram_total: stats.ram.total,
      swap: stats.swap.used,
      swap_total: stats.swap.total,
      temp: 0,
      disk_total: stats.disk.total,
      net_total_up: stats.network.totalUp,
      net_total_down: stats.network.totalDown,
      connections_udp: stats.connections.udp,
    };

    setRealtimeData((prevHistory) => {
      if (
        prevHistory.length > 0 &&
        new Date(prevHistory[prevHistory.length - 1].time).getTime() ===
          new Date(newRecord.time).getTime()
      ) {
        return prevHistory;
      }
      const updatedHistory = [...prevHistory, newRecord];
      return updatedHistory.length > 600
        ? updatedHistory.slice(updatedHistory.length - 600)
        : updatedHistory;
    });
  }, [liveData, node?.uuid, isRealtime]);

  const chartData = useMemo(() => {
    const rawData = isRealtime ? realtimeData : historicalData;
    const mappedData = rawData.map((record) => ({
      ...record,
      time: new Date(record.time).getTime(),
    }));

    if (isRealtime) {
      return mappedData;
    }

    const minute = 60;
    const hour = minute * 60;

    const stringifiedData = mappedData.map((d) => ({
      ...d,
      time: new Date(d.time).toISOString(),
    }));

    // 确定与当前采样方案匹配的间隔，以便进行时间差比较
    const intervalSeconds =
      hours === 1
        ? minute
        : hours === 4
        ? minute
        : hours > 120
        ? hour
        : minute * 15;

    // 如果最后一个数据点的时间与当前时间相差超过一个间隔，则在末尾添加一个当前时间的空点
    const now = new Date();
    if (stringifiedData.length > 0) {
      const lastDataTime = new Date(
        stringifiedData[stringifiedData.length - 1].time
      ).getTime();
      if (now.getTime() - lastDataTime > intervalSeconds * 1000) {
        stringifiedData.push({ time: now.toISOString() } as HistoryRecord);
      }
    }

    let filledData;
    if (hours === 1) {
      filledData = fillMissingTimePoints(
        stringifiedData,
        minute,
        hour,
        minute * 2
      );
    } else if (hours === 4) {
      filledData = fillMissingTimePoints(
        stringifiedData,
        minute,
        hour * 4,
        minute * 2
      );
    } else {
      const interval = hours > 120 ? hour : minute * 15;
      const maxGap = interval * 2;
      filledData = fillMissingTimePoints(
        stringifiedData,
        interval,
        hour * hours,
        maxGap
      );
    }
    return filledData.map((d) => ({ ...d, time: new Date(d.time!).getTime() }));
  }, [isRealtime, realtimeData, historicalData, hours]);

  const memoryChartData = useMemo(() => {
    return chartData.map((item) => ({
      ...item,
      ram: ((item.ram ?? 0) / (node?.mem_total ?? 1)) * 100,
      ram_raw: item.ram,
      swap: ((item.swap ?? 0) / (node?.swap_total ?? 1)) * 100,
      swap_raw: item.swap,
    }));
  }, [chartData, node?.mem_total, node?.swap_total]);

  return {
    loading,
    error,
    chartData,
    memoryChartData,
    isDataEmpty,
  };
};

import { useState, useEffect, useMemo } from "react";
import { useNodeData } from "@/contexts/NodeDataContext";
import type { HistoryRecord, NodeData, NodeStats } from "@/types/node";
import { useLiveData } from "@/contexts/LiveDataContext";

export const useLoadCharts = (node: NodeData | null, hours: number) => {
  const { getLoadHistory, getRecentLoadHistory } = useNodeData();
  const { liveData } = useLiveData();
  const [historicalData, setHistoricalData] = useState<HistoryRecord[]>([]);
  const [realtimeData, setRealtimeData] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isRealtime = hours === 0;

  // Fetch historical data
  useEffect(() => {
    if (isRealtime || !node?.uuid) return;

    const fetchHistoricalData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getLoadHistory(node.uuid, hours);
        setHistoricalData(data?.records || []);
        setRealtimeData([]); // Clear realtime data
      } catch (err: any) {
        setError(err.message || "Failed to fetch historical data");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [node?.uuid, hours, getLoadHistory, isRealtime]);

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

  const historicalChartData = useMemo(() => {
    return historicalData.map((record) => ({
      time: new Date(record.time).getTime(),
      cpu: record.cpu,
      ram: record.ram,
      disk: record.disk,
      load: record.load,
      net_out: record.net_out,
      net_in: record.net_in,
      connections: record.connections,
      process: record.process,
      swap: record.swap,
      connections_udp: record.connections_udp,
    }));
  }, [historicalData]);

  const realtimeChartData = useMemo(() => {
    return realtimeData.map((record) => ({
      time: new Date(record.time).getTime(),
      cpu: record.cpu,
      ram: record.ram,
      disk: record.disk,
      load: record.load,
      net_out: record.net_out,
      net_in: record.net_in,
      connections: record.connections,
      process: record.process,
      swap: record.swap,
      connections_udp: record.connections_udp,
    }));
  }, [realtimeData]);

  const chartData = isRealtime ? realtimeChartData : historicalChartData;

  return {
    loading,
    error,
    chartData,
  };
};

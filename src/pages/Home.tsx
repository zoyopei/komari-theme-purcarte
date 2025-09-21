import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StatsBar } from "@/components/sections/StatsBar";
import { NodeCard } from "@/components/sections/NodeCard";
import { NodeListHeader } from "@/components/sections/NodeListHeader";
import { NodeListItem } from "@/components/sections/NodeListItem";
import Loading from "@/components/loading";
import type { NodeWithStatus } from "@/types/node";
import { useNodeData } from "@/contexts/NodeDataContext";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useAppConfig } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { StatsBarProps } from "@/components/sections/StatsBar";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCompactLayout } from "@/hooks/useCompactLayout";

interface HomePageProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setStatsBarProps: (props: StatsBarProps | null) => void;
}
const homeStateCache = {
  selectedGroup: "所有",
  hasLoaded: false,
};

const HomePage: React.FC<HomePageProps> = ({
  searchTerm,
  setSearchTerm,
  setStatsBarProps,
}) => {
  const { viewMode, statusCardsVisibility, setStatusCardsVisibility } =
    useTheme();
  const {
    nodes: staticNodes,
    loading,
    getGroups,
    error,
    refreshNodes,
  } = useNodeData();
  const { liveData } = useLiveData();
  const [selectedGroup, setSelectedGroup] = useState(
    homeStateCache.selectedGroup
  );
  const [isLoaded, setIsLoaded] = useState(homeStateCache.hasLoaded);
  const {
    enableGroupedBar,
    enableStatsBar,
    enableSwap,
    enableListItemProgressBar,
    selectTrafficProgressStyle,
    enableCompactMode,
    mergeGroupsWithStats,
  } = useAppConfig();
  const combinedNodes = useMemo<NodeWithStatus[]>(() => {
    if (!staticNodes) return [];
    return staticNodes.map((node) => {
      const isOnline = liveData?.online.includes(node.uuid) ?? false;
      const stats = isOnline ? liveData?.data[node.uuid] : undefined;

      return {
        ...node,
        status: isOnline ? "online" : "offline",
        stats: stats,
      };
    });
  }, [staticNodes, liveData]);

  const groups = useMemo(() => ["所有", ...getGroups()], [getGroups]);

  const { layoutIsMobile } = useCompactLayout(enableCompactMode);

  const filteredNodes = useMemo(() => {
    return combinedNodes
      .filter(
        (node: NodeWithStatus) =>
          selectedGroup === "所有" || node.group === selectedGroup
      )
      .filter((node: NodeWithStatus) =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [combinedNodes, selectedGroup, searchTerm]);

  const hasSearchTerm = searchTerm.trim().length > 0;

  const stats = useMemo(() => {
    return {
      onlineCount: filteredNodes.filter((n) => n.status === "online").length,
      totalCount: filteredNodes.length,
      uniqueRegions: new Set(filteredNodes.map((n) => n.region)).size,
      totalTrafficUp: filteredNodes.reduce(
        (acc, node) => acc + (node.stats?.network.totalUp || 0),
        0
      ),
      totalTrafficDown: filteredNodes.reduce(
        (acc, node) => acc + (node.stats?.network.totalDown || 0),
        0
      ),
      currentSpeedUp: filteredNodes.reduce(
        (acc, node) => acc + (node.stats?.network.up || 0),
        0
      ),
      currentSpeedDown: filteredNodes.reduce(
        (acc, node) => acc + (node.stats?.network.down || 0),
        0
      ),
    };
  }, [filteredNodes]);

  useEffect(() => {
    if (loading) return;

    if (homeStateCache.hasLoaded) {
      setIsLoaded(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoaded(true);
      homeStateCache.hasLoaded = true;
    }, 300); // 动画过渡

    return () => {
      clearTimeout(timer);
    };
  }, [loading]);

  useEffect(() => {
    if (!loading && !homeStateCache.hasLoaded) {
      homeStateCache.hasLoaded = true;
    }
  }, [loading]);

  useEffect(() => {
    homeStateCache.selectedGroup = selectedGroup;
  }, [selectedGroup]);

  useEffect(() => {
    setStatsBarProps({
      displayOptions: statusCardsVisibility,
      setDisplayOptions: setStatusCardsVisibility,
      stats,
      loading,
      enableGroupedBar,
      groups,
      selectedGroup,
      onSelectGroup: setSelectedGroup,
    });
  }, [
    statusCardsVisibility,
    setStatusCardsVisibility,
    stats,
    loading,
    enableGroupedBar,
    groups,
    selectedGroup,
    setSelectedGroup,
    setStatsBarProps,
  ]);

  if (!isLoaded) {
    return (
      <Loading
        text="正在努力获取数据中..."
        className={!loading ? "fade-out" : ""}
      />
    );
  }

  return (
    <div className="fade-in">
      {enableStatsBar && (!enableCompactMode || layoutIsMobile) && (
        <StatsBar
          displayOptions={statusCardsVisibility}
          setDisplayOptions={setStatusCardsVisibility}
          stats={stats}
          loading={loading}
          enableCompactMode={enableCompactMode}
          enableGroupedBar={enableGroupedBar}
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
        />
      )}

      {enableGroupedBar && !mergeGroupsWithStats && (
        <div className="flex purcarte-blur theme-card-style overflow-auto whitespace-nowrap overflow-x-auto items-center min-w-[300px] text-secondary-foreground space-x-4 px-4 my-4">
          <span>分组</span>
          {groups?.map((group: string) => (
            <Button
              key={group}
              variant={selectedGroup === group ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedGroup?.(group)}>
              {group}
            </Button>
          ))}
        </div>
      )}

      <div className="space-y-4 my-4">
        {filteredNodes.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
              {filteredNodes.map((node: NodeWithStatus) => (
                <NodeCard
                  key={node.uuid}
                  node={node}
                  enableSwap={enableSwap}
                  selectTrafficProgressStyle={selectTrafficProgressStyle}
                />
              ))}
            </div>
          ) : (
            <ScrollArea
              className="purcarte-blur theme-card-style w-full"
              viewportProps={{ className: "p-2" }}
              showHorizontalScrollbar>
              <div className="space-y-2 min-w-[1080px]">
                {viewMode === "table" && (
                  <NodeListHeader enableSwap={enableSwap} />
                )}
                {filteredNodes.map((node: NodeWithStatus) => (
                  <NodeListItem
                    key={node.uuid}
                    node={node}
                    enableSwap={enableSwap}
                    enableListItemProgressBar={enableListItemProgressBar}
                    selectTrafficProgressStyle={selectTrafficProgressStyle}
                  />
                ))}
              </div>
            </ScrollArea>
          )
        ) : (
          <div className="flex flex-grow items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {hasSearchTerm
                    ? "Not Found"
                    : error
                    ? "获取节点数据失败"
                    : "暂无节点数据"}
                </CardTitle>
                <CardDescription>
                  {hasSearchTerm
                    ? "请尝试更改筛选条件"
                    : error
                    ? "获取节点数据失败，请重试"
                    : "请先通过管理端添加节点"}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                {hasSearchTerm ? (
                  <Button onClick={() => setSearchTerm("")} className="w-full">
                    清空搜索
                  </Button>
                ) : error ? (
                  <Button
                    onClick={() => void refreshNodes()}
                    className="w-full">
                    重试
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      window.open("/admin", "_blank", "noopener,noreferrer")
                    }
                    className="w-full">
                    添加节点
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

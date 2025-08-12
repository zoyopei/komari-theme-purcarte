import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { wsService } from "../services/api";
import type { NodeStats } from "../types/node";

interface LiveData {
  online: string[];
  data: { [uuid: string]: NodeStats };
}

interface LiveDataContextType {
  liveData: LiveData | null;
}

const LiveDataContext = createContext<LiveDataContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useLiveData = () => {
  const context = useContext(LiveDataContext);
  if (!context) {
    throw new Error("useLiveData must be used within a LiveDataProvider");
  }
  return context;
};

interface LiveDataProviderProps {
  children: ReactNode;
  enableWebSocket?: boolean;
}

export const LiveDataProvider = ({
  children,
  enableWebSocket = true,
}: LiveDataProviderProps) => {
  const [liveData, setLiveData] = useState<LiveData | null>(null);

  useEffect(() => {
    if (!enableWebSocket) {
      wsService.disconnect();
      setLiveData(null);
      return;
    }

    const handleWebSocketData = (data: LiveData) => {
      if (data.online && data.data) {
        setLiveData({
          online: [...data.online],
          data: { ...data.data },
        });
      }
    };

    const unsubscribe = wsService.subscribe(handleWebSocketData);
    wsService.connect();

    return () => {
      unsubscribe();
    };
  }, [enableWebSocket]);

  return (
    <LiveDataContext.Provider value={{ liveData }}>
      {children}
    </LiveDataContext.Provider>
  );
};

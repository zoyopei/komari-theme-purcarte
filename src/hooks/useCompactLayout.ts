import { useEffect, useMemo, useState } from "react";
import { useIsMobile } from "./useMobile";

export const COMPACT_MODE_BREAKPOINT = 992;

export const useCompactLayout = (enableCompactMode?: boolean) => {
  const isMobile = useIsMobile();
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  useEffect(() => {
    if (!enableCompactMode) {
      setIsCompactViewport(false);
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const updateViewportState = () => {
      setIsCompactViewport(window.innerWidth < COMPACT_MODE_BREAKPOINT);
    };

    updateViewportState();
    window.addEventListener("resize", updateViewportState);

    return () => {
      window.removeEventListener("resize", updateViewportState);
    };
  }, [enableCompactMode]);

  const layoutIsMobile = useMemo(() => {
    if (!enableCompactMode) {
      return isMobile;
    }

    return isMobile || isCompactViewport;
  }, [enableCompactMode, isMobile, isCompactViewport]);

  return {
    isMobile,
    layoutIsMobile,
    isCompactViewport,
  };
};

import { StrictMode, useEffect, useRef, useState, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./index.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/sections/Header";
import { ConfigProvider } from "@/config";
import { useThemeManager, useTheme } from "@/hooks/useTheme";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NodeDataProvider } from "@/contexts/NodeDataContext";
import { LiveDataProvider } from "@/contexts/LiveDataContext";
import { useNodeData } from "@/contexts/NodeDataContext";
import Footer from "@/components/sections/Footer";
import Loading from "./components/loading";

const HomePage = lazy(() => import("@/pages/Home"));
const InstancePage = lazy(() => import("@/pages/instance"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));
const PrivatePage = lazy(() => import("@/pages/Private"));

import { useConfigItem } from "@/config";

const homeScrollState = {
  position: 0,
};

// 内部应用组件，在 ConfigProvider 内部使用配置
export const AppContent = () => {
  const { nodes } = useNodeData();
  const { appearance, color } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const enableVideoBackground = useConfigItem("enableVideoBackground");
  const videoBackgroundUrl = useConfigItem("videoBackgroundUrl");
  const location = useLocation();
  const homeViewportRef = useRef<HTMLDivElement | null>(null);
  const instanceViewportRef = useRef<HTMLDivElement | null>(null);

  const handleHomeScroll = () => {
    const viewport = homeViewportRef.current;
    if (!viewport) return;
    homeScrollState.position = viewport.scrollTop;
  };

  useEffect(() => {
    if (location.pathname !== "/") return;
    const viewport = homeViewportRef.current;
    if (viewport) {
      viewport.scrollTop = homeScrollState.position;
      return;
    }

    const frame = requestAnimationFrame(() => {
      const nextViewport = homeViewportRef.current;
      if (nextViewport) {
        nextViewport.scrollTop = homeScrollState.position;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  useEffect(() => {
    if (!location.pathname.startsWith("/instance")) return;

    const frame = requestAnimationFrame(() => {
      instanceViewportRef.current?.scrollTo({ top: 0 });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <>
      {enableVideoBackground && videoBackgroundUrl && (
        <video
          src={videoBackgroundUrl as string}
          autoPlay
          loop
          muted
          playsInline
          className="fixed right-0 bottom-0 min-w-full min-h-full w-auto h-auto -z-1 object-cover"></video>
      )}
      <Theme
        appearance={appearance}
        accentColor={color}
        scaling="110%"
        style={{ backgroundColor: "transparent" }}>
        <div className="flex flex-col text-sm h-dvh">
          <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <div className="flex-1 min-h-0">
            <Suspense fallback={<Loading />}>
              {nodes === "private" ? (
                <PrivatePage />
              ) : (
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ScrollArea
                        className="h-full"
                        viewportRef={homeViewportRef}
                        viewportProps={{ onScroll: handleHomeScroll }}>
                        <main className="w-[90dvw] max-w-screen-2xl h-full mx-auto flex-1">
                          <HomePage
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                          />
                        </main>
                      </ScrollArea>
                    }
                  />
                  <Route
                    path="/instance/:uuid"
                    element={
                      <ScrollArea
                        className="h-full"
                        viewportRef={instanceViewportRef}>
                        <main className="w-[90%] max-w-screen-2xl h-full mx-auto flex-1">
                          <InstancePage />
                        </main>
                      </ScrollArea>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <ScrollArea className="h-full">
                        <main className="w-[90%] max-w-screen-2xl h-full mx-auto flex-1">
                          <NotFoundPage />
                        </main>
                      </ScrollArea>
                    }
                  />
                </Routes>
              )}
            </Suspense>
          </div>
          <Footer />
        </div>
      </Theme>
    </>
  );
};

const App = () => {
  const themeManager = useThemeManager();
  return (
    <ThemeProvider value={themeManager}>
      <AppContent />
    </ThemeProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider>
      <NodeDataProvider>
        <LiveDataProvider>
          <Router>
            <App />
          </Router>
        </LiveDataProvider>
      </NodeDataProvider>
    </ConfigProvider>
  </StrictMode>
);

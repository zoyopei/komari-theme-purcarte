import { StrictMode, useState, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
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

import { useConfigItem } from "@/config";

// 内部应用组件，在 ConfigProvider 内部使用配置
export const AppContent = () => {
  const { appearance, color } = useTheme();
  const defaultView = useConfigItem("selectedDefaultView");
  const enableLocalStorage = useConfigItem("enableLocalStorage");

  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    if (enableLocalStorage) {
      const savedMode = localStorage.getItem("nodeViewMode");
      const cleanedMode = savedMode ? savedMode.replace(/^"|"$/g, "") : null;
      if (cleanedMode === "grid" || cleanedMode === "table") {
        return cleanedMode;
      }
    }
    return defaultView || "grid";
  });
  const [searchTerm, setSearchTerm] = useState("");
  const enableVideoBackground = useConfigItem("enableVideoBackground");
  const videoBackgroundUrl = useConfigItem("videoBackgroundUrl");

  useEffect(() => {
    if (enableLocalStorage) {
      localStorage.setItem("nodeViewMode", viewMode);
    }
  }, [enableLocalStorage, viewMode]);

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
        <div className="min-h-screen flex flex-col text-sm">
          <Header
            viewMode={viewMode}
            setViewMode={setViewMode}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    viewMode={viewMode}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                }
              />
              <Route path="/instance/:uuid" element={<InstancePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <Footer />
        </div>
      </Theme>
    </>
  );
};

const ThemedApp = () => {
  const themeManager = useThemeManager();
  return (
    <ThemeProvider value={themeManager}>
      <AppContent />
    </ThemeProvider>
  );
};

const App = () => {
  const { publicSettings, loading } = useNodeData();

  if (loading) {
    return <Loading />;
  }

  return (
    <ConfigProvider publicSettings={publicSettings}>
      <ThemedApp />
    </ConfigProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NodeDataProvider>
      <LiveDataProvider>
        <Router>
          <App />
        </Router>
      </LiveDataProvider>
    </NodeDataProvider>
  </StrictMode>
);

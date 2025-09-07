import { StrictMode, useState, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { Header } from "@/components/sections/Header";
import { ConfigProvider } from "@/config";
import { useTheme } from "@/hooks/useTheme";
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
  const { appearance, setAppearance, color } = useTheme();
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

  useEffect(() => {
    if (enableLocalStorage) {
      localStorage.setItem("nodeViewMode", viewMode);
    }
  }, [enableLocalStorage, viewMode]);

  return (
    <Theme
      appearance={appearance === "system" ? "inherit" : appearance}
      accentColor={color}
      scaling="110%"
      style={{ backgroundColor: "transparent" }}>
      <div className="min-h-screen flex flex-col text-sm">
        <Header
          viewMode={viewMode}
          setViewMode={setViewMode}
          appearance={appearance}
          setAppearance={setAppearance}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route
              path="/"
              element={<HomePage viewMode={viewMode} searchTerm={searchTerm} />}
            />
            <Route path="/instance/:uuid" element={<InstancePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </Theme>
  );
};

const App = () => {
  const { publicSettings, loading } = useNodeData();

  if (loading) {
    return <Loading />;
  }

  return (
    <ConfigProvider publicSettings={publicSettings}>
      <AppContent />
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

import { StrictMode, useState, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { Header } from "@/components/sections/Header";
import Background from "@/components/sections/Background";
import { useTheme } from "@/hooks/useTheme";
import { NodeDataProvider } from "@/contexts/NodeDataContext";
import { LiveDataProvider } from "@/contexts/LiveDataContext";
import { useNodeData } from "@/contexts/NodeDataContext";
import Footer from "@/components/sections/Footer";
import Loading from "./components/loading";

const HomePage = lazy(() => import("@/pages/Home"));
const InstancePage = lazy(() => import("@/pages/instance"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));

// eslint-disable-next-line react-refresh/only-export-components
const App = () => {
  const { theme, toggleTheme } = useTheme();
  const { publicSettings } = useNodeData();
  const [viewMode, setViewMode] = useState<"card" | "list">(() => {
    const savedMode = localStorage.getItem("nodeViewMode");
    if (savedMode === "table") {
      return "list";
    }
    return "card";
  });
  const [searchTerm, setSearchTerm] = useState("");

  const sitename = publicSettings ? publicSettings.sitename : "Komari";

  useEffect(() => {
    document.title = sitename;
  }, [sitename]);

  useEffect(() => {
    const modeToStore = viewMode === "card" ? "grid" : "table";
    localStorage.setItem("nodeViewMode", modeToStore);
  }, [viewMode]);

  return (
    <Theme
      appearance="inherit"
      scaling="110%"
      style={{ backgroundColor: "transparent" }}>
      {/* 使用背景组件 */}
      {publicSettings && <Background publicSettings={publicSettings} />}
      <div className="min-h-screen flex flex-col text-sm">
        <Header
          viewMode={viewMode}
          setViewMode={setViewMode}
          theme={theme}
          toggleTheme={toggleTheme}
          sitename={sitename}
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

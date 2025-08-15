import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Grid3X3,
  Table2,
  Moon,
  Sun,
  CircleUserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/useMobile";
import { useConfigItem } from "@/config";

interface HeaderProps {
  viewMode: "grid" | "table";
  setViewMode: (mode: "grid" | "table") => void;
  theme: string;
  toggleTheme: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const Header = ({
  viewMode,
  setViewMode,
  theme,
  toggleTheme,
  searchTerm,
  setSearchTerm,
}: HeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const isInstancePage = location.pathname.startsWith("/instance");
  const isMobile = useIsMobile();
  const enableTitle = useConfigItem("enableTitle");
  const sitename = useConfigItem("titleText");
  const enableLogo = useConfigItem("enableLogo");
  const logoUrl = useConfigItem("logoUrl");
  const enableSearchButton = useConfigItem("enableSearchButton");
  const enableAdminButton = useConfigItem("enableAdminButton");

  useEffect(() => {
    if (sitename) {
      document.title = sitename;
    }
  }, [sitename]);

  return (
    <header className="bg-background/60 backdrop-blur-[10px] border-b border-border/60 sticky top-0 flex items-center justify-center shadow-sm z-10">
      <div className="w-[90%] max-w-screen-2xl px-4 py-2 flex items-center justify-between">
        <div className="flex items-center text-shadow-lg text-accent-foreground">
          <a href="/" className="flex items-center gap-2 text-2xl font-bold">
            {enableLogo && logoUrl && (
              <img src={logoUrl} alt="logo" className="h-8" />
            )}
            {enableTitle && (
              <span className="hidden md:inline">{sitename}</span>
            )}
          </a>
        </div>
        <div className="flex items-center space-x-2">
          {!isInstancePage && (
            <>
              {isMobile ? (
                <>
                  {isSearchOpen && (
                    <div className="absolute top-full left-0 w-full bg-background/80 backdrop-blur-md p-2 border-b border-border/60 shadow-sm z-10 transition-all duration-300 ease-in-out">
                      <Input
                        type="search"
                        placeholder="搜索服务器..."
                        className="w-full"
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSearchTerm(e.target.value)
                        }
                      />
                    </div>
                  )}
                </>
              ) : (
                <div
                  className={`flex items-center transition-all duration-300 ease-in-out overflow-hidden ${
                    isSearchOpen ? "w-48" : "w-0"
                  }`}>
                  <Input
                    type="search"
                    placeholder="搜索服务器..."
                    className={`transition-all duration-300 ease-in-out ${
                      isSearchOpen ? "opacity-100" : "opacity-0"
                    } ${!isSearchOpen && "invisible"}`}
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                  />
                </div>
              )}
              {enableSearchButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}>
                  <Search className="size-5 text-primary" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "table" : "grid")
                }>
                {viewMode === "grid" ? (
                  <Table2 className="size-5 text-primary" />
                ) : (
                  <Grid3X3 className="size-5 text-primary" />
                )}
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="size-5 text-primary" />
            ) : (
              <Moon className="size-5 text-primary" />
            )}
          </Button>
          {enableAdminButton && (
            <a href="/admin" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon">
                <CircleUserIcon className="size-5 text-primary" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

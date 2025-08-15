import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Grid3X3,
  Table2,
  Moon,
  Sun,
  CircleUserIcon,
  Menu,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/useMobile";
import { useConfigItem } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
            {enableTitle && <span>{sitename}</span>}
          </a>
        </div>
        <div className="flex items-center space-x-2">
          {!isInstancePage && (
            <>
              {isMobile ? (
                <>
                  <div
                    className={`absolute top-full left-0 w-full bg-background/60 backdrop-blur-[10px] p-2 border-b border-border/60 shadow-sm z-10 transform transition-all duration-300 ease-in-out ${
                      isSearchOpen
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-4 pointer-events-none"
                    }`}>
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
                  {enableSearchButton && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSearchOpen(!isSearchOpen)}>
                      <Search className="size-5 text-primary" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative group">
                        <Menu className="size-5 text-primary transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        <span className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 rounded-full bg-primary transform -translate-x-1/2 scale-0 transition-transform duration-300 group-data-[state=open]:scale-100"></span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="animate-in slide-in-from-top-5 duration-300 bg-background/60 backdrop-blur-[10px] border-border/60 rounded-xl">
                      <DropdownMenuItem
                        onClick={() =>
                          setViewMode(viewMode === "grid" ? "table" : "grid")
                        }>
                        {viewMode === "grid" ? (
                          <Table2 className="size-4 mr-2 text-primary" />
                        ) : (
                          <Grid3X3 className="size-4 mr-2 text-primary" />
                        )}
                        <span>
                          {viewMode === "grid" ? "表格视图" : "网格视图"}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={toggleTheme}>
                        {theme === "dark" ? (
                          <Sun className="size-4 mr-2 text-primary" />
                        ) : (
                          <Moon className="size-4 mr-2 text-primary" />
                        )}
                        <span>
                          {theme === "dark" ? "浅色模式" : "深色模式"}
                        </span>
                      </DropdownMenuItem>
                      {enableAdminButton && (
                        <DropdownMenuItem asChild>
                          <a
                            href="/admin"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center">
                            <CircleUserIcon className="size-4 mr-2 text-primary" />
                            <span>管理员</span>
                          </a>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <div
                    className={`flex items-center transition-all duration-300 ease-in-out overflow-hidden transform ${
                      isSearchOpen ? "w-48 opacity-100" : "w-0 opacity-0"
                    }`}>
                    <Input
                      type="search"
                      placeholder="搜索服务器..."
                      className={`transition-all duration-300 ease-in-out ${
                        !isSearchOpen && "invisible"
                      }`}
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchTerm(e.target.value)
                      }
                    />
                  </div>
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
                </>
              )}
            </>
          )}
          {isInstancePage && (
            <>
              {isMobile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative group">
                      <Menu className="size-5 text-primary transition-transform duration-300 group-data-[state=open]:rotate-180" />
                      <span className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 rounded-full bg-primary transform -translate-x-1/2 scale-0 transition-transform duration-300 group-data-[state=open]:scale-100"></span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="animate-in slide-in-from-top-5 duration-300 bg-background/60 backdrop-blur-[10px] border-border/60 rounded-xl">
                    <DropdownMenuItem onClick={toggleTheme}>
                      {theme === "dark" ? (
                        <Sun className="size-4 mr-2 text-primary" />
                      ) : (
                        <Moon className="size-4 mr-2 text-primary" />
                      )}
                      <span>{theme === "dark" ? "浅色模式" : "深色模式"}</span>
                    </DropdownMenuItem>
                    {enableAdminButton && (
                      <DropdownMenuItem asChild>
                        <a
                          href="/admin"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center">
                          <CircleUserIcon className="size-4 mr-2 text-primary" />
                          <span>管理员</span>
                        </a>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
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
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

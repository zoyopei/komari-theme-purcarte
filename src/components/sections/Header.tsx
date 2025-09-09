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
import { useTheme } from "@/hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  viewMode: "grid" | "table";
  setViewMode: (mode: "grid" | "table") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const Header = ({
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
}: HeaderProps) => {
  const { appearance, setAppearance } = useTheme();
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

  const toggleAppearance = () => {
    setAppearance(appearance === "light" ? "dark" : "light");
  };

  return (
    <header className="purcarte-blur border-b border-(--accent-a4) shadow-sm shadow-(color:--accent-a4) sticky top-0 flex items-center justify-center z-10">
      <div className="w-[90%] max-w-screen-2xl px-4 py-2 flex items-center justify-between">
        <div className="flex items-center theme-text-shadow text-accent-foreground">
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
                  {enableSearchButton && (
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative group">
                          <Search className="size-5 text-primary" />
                          {searchTerm && (
                            <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-(--accent-indicator) transform -translate-x-1/2"></span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="purcarte-blur border-(--accent-4)/50 rounded-xl w-[90vw] translate-x-[5vw] mt-[.5rem] max-w-screen-2xl">
                        <div className="p-2">
                          <Input
                            type="search"
                            placeholder="搜索服务器..."
                            className="w-full"
                            value={searchTerm}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative group">
                        <Menu className="size-5 text-primary transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-(--accent-indicator) transform -translate-x-1/2 scale-0 transition-transform duration-300 group-data-[state=open]:scale-100"></span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="purcarte-blur mt-[.5rem] border-(--accent-4)/50 rounded-xl">
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
                      <DropdownMenuItem onClick={toggleAppearance}>
                        {appearance === "dark" ? (
                          <Sun className="size-4 mr-2 text-primary" />
                        ) : (
                          <Moon className="size-4 mr-2 text-primary" />
                        )}
                        <span>
                          {appearance === "dark" ? "浅色模式" : "深色模式"}
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
                      className="relative group"
                      onClick={() => setIsSearchOpen(!isSearchOpen)}>
                      <Search className="size-5 text-primary" />
                      {searchTerm && (
                        <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-(--accent-indicator) transform -translate-x-1/2"></span>
                      )}
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleAppearance}>
                    {appearance === "dark" ? (
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
                    className="animate-in slide-in-from-top-5 duration-300 purcarte-blur border-(--accent-4)/50 rounded-xl">
                    <DropdownMenuItem onClick={toggleAppearance}>
                      {appearance === "dark" ? (
                        <Sun className="size-4 mr-2 text-primary" />
                      ) : (
                        <Moon className="size-4 mr-2 text-primary" />
                      )}
                      <span>
                        {appearance === "dark" ? "浅色模式" : "深色模式"}
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
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleAppearance}>
                    {appearance === "dark" ? (
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

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="purcarte-blur p-2 border-b border-(--accent-a4) inset-shadow-sm inset-shadow-(color:--accent-a4) sticky bottom-0 flex items-center justify-center z-10">
      <p className="flex justify-center text-sm text-secondary-foreground theme-text-shadow whitespace-pre">
        Powered by{" "}
        <a
          href="https://github.com/komari-monitor/komari"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 transition-colors">
          Komari Monitor
        </a>
        {" | "}
        Theme by{" "}
        <a
          href="https://github.com/Montia37/komari-theme-purcarte"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 transition-colors">
          PurCarte
        </a>
      </p>
    </footer>
  );
};

export default Footer;

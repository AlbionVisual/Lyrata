import React from "react";
import "./PageLayout.css";

interface PageLayoutProps {
  children: React.ReactNode;
  onGoBack?: () => void;
}

function PageLayout({ children, onGoBack }: PageLayoutProps) {
  return (
    <div className="PageLayout">
      <div
        className="PageLayoutGoBack"
        onClick={() => {
          if (onGoBack) onGoBack();
        }}>
        {"< назад"}
      </div>
      {children}
    </div>
  );
}

export default PageLayout;

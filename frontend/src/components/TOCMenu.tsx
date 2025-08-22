import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface TOCMenuProps {
  toc: string;
  className?: string;
}

const TOCMenu: React.FC<TOCMenuProps> = ({ toc, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Don't render if no TOC or if TOC is effectively empty
  if (!toc || !toc.trim()) {
    return null;
  }

  // Check if TOC contains only empty HTML tags (no actual content/links)
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = toc;
  const textContent = tempDiv.textContent || tempDiv.innerText || "";
  const hasLinks = tempDiv.querySelectorAll("a").length > 0;

  if (!textContent.trim() || !hasLinks) {
    return null;
  }

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile TOC Toggle Button */}
      <div className={`md:hidden ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg border border-border transition-colors"
          aria-label="Open table of contents"
        >
          <Menu size={16} />
          Contents
        </button>
      </div>

      {/* Mobile TOC Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background-50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* TOC Panel */}
          <div className="fixed inset-y-0 right-0 w-80 max-w-[80vw] bg-background border-l border-border z-50 md:hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold">Table of Contents</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Close table of contents"
                >
                  <X size={18} />
                </button>
              </div>

              {/* TOC Content */}
              <div className="flex-1 overflow-y-auto p-1">
                <div
                  className="mobile-toc-content prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: toc }}
                  onClick={handleLinkClick}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop TOC Sidebar */}
      <div className="hidden md:block sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="w-64 p-4 bg-muted/30 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Table of Contents
          </h3>
          <div
            className="desktop-toc-content prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: toc }}
          />
        </div>
      </div>
    </>
  );
};

export default TOCMenu;

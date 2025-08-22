import React from "react";
import { ArrowUp } from "lucide-react";
import type { FootnoteInfo } from "../types/blog";

interface FootnotesProps {
  footnotes: Record<string, FootnoteInfo>;
  className?: string;
}

const Footnotes: React.FC<FootnotesProps> = ({ footnotes, className = "" }) => {
  // Convert footnotes object to array and sort by number
  const footnoteArray = Object.entries(footnotes)
    .map(([uuid, info]) => ({
      uuid,
      number: info.number,
      originalNumber: info.original_number,
    }))
    .sort((a, b) => a.number - b.number);

  if (footnoteArray.length === 0) {
    return null;
  }

  return (
    <div className={`footnotes-section ${className}`}>
      <h3 className="footnotes-title">References</h3>
      <div className="space-y-3">
        {footnoteArray.map((footnote) => (
          <div
            key={footnote.uuid}
            id={`footnote-${footnote.number}`}
            className="footnote-item"
          >
            <span className="footnote-number">{footnote.number}.</span>
            <div className="footnote-content">
              <span className="text-muted-foreground">
                Reference {footnote.originalNumber} - Content will be populated
                from external source
              </span>
              <a
                href={`#footnote-ref-${footnote.number}`}
                className="footnote-backref"
                aria-label={`Back to reference ${footnote.number}`}
                title={`Back to reference ${footnote.number}`}
              >
                <ArrowUp className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Footnotes;

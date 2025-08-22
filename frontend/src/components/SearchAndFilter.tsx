import { Search, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Input } from "./ui/input";
import TagBadge from "./TagBadge";

interface SearchAndFilterProps {
  searchQuery: string;
  selectedTags: string[];
  onSearchChange: (query: string) => void;
  onTagRemove: (tag: string) => void;
  onClear: () => void;
  className?: string;
}

const SearchAndFilter = ({
  searchQuery,
  selectedTags,
  onSearchChange,
  onTagRemove,
  onClear,
  className,
}: SearchAndFilterProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleClear = () => {
    onClear();
  };

  const hasContent = searchQuery.length > 0 || selectedTags.length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center gap-2">
          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedTags.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  variant="selected"
                  onRemove={onTagRemove}
                />
              ))}
            </div>
          )}

          {/* Search Input with Icon */}
          <div className="relative flex-1">
            <Input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              className="pr-10 rounded-xs"
            />

            {/* Search/Clear Icon */}
            <button
              onClick={hasContent ? handleClear : undefined}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors duration-200",
                hasContent
                  ? "hover:bg-background-200 text-foreground-500 cursor-pointer"
                  : "text-foreground-700 cursor-default"
              )}
              type="button"
            >
              {hasContent ? (
                <X className="w-4 h-4" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(searchQuery || selectedTags.length > 0) && (
        <div className="text-xs text-foreground-600">
          {searchQuery && selectedTags.length > 0 && (
            <>
              Searching for "{searchQuery}" with tags: {selectedTags.join(", ")}
            </>
          )}
          {searchQuery && selectedTags.length === 0 && (
            <>Searching for "{searchQuery}"</>
          )}
          {!searchQuery && selectedTags.length > 0 && (
            <>Filtering by tags: {selectedTags.join(", ")}</>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;

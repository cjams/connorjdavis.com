import { useState, useEffect } from "react";
import type { Tag } from "../types/blog";
import apiService from "../services/api";
import { Skeleton } from "./ui/skeleton";

const TagCloud = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const allTags = await apiService.getTags();
        // Sort tags by count (if available) or alphabetically
        const sortedTags = allTags.sort((a, b) => {
          if (a.count && b.count) {
            return b.count - a.count;
          }
          return a.name.localeCompare(b.name);
        });
        setTags(sortedTags.slice(0, 20)); // Limit to top 20 tags
        setError(null);
      } catch (err) {
        setError("Failed to load tags");
        console.error("Error fetching tags:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const getTagSize = (index: number, totalTags: number): string => {
    // Create different sizes for visual hierarchy
    const ratio = (totalTags - index) / totalTags;
    if (ratio > 0.8) return "text-lg";
    if (ratio > 0.6) return "text-base";
    if (ratio > 0.4) return "text-sm";
    return "text-xs";
  };

  const getTagColor = (index: number): string => {
    const colors = [
      "bg-primary-100 text-primary-700 hover:bg-primary-200",
      "bg-success-100 text-success-700 hover:bg-success-200",
      "bg-warning-100 text-warning-700 hover:bg-warning-200",
      "bg-background-200 text-foreground-100 hover:bg-background-300",
      "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      "bg-accent text-accent-foreground hover:bg-accent/80",
      "bg-muted text-muted-foreground hover:bg-muted/80",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6">
        <h3 className="text-lg text-foreground-100 mb-4 ">Tag Cloud</h3>
        <div className="flex flex-wrap gap-2">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6">
        <h3 className="text-lg text-foreground-100 mb-4 ">Tag Cloud</h3>
        <p className="text-error-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-md p-6">
      <h3 className="text-lg text-foreground-100 mb-4">Tag Cloud</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <a
            key={tag.slug}
            href={`/tags/${tag.slug}`}
            className={`inline-flex items-center px-3 py-1 rounded-full font-medium transition-colors duration-200 ${getTagSize(
              index,
              tags.length
            )} ${getTagColor(index)}`}
          >
            #{tag.name}
            {tag.count && (
              <span className="ml-1 text-xs opacity-75">({tag.count})</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};

export default TagCloud;

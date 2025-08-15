import { useState, useEffect } from "react";
import type { Tag } from "../types/blog";
import apiService from "../services/api";

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
      "bg-blue-100 text-blue-800 hover:bg-blue-200",
      "bg-green-100 text-green-800 hover:bg-green-200",
      "bg-purple-100 text-purple-800 hover:bg-purple-200",
      "bg-pink-100 text-pink-800 hover:bg-pink-200",
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
      "bg-gray-100 text-gray-800 hover:bg-gray-200",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 font-serif">
          Tag Cloud
        </h3>
        <div className="flex flex-wrap gap-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 font-serif">
          Tag Cloud
        </h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 font-serif">
        Tag Cloud
      </h3>
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

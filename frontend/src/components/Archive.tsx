import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Post } from "../types/blog";
import apiService from "../services/api";
import { Skeleton } from "./ui/skeleton";

interface ArchiveGroup {
  period: string;
  posts: Post[];
  isExpanded: boolean;
}

const Archive = () => {
  const [archiveGroups, setArchiveGroups] = useState<ArchiveGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArchivePosts = async () => {
      try {
        setLoading(true);
        // Fetch more posts for the archive (e.g., 50 posts)
        const response = await apiService.getPosts(1, 50);
        const posts = response.posts;

        // Group posts by year and month
        const grouped = groupPostsByPeriod(posts);
        setArchiveGroups(grouped);
        setError(null);
      } catch (err) {
        setError("Failed to load archive");
        console.error("Error fetching archive posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivePosts();
  }, []);

  const groupPostsByPeriod = (posts: Post[]): ArchiveGroup[] => {
    const groups: { [key: string]: Post[] } = {};

    posts.forEach((post) => {
      const date = new Date(post.date);
      const year = date.getFullYear();
      const month = date.toLocaleDateString("en-US", { month: "long" });
      const period = `${month} ${year}`;

      if (!groups[period]) {
        groups[period] = [];
      }
      groups[period].push(post);
    });

    // Convert to array and sort by date (most recent first)
    const sortedGroups = Object.entries(groups)
      .map(([period, posts]) => ({
        period,
        posts: posts.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        isExpanded: false, // Start with all collapsed except the first one
      }))
      .sort((a, b) => {
        const dateA = new Date(a.posts[0].date);
        const dateB = new Date(b.posts[0].date);
        return dateB.getTime() - dateA.getTime();
      });

    // Expand the most recent period by default
    if (sortedGroups.length > 0) {
      sortedGroups[0].isExpanded = true;
    }

    return sortedGroups;
  };

  const toggleGroup = (index: number) => {
    setArchiveGroups((prev) =>
      prev.map((group, i) =>
        i === index ? { ...group, isExpanded: !group.isExpanded } : group
      )
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6">
        <h3 className="text-lg text-foreground-400 mb-4">Archive</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-5 w-1/2 mb-3" />
              <div className="space-y-2 ml-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6">
        <h3 className="text-lg text-foreground-400 mb-4">Archive</h3>
        <p className="text-error-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-md p-6">
      <h3 className="text-lg text-foreground-100 mb-2">Archive</h3>
      <div className="space-y-1">
        {archiveGroups.map((group, index) => (
          <div key={group.period}>
            <button
              onClick={() => toggleGroup(index)}
              className="flex items-center justify-between w-full text-left py-2 group"
            >
              <h4 className="text-sm font-medium text-foreground-500 group-hover:text-foreground-300 transition-colors duration-200">
                {group.period} ({group.posts.length})
              </h4>
              {group.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-foreground-500 group-hover:text-foreground-300 transition-colors duration-200" />
              ) : (
                <ChevronRight className="w-4 h-4 text-foreground-500 group-hover:text-foreground-300 transition-colors duration-200" />
              )}
            </button>

            {group.isExpanded && (
              <ul className="space-y-1 ml-4">
                {group.posts.map((post) => (
                  <li
                    key={post.slug}
                    className="border-b border-background-100 last:border-b-0 mb-2 "
                  >
                    <a href={`/posts/${post.slug}`} className="block">
                      <h5 className="text-sm text-foreground leading-snug mb-1 line-clamp-2 hover:text-primary-600 transition-colors duration-200">
                        {post.title}
                      </h5>
                      <div className="flex items-center text-xs text-foreground-700">
                        <time dateTime={post.date}>
                          {formatDate(post.date)}
                        </time>
                        <span className="mx-2">•</span>
                        <span>{post.reading_time} min read</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Archive;

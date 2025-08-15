import { useState, useEffect } from "react";
import type { Post } from "../types/blog";
import apiService from "../services/api";

const RecentPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        setLoading(true);
        const recentPosts = await apiService.getRecentPosts(5);
        setPosts(recentPosts);
        setError(null);
      } catch (err) {
        setError("Failed to load recent posts");
        console.error("Error fetching recent posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 font-serif">
          Recent Posts
        </h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          Recent Posts
        </h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 font-serif">
        Recent Posts
      </h3>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li
            key={post.slug}
            className="border-b border-gray-100 pb-3 last:border-b-0"
          >
            <a
              href={`/posts/${post.slug}`}
              className="block hover:text-blue-600 transition-colors duration-200"
            >
              <h4 className="text-sm font-medium text-gray-900 leading-snug mb-1 line-clamp-2">
                {post.title}
              </h4>
              <div className="flex items-center text-xs text-gray-500">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span className="mx-2">•</span>
                <span>{post.reading_time} min read</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentPosts;

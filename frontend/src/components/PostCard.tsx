import { Calendar, Clock } from "lucide-react";
import type { Post } from "../types/blog";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getReadingTimeText = (minutes: number): string => {
    return `${minutes} min read`;
  };

  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 mb-6">
      {/* Header with title, date, and reading time */}
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 font-serif leading-tight hover:text-blue-600 transition-colors duration-200">
          <a href={`/posts/${post.slug}`} className="no-underline">
            {post.title}
          </a>
        </h2>

        <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4 mb-3">
          <time dateTime={post.date} className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(post.date)}
          </time>

          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {getReadingTimeText(post.reading_time)}
          </span>
        </div>
      </div>

      {/* Excerpt */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
      </div>

      {/* Categories and Tags */}
      <div className="flex flex-wrap gap-4">
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Categories:
            </span>
            {post.categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Tags:
            </span>
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors duration-200"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;

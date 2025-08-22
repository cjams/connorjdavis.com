import { Calendar, Clock, Tag } from "lucide-react";
import type { Post } from "../types/blog";
import TagBadge from "./TagBadge";

interface PostCardProps {
  post: Post;
  onTagClick?: (tag: string) => void;
}

const PostCard = ({ post, onTagClick }: PostCardProps) => {
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
    <article className="bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 mb-6">
      {/* Header with title, date, and reading time */}
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl text-foreground-300 mb-2 leading-tight hover:text-primary-600 transition-colors duration-200">
          <a href={`/posts/${post.slug}`} className="no-underline">
            {post.title}
          </a>
        </h2>

        <div className="flex flex-wrap items-center text-sm text-foreground-700 gap-4 mb-3">
          <time dateTime={post.date} className="flex items-center">
            <Calendar className="w-4 h-4 mr-1 text-foreground-800" />
            {formatDate(post.date)}
          </time>

          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1 text-foreground-800" />
            {getReadingTimeText(post.reading_time)}
          </span>
        </div>
      </div>

      {/* Excerpt */}
      <div className="mb-4">
        <p className="text-foreground-300 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="w-4 h-4 text-foreground-800" />
          {/* tag badge */}
          {post.tags.slice(0, 5).map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              variant="clickable"
              onClick={onTagClick}
            />
          ))}
          {post.tags.length > 5 && (
            <span className="text-xs text-foreground-400">
              +{post.tags.length - 5} more
            </span>
          )}
        </div>
      )}
    </article>
  );
};

export default PostCard;

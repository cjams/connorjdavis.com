import { Calendar, Clock } from "lucide-react";
import type { Post } from "../types/blog";
import TagBadge from "./TagBadge";

interface PostHeaderProps {
  post: Post;
  onTagClick?: (tag: string) => void;
}

const PostHeader = ({ post, onTagClick }: PostHeaderProps) => {
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
    <header className="mb-6 pb-2 border-b border-foreground/10">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl text-foreground-200 mb-6 leading-tight">
        {post.title}
      </h1>

      {/* Meta information */}
      <div className="flex flex-wrap items-center text-sm text-foreground-700 gap-6 mb-6">
        {/* Date */}
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-foreground-800" />
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>

        {/* Reading time */}
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-foreground-800" />
          <span>{getReadingTimeText(post.reading_time)}</span>
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {post.tags.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              variant="clickable"
              onClick={onTagClick}
            />
          ))}
        </div>
      )}
    </header>
  );
};

export default PostHeader;

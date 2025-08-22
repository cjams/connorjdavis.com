import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import type { Post as PostType } from "../types/blog";
import PostHeader from "./PostHeader";
import Footnotes from "./Footnotes";
import TOCMenu from "./TOCMenu";
import { processPostContent, getTypographyClasses } from "../utils/content";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface PostProps {
  post: PostType;
  onTagClick?: (tag: string) => void;
}

const Post = ({ post, onTagClick }: PostProps) => {
  // Process content with all enhancements
  const processedContent = useMemo(() => {
    return processPostContent(post.content || "", API_BASE_URL);
  }, [post.content]);

  // Get typography classes
  const typographyClasses = getTypographyClasses({
    className: "prose prose-lg max-w-none",
  });

  // Check if TOC has actual content (same logic as TOCMenu component)
  const hasTOC = useMemo(() => {
    const toc = post.toc || "";
    if (!toc || !toc.trim()) {
      return false;
    }

    // Check if TOC contains only empty HTML tags (no actual content/links)
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = toc;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    const hasLinks = tempDiv.querySelectorAll("a").length > 0;

    return textContent.trim() && hasLinks;
  }, [post.toc]);

  return (
    <div className="max-w-7xl mx-auto px-10 py-8 bg-background-50">
      {/* Back navigation */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-foreground-700 hover:text-foreground-300 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to posts
        </Link>
      </div>

      {/* Responsive layout container */}
      <div
        className={`grid grid-cols-1 ${hasTOC ? "md:grid-cols-[1fr_300px]" : ""} gap-8`}
      >
        {/* Main content column */}
        <div className="min-w-0 flex justify-center">
          <div className="max-w-3xl w-full">
            {/* Post header */}
            <PostHeader post={post} onTagClick={onTagClick} />

            {/* Post content with enhanced typography */}
            <article className={typographyClasses}>
              <div dangerouslySetInnerHTML={{ __html: processedContent }} />
            </article>

            {/* Footnotes section */}
            {post.footnotes && Object.keys(post.footnotes).length > 0 && (
              <Footnotes footnotes={post.footnotes} className="mt-8" />
            )}
          </div>
        </div>

        {/* Desktop TOC sidebar - only render if TOC has content */}
        {hasTOC && (
          <aside className="hidden md:block">
            <TOCMenu toc={post.toc || ""} />
          </aside>
        )}
      </div>
    </div>
  );
};

export default Post;

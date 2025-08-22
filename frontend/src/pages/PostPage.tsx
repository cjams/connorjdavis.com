import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import type { Post as PostType } from "../types/blog";
import Post from "../components/Post";
import PostSkeleton from "../components/PostSkeleton";

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError("No post slug provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const postData = await apiService.getPost(slug);
        setPost(postData);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleTagClick = (tag: string) => {
    // Navigate to home page with tag filter
    navigate(`/?tag=${encodeURIComponent(tag)}`);
  };

  if (loading) {
    return <PostSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-background-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
            <p className="text-foreground-700 mb-4">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-background-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="bg-card border border-foreground/10 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-foreground-300 mb-2">
              Post Not Found
            </h1>
            <p className="text-foreground-700 mb-4">
              The post you're looking for doesn't exist.
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-50 min-h-screen">
      <Post post={post} onTagClick={handleTagClick} />
    </div>
  );
};

export default PostPage;

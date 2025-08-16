import { useState, useEffect, useMemo } from "react";
import type { Post, PostListResponse } from "../types/blog";
import apiService from "../services/api";
import PostCard from "../components/PostCard";
import Archive from "../components/Archive";
import TagCloud from "../components/TagCloud";
import SearchAndFilter from "../components/SearchAndFilter";
import { ThemeToggle } from "../components/ThemeToggle";
import { Skeleton } from "../components/ui/skeleton";

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response: PostListResponse = await apiService.getPosts(1, 10);
        setPosts(response.posts);
        setTotalPages(response.total_pages);
        setCurrentPage(1);
        setError(null);
      } catch (err) {
        setError("Failed to load posts");
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on search query and selected tags
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          (post.tags &&
            post.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    // Filter by selected tags (AND logic)
    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) =>
        selectedTags.every((selectedTag) =>
          post.tags?.some(
            (postTag) => postTag.toLowerCase() === selectedTag.toLowerCase()
          )
        )
      );
    }

    return filtered;
  }, [posts, searchQuery, selectedTags]);

  const loadMorePosts = async () => {
    if (currentPage >= totalPages || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const response: PostListResponse = await apiService.getPosts(
        nextPage,
        10
      );
      setPosts((prev) => [...prev, ...response.posts]);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Search and filter handlers
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleTagAdd = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content skeleton */}
            <main className="flex-1">
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg shadow-md p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="space-y-2 mb-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </main>

            {/* Sidebar skeleton */}
            <aside className="lg:w-96">
              <div className="space-y-6 lg:ml-8">
                <div className="bg-card rounded-lg shadow-md p-6">
                  <Skeleton className="h-6 w-1/2 mb-4" />
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i}>
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-card rounded-lg shadow-md p-6">
                  <Skeleton className="h-6 w-1/2 mb-4" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(12)].map((_, i) => (
                      <Skeleton key={i} className="h-6 w-16 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground-0 mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-foreground-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-500 hover:bg-primary-600 text-primary-foreground font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="flex justify-between items-center w-full py-6">
          <div className="px-4 sm:px-6 lg:px-8 flex-1">
            <h1 className="text-xl md:text-2xl text-foreground-800">
              mind and matter
            </h1>
          </div>
          <div className="px-4 sm:px-6 lg:px-8 flex-shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-full mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8">
          {/* Search - Mobile: Above posts, Desktop: Left side */}
          <div className="mx-auto w-full max-w-prose lg:mx-0 lg:w-64 xl:w-72 2xl:w-80 lg:order-1 lg:flex-shrink-0 lg:max-w-none">
            <SearchAndFilter
              searchQuery={searchQuery}
              selectedTags={selectedTags}
              onSearchChange={handleSearchChange}
              onTagAdd={handleTagAdd}
              onTagRemove={handleTagRemove}
              onClear={handleClearSearch}
              className="lg:sticky lg:top-8"
            />
          </div>

          {/* Posts list */}
          <main className="flex-1 lg:order-2 min-w-0">
            <div className="mx-auto space-y-6 min-w-prose w-full max-w-prose">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.slug}
                    post={post}
                    onTagClick={handleTagAdd}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-foreground-600 text-lg">
                    No posts found matching your search criteria.
                  </p>
                  <button
                    onClick={handleClearSearch}
                    className="mt-4 text-primary-600 hover:text-primary-700 underline"
                  >
                    Clear search and filters
                  </button>
                </div>
              )}
            </div>

            {/* Load more button */}
            {currentPage < totalPages && filteredPosts.length > 0 && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMorePosts}
                  disabled={loadingMore}
                  className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-foreground font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  {loadingMore ? "Loading..." : "Load More Posts"}
                </button>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:w-64 xl:w-72 2xl:w-80 lg:order-3 lg:flex-shrink-0">
            <div className="space-y-6 lg:sticky lg:top-8">
              <TagCloud />
              <Archive />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

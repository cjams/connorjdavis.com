const PostSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse bg-background-50">
      {/* Header skeleton */}
      <div className="mb-8">
        {/* Title skeleton */}
        <div className="h-8 bg-foreground/10 rounded-md mb-4 w-3/4"></div>
        <div className="h-6 bg-foreground/10 rounded-md mb-6 w-1/2"></div>

        {/* Meta info skeleton */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="h-4 bg-foreground/10 rounded w-32"></div>
          <div className="h-4 bg-foreground/10 rounded w-24"></div>
        </div>

        {/* Tags skeleton */}
        <div className="flex gap-2 mb-8">
          <div className="h-6 bg-foreground/10 rounded-full w-16"></div>
          <div className="h-6 bg-foreground/10 rounded-full w-20"></div>
          <div className="h-6 bg-foreground/10 rounded-full w-12"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-4 bg-foreground/10 rounded w-full"></div>
        <div className="h-4 bg-foreground/10 rounded w-5/6"></div>
        <div className="h-4 bg-foreground/10 rounded w-4/5"></div>
        <div className="h-4 bg-foreground/10 rounded w-full"></div>
        <div className="h-4 bg-foreground/10 rounded w-3/4"></div>
        <div className="h-4 bg-foreground/10 rounded w-5/6"></div>

        {/* Paragraph break */}
        <div className="py-2"></div>

        <div className="h-4 bg-foreground/10 rounded w-full"></div>
        <div className="h-4 bg-foreground/10 rounded w-4/5"></div>
        <div className="h-4 bg-foreground/10 rounded w-3/4"></div>
        <div className="h-4 bg-foreground/10 rounded w-full"></div>
      </div>
    </div>
  );
};

export default PostSkeleton;

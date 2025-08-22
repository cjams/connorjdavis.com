import { X } from "lucide-react";
import { cn } from "../lib/utils";

type TagBadgeVariant = "default" | "selected" | "clickable";

interface TagBadgeProps {
  tag: string;
  variant?: TagBadgeVariant;
  onClick?: (tag: string) => void;
  onRemove?: (tag: string) => void;
  className?: string;
}

const TagBadge = ({
  tag,
  variant = "default",
  onClick,
  onRemove,
  className,
}: TagBadgeProps) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-xs text-xs font-medium transition-colors duration-200";

  const variantStyles = {
    default: "bg-background-300 text-foreground-700",
    selected: "bg-primary-600 text-foreground-100",
    clickable:
      "bg-background-300 text-foreground-700 hover:cursor-pointer hover:bg-primary-600 hover:text-foreground-100",
  };

  const handleClick = () => {
    if (onClick && variant === "clickable") {
      onClick(tag);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(tag);
    }
  };

  if (variant === "selected" && onRemove) {
    return (
      <span className={cn(baseStyles, variantStyles.selected, className)}>
        {tag}
        <button
          onClick={handleRemove}
          className="ml-1 hover:bg-primary-700 rounded p-0.5 transition-colors duration-200"
          type="button"
        >
          <X className="w-3 h-3" />
        </button>
      </span>
    );
  }

  if (variant === "clickable") {
    return (
      <button
        onClick={handleClick}
        className={cn(baseStyles, variantStyles.clickable, className)}
      >
        {tag}
      </button>
    );
  }

  return (
    <span className={cn(baseStyles, variantStyles.default, className)}>
      {tag}
    </span>
  );
};

export default TagBadge;

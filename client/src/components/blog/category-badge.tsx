import { cn } from "@/lib/utils";

type CategoryBadgeProps = {
  category: string;
  className?: string;
  size?: "xs" | "sm";
};

const categoryColors: Record<string, string> = {
  Technology: "bg-blue-100 text-primary",
  Design: "bg-green-100 text-green-800",
  Tutorial: "bg-purple-100 text-purple-800",
  Development: "bg-yellow-100 text-yellow-800",
  Database: "bg-blue-100 text-primary",
  Default: "bg-gray-100 text-gray-800",
};

const CategoryBadge = ({ category, className, size = "xs" }: CategoryBadgeProps) => {
  const colorClass = categoryColors[category] || categoryColors.Default;
  
  return (
    <span 
      className={cn(
        colorClass,
        size === "xs" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1",
        "font-semibold rounded",
        className
      )}
    >
      {category}
    </span>
  );
};

export default CategoryBadge;

import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { PostWithRelations } from "@/lib/types";
import CategoryBadge from "./category-badge";

type PostCardProps = {
  post: PostWithRelations;
};

const PostCard = ({ post }: PostCardProps) => {
  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="flex-shrink-0">
        <img 
          className="h-48 w-full object-cover" 
          src={post.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"}
          alt={`${post.title} featured image`} 
        />
      </div>
      <CardContent className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {post.category && (
              <CategoryBadge category={post.category.name} />
            )}
            <span className="ml-2 text-xs text-gray-500">{post.readTime} min read</span>
          </div>
          <Link href={`/blog/${post.slug}`}>
            <a className="block">
              <h3 className="text-xl font-semibold text-gray-900 hover:text-primary">{post.title}</h3>
              <p className="mt-3 text-gray-600">{post.excerpt}</p>
            </a>
          </Link>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex-shrink-0">
            <img 
              className="h-10 w-10 rounded-full" 
              src={post.author?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
              alt={`${post.author?.name || 'Author'} avatar`} 
            />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{post.author?.name || 'Unknown Author'}</p>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;

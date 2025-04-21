import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Heart, MessageSquare, Share, Bookmark } from "lucide-react";
import CategoryBadge from "@/components/blog/category-badge";
import { PostWithRelations, CommentWithAuthor } from "@/lib/types";

const Post = () => {
  const { slug } = useParams();
  const [, setLocation] = useLocation();

  // Fetch post by slug
  const { 
    data: post, 
    isLoading: isPostLoading,
    isError: isPostError
  } = useQuery<PostWithRelations>({
    queryKey: [`/api/posts/slug/${slug}`],
    enabled: !!slug,
  });

  // Fetch comments if post is found
  const { 
    data: comments, 
    isLoading: isCommentsLoading 
  } = useQuery<CommentWithAuthor[]>({
    queryKey: [`/api/posts/${post?.id}/comments`],
    enabled: !!post?.id,
  });

  // Fetch category if post is found
  const {
    data: category,
    isLoading: isCategoryLoading
  } = useQuery({
    queryKey: [`/api/categories/${post?.categoryId}`],
    enabled: !!post?.categoryId,
  });

  // Fetch author if post is found
  const {
    data: author,
    isLoading: isAuthorLoading
  } = useQuery({
    queryKey: [`/api/users/${post?.userId}`],
    enabled: !!post?.userId,
  });

  // If post not found, redirect to blog page
  useEffect(() => {
    if (isPostError) {
      setLocation("/blog");
    }
  }, [isPostError, setLocation]);

  if (isPostLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="w-full h-80" />
        <div className="p-8 bg-white rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="ml-2 h-5 w-24 rounded" />
          </div>
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex items-center mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-3">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div>
          <img 
            className="w-full h-80 object-cover" 
            src={post.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"} 
            alt={`${post.title} featured image`} 
          />
        </div>
        <div className="p-8">
          <div className="flex items-center mb-4">
            {isCategoryLoading ? (
              <Skeleton className="h-5 w-20 rounded" />
            ) : category ? (
              <CategoryBadge category={category.name} />
            ) : null}
            <span className="ml-2 text-xs text-gray-500">{post.readTime} min read</span>
            <span className="mx-2 text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center mb-8">
            {isAuthorLoading ? (
              <>
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </>
            ) : author ? (
              <>
                <img 
                  className="h-10 w-10 rounded-full" 
                  src={author.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                  alt={`${author.name} avatar`} 
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{author.name}</p>
                  <div className="flex space-x-2 text-sm text-gray-500">
                    <span>Author</span>
                    <span>•</span>
                    <a href="#" className="text-primary hover:underline">Follow</a>
                  </div>
                </div>
              </>
            ) : null}
          </div>
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div className="mt-8 border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center text-gray-500 hover:text-primary">
                  <Heart className="mr-2 h-5 w-5" />
                  <span>127 likes</span>
                </button>
                <button className="flex items-center text-gray-500 hover:text-primary">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  <span>{comments?.length || 0} comments</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center text-gray-500 hover:text-primary">
                  <Share className="mr-2 h-5 w-5" />
                  <span>Share</span>
                </button>
                <button className="flex items-center text-gray-500 hover:text-primary">
                  <Bookmark className="mr-2 h-5 w-5" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
      
      {/* Comments Section */}
      <div className="mt-12 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({comments?.length || 0})
          </h2>
          <form className="mb-8">
            <div>
              <label htmlFor="comment" className="sr-only">Comment</label>
              <Textarea
                id="comment"
                rows={3}
                placeholder="Leave a comment..."
                className="block w-full"
              />
            </div>
            <div className="mt-3 flex items-center justify-end">
              <Button type="submit">
                Post Comment
              </Button>
            </div>
          </form>
          
          {isCommentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <img 
                      className="h-10 w-10 rounded-full" 
                      src={comment.author?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                      alt={`${comment.author?.name || 'Commenter'} avatar`} 
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {comment.author?.name || 'Anonymous'}
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                      <p>{comment.content}</p>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex">
                      <span>
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="mx-2">•</span>
                      <button className="text-primary hover:text-secondary">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;

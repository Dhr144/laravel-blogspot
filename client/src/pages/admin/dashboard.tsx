import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Loader2, 
  PlusCircle, 
  Edit2, 
  Trash2,
  Eye,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PostWithRelations } from "@/lib/types";
import { useState } from "react";

const Dashboard = () => {
  const { toast } = useToast();
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  
  // Fetch posts, categories, and stats
  const { data: posts, isLoading: isPostsLoading } = useQuery<PostWithRelations[]>({
    queryKey: ['/api/posts'],
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Function to handle post deletion
  const handleDeletePost = async (postId: number) => {
    setDeletingPostId(postId);
    try {
      await apiRequest('DELETE', `/api/posts/${postId}`);
      
      // Invalidate posts query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingPostId(null);
    }
  };

  // Calculate dashboard stats
  const totalPosts = posts?.length || 0;
  const publishedPosts = posts?.filter(post => post.published).length || 0;
  const draftPosts = totalPosts - publishedPosts;
  const totalCategories = categories?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Admin Dashboard</h1>
        <Link href="/admin/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Posts</CardDescription>
            <CardTitle className="text-3xl">{totalPosts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl">{publishedPosts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl">{draftPosts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Categories</CardDescription>
            <CardTitle className="text-3xl">{totalCategories}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Posts</CardTitle>
          <CardDescription>View, edit, or delete your blog posts</CardDescription>
        </CardHeader>
        <CardContent>
          {isPostsLoading || isCategoriesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map(post => {
                    // Find the category name
                    const category = categories?.find(c => c.id === post.categoryId);
                    
                    return (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {post.title}
                        </TableCell>
                        <TableCell>{category?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/blog/${post.slug}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </Link>
                            <Link href={`/admin/edit/${post.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit2 className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{post.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeletePost(post.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                    disabled={deletingPostId === post.id}
                                  >
                                    {deletingPostId === post.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No posts found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first blog post.</p>
              <Link href="/admin/create">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Post
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

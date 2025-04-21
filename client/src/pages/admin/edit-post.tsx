import { useParams, useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PostForm from "@/components/blog/post-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const EditPost = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const postId = parseInt(id);

  // Fetch post data for editing
  const { 
    data: post, 
    isLoading, 
    isError,
    error
  } = useQuery({
    queryKey: [`/api/posts/${postId}`],
    enabled: !!postId && !isNaN(postId),
  });

  // Handle invalid post ID or not found
  useEffect(() => {
    if (isNaN(postId)) {
      toast({
        title: "Invalid Post ID",
        description: "The post ID is invalid.",
        variant: "destructive",
      });
      setLocation("/admin");
    } else if (isError) {
      toast({
        title: "Error",
        description: "Failed to load the post. It may have been deleted.",
        variant: "destructive",
      });
      setLocation("/admin");
    }
  }, [postId, isError, setLocation, toast]);

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async (formData: any) => {
      const response = await apiRequest('PUT', `/api/posts/${postId}`, formData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      
      // Show success toast
      toast({
        title: "Success!",
        description: "Your post has been updated successfully.",
      });
      
      // Redirect to dashboard
      setLocation("/admin");
    },
    onError: (error: any) => {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update the post. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (formData: any) => {
    updatePostMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Loading post data...</p>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/admin")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
          <CardDescription>
            Update the form below to edit your blog post.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostForm 
            defaultValues={post}
            onSubmit={handleSubmit} 
            isSubmitting={updatePostMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPost;

import { useLocation } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CreatePost = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (formData: any) => {
      const response = await apiRequest('POST', '/api/posts', formData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      
      // Show success toast
      toast({
        title: "Success!",
        description: "Your post has been created successfully.",
      });
      
      // Redirect to dashboard
      setLocation("/admin");
    },
    onError: (error: any) => {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create the post. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (formData: any) => {
    createPostMutation.mutate({
      ...formData,
      // Default values that might not be in the form
      userId: 1, // Default to admin user
    });
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
          <CardDescription>
            Fill out the form below to create a new blog post.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostForm 
            onSubmit={handleSubmit} 
            isSubmitting={createPostMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePost;

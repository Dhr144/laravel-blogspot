import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { insertPostSchema } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const formSchema = insertPostSchema.extend({
  // Add any additional validation if needed
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  content: z.string().min(50, {
    message: "Content must be at least 50 characters.",
  }),
  slug: z.string().min(5, {
    message: "Slug must be at least 5 characters.",
  }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens.",
  }),
  // Make these fields optional for partial updates
  image: z.string().optional(),
  excerpt: z.string().optional(),
  readTime: z.number().min(1).max(60).optional(),
});

type PostFormValues = z.infer<typeof formSchema>;

type PostFormProps = {
  defaultValues?: Partial<PostFormValues>;
  onSubmit: (data: PostFormValues) => void;
  isSubmitting: boolean;
};

const PostForm = ({ defaultValues, onSubmit, isSubmitting }: PostFormProps) => {
  // Fetch categories for the select dropdown
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Set up form with default values
  const form = useForm<PostFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      categoryId: 1, // Default to first category
      userId: 1, // Default to admin user
      image: "",
      published: true,
      readTime: 5,
      ...defaultValues,
    },
  });

  // Generate slug from title
  const generateSlug = () => {
    const title = form.getValues("title");
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-");
      form.setValue("slug", slug);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter post title" 
                  {...field} 
                  onBlur={(e) => {
                    field.onBlur();
                    // Auto-generate slug if it's empty and title changes
                    if (!form.getValues("slug")) {
                      generateSlug();
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Slug</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="post-url-slug" {...field} />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateSlug}
                    className="shrink-0"
                  >
                    Generate
                  </Button>
                </div>
                <FormDescription>
                  URL-friendly version of the title.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="readTime"
            render={({ field }) => (
              <FormItem className="w-32">
                <FormLabel>Read Time (min)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={60} 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief summary of the post (optional)" 
                  {...field} 
                  className="h-20"
                />
              </FormControl>
              <FormDescription>
                A short summary displayed in post listings.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write your post content here..." 
                  {...field} 
                  className="min-h-[300px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isCategoriesLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading categories...</span>
                      </div>
                    ) : (
                      categories?.map((category: any) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Image URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/image.jpg" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  External URL to the featured image.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publish</FormLabel>
                <FormDescription>
                  Make this post publicly visible.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues?.id ? "Update Post" : "Create Post"}
        </Button>
      </form>
    </Form>
  );
};

export default PostForm;

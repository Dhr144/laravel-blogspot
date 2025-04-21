import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/blog/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { PostWithRelations } from "@/lib/types";

const Home = () => {
  // Fetch featured posts (latest published posts)
  const { data: featuredPosts, isLoading: isFeaturedLoading } = useQuery<PostWithRelations[]>({
    queryKey: ['/api/posts', { published: true }],
  });

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0">
          <img 
            className="w-full h-full object-cover" 
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
            alt="Writing desk with laptop" 
          />
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">BlogWave</h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">A modern blog platform powered by React and Express. Share your ideas, stories, and expertise with the world.</p>
          <div className="mt-10">
            <Link href="/blog">
              <Button size="lg" className="font-bold py-3 px-8">
                Start Reading
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="lg" className="ml-4 text-white font-semibold py-3 px-8 border border-white hover:bg-white hover:text-gray-900">
                Create Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Posts Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Featured Posts</span>
          </h2>
          <div className="mt-5 flex lg:mt-0 lg:ml-4">
            <Link href="/blog">
              <Button variant="outline">
                View All Posts
              </Button>
            </Link>
          </div>
        </div>

        {/* Featured Posts Grid */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isFeaturedLoading ? (
            // Skeleton loading state
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <Skeleton className="h-48 w-full" />
                <div className="p-6 flex-1">
                  <div className="flex items-center mb-2">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="ml-2 h-4 w-16 rounded" />
                  </div>
                  <Skeleton className="h-7 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="mt-6 flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="ml-3">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : featuredPosts && featuredPosts.length > 0 ? (
            featuredPosts.slice(0, 3).map(post => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">No posts found. Create your first blog post!</p>
              <Link href="/admin/create">
                <Button className="mt-4">Create Post</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to start your blogging journey?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-gray-300">
              Join our community of writers and share your knowledge with the world.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/admin">
                <Button variant="secondary" size="lg">
                  Create Blog
                </Button>
              </Link>
              <Link href="/blog">
                <Button className="ml-3" size="lg">
                  Explore Posts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import PostListItem from "@/components/blog/post-list-item";
import Pagination from "@/components/ui/pagination";
import { PostWithRelations } from "@/lib/types";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const postsPerPage = 5;

  // Fetch posts and categories
  const { data: posts, isLoading: isPostsLoading } = useQuery<PostWithRelations[]>({
    queryKey: ['/api/posts', { published: true }],
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Filter posts based on search term and selected category
  const filteredPosts = posts?.filter(post => {
    const matchesSearch = searchTerm.trim() === "" ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === null || post.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Paginate posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:flex lg:gap-8">
        {/* Main Content */}
        <div className="lg:w-2/3">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Blog Posts
            </h2>
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-10">
            {isPostsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : currentPosts.length > 0 ? (
              currentPosts.map(post => (
                <PostListItem key={post.id} post={post} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No posts found matching your criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {filteredPosts.length > postsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="mt-10 lg:mt-0 lg:w-1/3">
          {/* Search Box */}
          <Card className="bg-white p-6 rounded-lg shadow-md mb-8">
            <CardContent className="p-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search</h3>
              <div className="relative">
                <Input
                  type="text"
                  className="w-full pr-10"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <Button 
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                  variant="ghost"
                  type="button"
                >
                  <i className="fas fa-search"></i>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="bg-white p-6 rounded-lg shadow-md mb-8">
            <CardContent className="p-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              {isCategoriesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <ul className="space-y-2">
                  <li>
                    <button
                      className={`flex items-center justify-between w-full text-left ${
                        selectedCategory === null
                          ? "text-primary font-medium"
                          : "text-gray-700 hover:text-primary"
                      }`}
                      onClick={() => handleCategoryFilter(null)}
                    >
                      <span>All Categories</span>
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {posts?.length || 0}
                      </span>
                    </button>
                  </li>
                  {categories?.map((category: any) => (
                    <li key={category.id}>
                      <button
                        className={`flex items-center justify-between w-full text-left ${
                          selectedCategory === category.id
                            ? "text-primary font-medium"
                            : "text-gray-700 hover:text-primary"
                        }`}
                        onClick={() => handleCategoryFilter(category.id)}
                      >
                        <span>{category.name}</span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {category.count}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Newsletter Signup */}
          <Card className="bg-primary bg-opacity-10 p-6 rounded-lg shadow-md">
            <CardContent className="p-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscribe to Newsletter</h3>
              <p className="text-gray-600 mb-4">Get the latest articles and news delivered to your inbox.</p>
              <form className="space-y-4">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="w-full"
                />
                <Button className="w-full">
                  Subscribe
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Blog;

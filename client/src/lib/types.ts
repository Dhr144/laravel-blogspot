// Extended types for the client-side application

// Post with additional relationships
export interface PostWithRelations {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categoryId: number;
  userId: number;
  image?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  readTime: number;
  
  // Relations
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  author?: {
    id: number;
    name: string;
    username: string;
    avatar?: string;
  };
}

// Comment with author information
export interface CommentWithAuthor {
  id: number;
  content: string;
  userId: number;
  postId: number;
  createdAt: Date;
  
  // Relations
  author?: {
    id: number;
    name: string;
    username: string;
    avatar?: string;
  };
}

// Authentication types
export interface AuthUser {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  name: string;
  email: string;
  avatar?: string;
}

// Pagination type
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

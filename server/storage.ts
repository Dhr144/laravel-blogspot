import {
  users, categories, posts, comments,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Post, type InsertPost,
  type Comment, type InsertComment
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Post operations
  getAllPosts(options?: { published?: boolean }): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getPostsByCategory(categoryId: number, options?: { published?: boolean }): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Comment operations
  getCommentsByPost(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private postIdCounter: number;
  private commentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.posts = new Map();
    this.comments = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.postIdCounter = 1;
    this.commentIdCounter = 1;
    
    // Initialize with some default data
    this.initializeDefaultData();
  }

  // USER OPERATIONS
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // CATEGORY OPERATIONS
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...insertCategory, id, count: 0 };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, categoryUpdate: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryUpdate };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // POST OPERATIONS
  async getAllPosts(options?: { published?: boolean }): Promise<Post[]> {
    let allPosts = Array.from(this.posts.values());
    
    if (options?.published !== undefined) {
      allPosts = allPosts.filter(post => post.published === options.published);
    }
    
    // Sort by creation date (newest first)
    return allPosts.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(
      (post) => post.slug === slug
    );
  }

  async getPostsByCategory(categoryId: number, options?: { published?: boolean }): Promise<Post[]> {
    let filteredPosts = Array.from(this.posts.values()).filter(
      (post) => post.categoryId === categoryId
    );
    
    if (options?.published !== undefined) {
      filteredPosts = filteredPosts.filter(post => post.published === options.published);
    }
    
    // Sort by creation date (newest first)
    return filteredPosts.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const now = new Date();
    
    const post: Post = { 
      ...insertPost, 
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.posts.set(id, post);
    
    // Update the count for the category
    const category = this.categories.get(post.categoryId);
    if (category) {
      this.categories.set(category.id, {
        ...category,
        count: category.count + 1
      });
    }
    
    return post;
  }

  async updatePost(id: number, postUpdate: Partial<InsertPost>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    // If we're changing categories, update the counts
    if (postUpdate.categoryId && postUpdate.categoryId !== post.categoryId) {
      // Decrease old category count
      const oldCategory = this.categories.get(post.categoryId);
      if (oldCategory) {
        this.categories.set(oldCategory.id, {
          ...oldCategory,
          count: oldCategory.count - 1
        });
      }
      
      // Increase new category count
      const newCategory = this.categories.get(postUpdate.categoryId);
      if (newCategory) {
        this.categories.set(newCategory.id, {
          ...newCategory,
          count: newCategory.count + 1
        });
      }
    }
    
    const updatedPost = { 
      ...post, 
      ...postUpdate,
      updatedAt: new Date()
    };
    
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    const post = this.posts.get(id);
    if (!post) return false;
    
    // Update the count for the category
    const category = this.categories.get(post.categoryId);
    if (category) {
      this.categories.set(category.id, {
        ...category,
        count: Math.max(0, category.count - 1)
      });
    }
    
    // Delete all comments for this post
    for (const comment of Array.from(this.comments.values())) {
      if (comment.postId === id) {
        this.comments.delete(comment.id);
      }
    }
    
    return this.posts.delete(id);
  }

  // COMMENT OPERATIONS
  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const comment: Comment = { 
      ...insertComment, 
      id,
      createdAt: new Date()
    };
    
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Initialize with some default data for testing
  private async initializeDefaultData() {
    // Create admin user
    const adminUser = await this.createUser({
      username: "admin",
      password: "admin123",
      name: "Admin User",
      email: "admin@example.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });

    // Create some authors
    const jamesWilson = await this.createUser({
      username: "james",
      password: "james123",
      name: "James Wilson",
      email: "james@example.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    const emilyChen = await this.createUser({
      username: "emily",
      password: "emily123",
      name: "Emily Chen",
      email: "emily@example.com",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    const michaelRodriguez = await this.createUser({
      username: "michael",
      password: "michael123",
      name: "Michael Rodriguez",
      email: "michael@example.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });

    // Create categories
    const technology = await this.createCategory({
      name: "Technology",
      slug: "technology"
    });
    
    const design = await this.createCategory({
      name: "Design",
      slug: "design"
    });
    
    const tutorial = await this.createCategory({
      name: "Tutorial",
      slug: "tutorial"
    });
    
    const development = await this.createCategory({
      name: "Development",
      slug: "development"
    });
    
    const database = await this.createCategory({
      name: "Database",
      slug: "database"
    });

    // Create some posts
    await this.createPost({
      title: "The Future of Web Development with Laravel",
      slug: "future-web-development-laravel",
      content: `
        <p>Laravel has become one of the most popular PHP frameworks for web development. With its elegant syntax and powerful features, it's transforming how developers build web applications.</p>
        <p>In this article, we'll explore the future of web development with Laravel and how it continues to evolve to meet the changing needs of the modern web landscape.</p>
        <h2>Why Laravel Stands Out</h2>
        <p>Laravel's approach to web development emphasizes developer happiness without sacrificing application functionality. Here are some key reasons why Laravel has become a favorite among developers:</p>
        <ul>
          <li>Elegant syntax that makes coding enjoyable</li>
          <li>Robust ecosystem with ready-to-use packages</li>
          <li>Built-in authentication and authorization</li>
          <li>Powerful ORM (Eloquent) for database interactions</li>
          <li>Comprehensive documentation and active community</li>
        </ul>
        <h2>Recent Innovations</h2>
        <p>Laravel continues to evolve with each new release, introducing features that make development faster and more efficient:</p>
        <p>Laravel Jetstream provides a beautifully designed application scaffolding for Laravel that includes login, registration, email verification, two-factor authentication, session management, API support via Laravel Sanctum, and optional team management.</p>
        <p>Laravel Livewire allows developers to build dynamic interfaces without leaving the comfort of Laravel, making it easier to create reactive, modern applications without writing JavaScript.</p>
        <h2>The Future Looks Bright</h2>
        <p>As web development continues to evolve, Laravel is well-positioned to adapt and lead. The framework's focus on developer experience, combined with its powerful features and robust ecosystem, ensures it will remain a top choice for web developers for years to come.</p>
        <p>Whether you're building a simple blog or a complex enterprise application, Laravel provides the tools and flexibility you need to succeed.</p>
      `,
      excerpt: "Laravel has become one of the most popular PHP frameworks for web development. Here's why it's transforming the industry...",
      categoryId: technology.id,
      userId: jamesWilson.id,
      image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      published: true,
      readTime: 10
    });

    await this.createPost({
      title: "Mastering Tailwind CSS for Modern Interfaces",
      slug: "mastering-tailwind-css-modern-interfaces",
      content: `
        <p>Tailwind CSS has revolutionized the way developers approach web design and styling by offering a utility-first CSS framework that enables rapid UI development without leaving your HTML.</p>
        <p>In this comprehensive guide, we'll dive deep into how you can leverage Tailwind CSS to create beautiful, responsive user interfaces with minimal effort.</p>
        <h2>Why Utility-First CSS?</h2>
        <p>Unlike traditional CSS frameworks, Tailwind doesn't provide predefined components. Instead, it gives you low-level utility classes that let you build completely custom designs without ever leaving your HTML. Here's why this approach is gaining popularity:</p>
        <ul>
          <li>No more naming CSS classes or writing custom CSS</li>
          <li>Faster development with pre-designed utilities</li>
          <li>More consistent designs through constraint-based design tokens</li>
          <li>Smaller file sizes in production with PurgeCSS integration</li>
        </ul>
        <h2>Getting Started</h2>
        <p>To start using Tailwind, you simply need to include it in your project and begin applying its utility classes to your HTML elements:</p>
        <p>The beauty of Tailwind is how intuitive the class names are. Want to add padding? Use 'p-4'. Need a specific margin? Try 'm-2'. Want to align text? 'text-center' has you covered.</p>
        <h2>Responsive Design Made Easy</h2>
        <p>Tailwind makes responsive design remarkably straightforward with its responsive modifiers:</p>
        <p>By prefixing utilities with responsive breakpoints (sm:, md:, lg:, xl:, 2xl:), you can build fully responsive interfaces without ever writing a single media query.</p>
        <h2>Customization</h2>
        <p>While Tailwind provides excellent defaults, its true power lies in customization. You can tailor everything from colors and spacing to typography and breakpoints through a simple configuration file.</p>
        <h2>Conclusion</h2>
        <p>Tailwind CSS offers a fresh approach to styling that can significantly speed up your development workflow. By embracing its utility-first philosophy, you'll find yourself creating beautiful, responsive interfaces more efficiently than ever before.</p>
      `,
      excerpt: "Tailwind CSS has changed how developers approach styling. Learn how to create beautiful, responsive interfaces...",
      categoryId: design.id,
      userId: emilyChen.id,
      image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      published: true,
      readTime: 7
    });

    await this.createPost({
      title: "Building a CRUD Application with Laravel",
      slug: "building-crud-application-laravel",
      content: `
        <p>Creating CRUD (Create, Read, Update, Delete) applications is a fundamental skill for web developers. Laravel provides a robust framework that simplifies this process significantly.</p>
        <p>In this step-by-step tutorial, we'll build a complete CRUD application from scratch using Laravel and modern front-end tools.</p>
        <h2>Setting Up Your Project</h2>
        <p>First, let's create a new Laravel project. Open your terminal and run:</p>
        <pre><code>composer create-project laravel/laravel crud-app
cd crud-app</code></pre>
        <p>Next, configure your database connection in the .env file:</p>
        <pre><code>DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password</code></pre>
        <h2>Creating the Model and Migration</h2>
        <p>Let's create a model for our application. For this tutorial, we'll build a simple blog post system:</p>
        <pre><code>php artisan make:model Post -m</code></pre>
        <p>This command creates both a Post model and a migration file. Open the migration file and define the schema:</p>
        <h2>Building the Controllers</h2>
        <p>Now, let's create a controller to handle our CRUD operations:</p>
        <pre><code>php artisan make:controller PostController --resource</code></pre>
        <p>This creates a controller with all the necessary methods for CRUD operations.</p>
        <h2>Creating the Views</h2>
        <p>Laravel uses Blade as its templating engine. Let's create the views we need for our CRUD application:</p>
        <h2>Defining Routes</h2>
        <p>Open routes/web.php and define the routes for our application:</p>
        <h2>Testing Your Application</h2>
        <p>Now that everything is set up, let's run the migrations and start the development server:</p>
        <pre><code>php artisan migrate
php artisan serve</code></pre>
        <p>Visit http://localhost:8000/posts to see your CRUD application in action!</p>
        <h2>Conclusion</h2>
        <p>You've successfully built a basic CRUD application with Laravel. This foundation can be extended with authentication, validation, and more advanced features as your application grows.</p>
      `,
      excerpt: "A step-by-step guide to creating a robust CRUD application using Laravel and modern front-end tools...",
      categoryId: tutorial.id,
      userId: michaelRodriguez.id,
      image: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      published: true,
      readTime: 15
    });

    await this.createPost({
      title: "Laravel 10: What's New and Improved",
      slug: "laravel-10-whats-new-improved",
      content: `
        <p>Laravel 10 introduces several exciting features and improvements that enhance the developer experience. In this article, we'll explore the most significant changes and how they can benefit your projects.</p>
        <h2>Key Features and Improvements</h2>
        <p>Laravel 10 brings numerous enhancements to the framework. Here are some of the highlights:</p>
        <h3>1. Improved Process Handling</h3>
        <p>Laravel 10 extends the Process facade with new capabilities for running shell commands, making it easier to manage external processes in your applications.</p>
        <h3>2. New Authentication Scaffolding</h3>
        <p>The authentication system has been revamped with improved features and a more intuitive API.</p>
        <h3>3. Better Testing Tools</h3>
        <p>Laravel 10 introduces new testing helpers and assertions that make writing and maintaining tests even more straightforward.</p>
        <h3>4. Performance Optimizations</h3>
        <p>Various performance improvements have been made throughout the framework, resulting in faster application execution.</p>
        <h2>Upgrading to Laravel 10</h2>
        <p>Upgrading from Laravel 9 to Laravel 10 is straightforward for most applications. Here's a brief guide to get you started:</p>
        <p>First, update your composer.json file to require Laravel 10:</p>
        <pre><code>"require": {
    "php": "^8.1",
    "laravel/framework": "^10.0"
}</code></pre>
        <p>Then run the update command:</p>
        <pre><code>composer update</code></pre>
        <h2>Conclusion</h2>
        <p>Laravel 10 continues the tradition of providing developers with an elegant and efficient framework for web application development. The new features and improvements make it worth upgrading from previous versions.</p>
        <p>Whether you're building a new project or maintaining an existing one, Laravel 10 offers tools and capabilities that can enhance your development workflow and application performance.</p>
      `,
      excerpt: "Laravel 10 introduces several exciting features and improvements that enhance the developer experience. In this article, we'll explore the most significant changes and how they can benefit your projects.",
      categoryId: development.id,
      userId: michaelRodriguez.id,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      published: true,
      readTime: 12
    });

    await this.createPost({
      title: "Optimizing Database Queries in Laravel Applications",
      slug: "optimizing-database-queries-laravel",
      content: `
        <p>Database performance is crucial for application responsiveness. In this comprehensive guide, we'll explore practical techniques for optimizing Eloquent queries and database operations in Laravel to build faster applications.</p>
        <h2>Understanding Query Performance</h2>
        <p>Before diving into optimization techniques, it's essential to understand how Laravel's Eloquent ORM generates and executes SQL queries. Let's start by exploring the tools available for query analysis:</p>
        <h3>Query Logging and Analysis</h3>
        <p>Laravel provides several ways to log and analyze queries:</p>
        <pre><code>// Enable query logging
DB::enableQueryLog();

// Your queries here
User::where('active', true)->get();

// Get the executed queries
$queries = DB::getQueryLog();</code></pre>
        <h2>Common Performance Issues and Solutions</h2>
        <h3>1. N+1 Query Problem</h3>
        <p>One of the most common performance issues in ORM-based applications is the N+1 query problem. This occurs when you retrieve a collection of models and then access a relationship on each model, causing a separate query for each model.</p>
        <p><strong>Solution: Eager Loading</strong></p>
        <pre><code>// Instead of this (causes N+1 problem)
$posts = Post::all();
foreach ($posts as $post) {
    echo $post->user->name;
}

// Do this (eager loading)
$posts = Post::with('user')->get();
foreach ($posts as $post) {
    echo $post->user->name;
}</code></pre>
        <h3>2. Selecting Only Necessary Columns</h3>
        <p>By default, Eloquent selects all columns (*) from a table. For large tables, this can be inefficient when you only need specific columns.</p>
        <pre><code>// Instead of
$users = User::all();

// Do this
$users = User::select('id', 'name', 'email')->get();</code></pre>
        <h3>3. Optimizing Pagination</h3>
        <p>When working with large datasets, efficient pagination is crucial:</p>
        <pre><code>// Using cursor pagination for better performance with large datasets
$users = User::orderBy('id')->cursorPaginate(15);</code></pre>
        <h2>Indexing Strategies</h2>
        <p>Proper database indexing is one of the most effective ways to improve query performance:</p>
        <pre><code>// Example migration adding indexes
Schema::table('posts', function (Blueprint $table) {
    $table->index('user_id');
    $table->index(['status', 'created_at']);
});</code></pre>
        <h2>Caching Strategies</h2>
        <p>Laravel provides a robust caching system that can dramatically improve performance for read-heavy operations:</p>
        <pre><code>// Cache query results
$users = Cache::remember('users', 3600, function () {
    return User::all();
});</code></pre>
        <h2>Conclusion</h2>
        <p>Optimizing database queries is a crucial aspect of building high-performance Laravel applications. By understanding how Eloquent works and implementing these optimization techniques, you can significantly improve your application's responsiveness and user experience.</p>
        <p>Remember that premature optimization can lead to unnecessary complexity. Always measure and profile your application to identify actual bottlenecks before implementing optimizations.</p>
      `,
      excerpt: "Database performance is crucial for application responsiveness. Learn practical techniques for optimizing Eloquent queries and database operations in Laravel to build faster applications.",
      categoryId: database.id,
      userId: jamesWilson.id,
      image: "https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      published: true,
      readTime: 10
    });

    // Add comments
    await this.createComment({
      content: "I've been using Laravel for about 3 years now and it keeps getting better. The community is fantastic and the documentation is top-notch!",
      userId: michaelRodriguez.id,
      postId: 1
    });

    await this.createComment({
      content: "Great article! I'm just getting started with Laravel and this gives me a good overview of what to expect in the future.",
      userId: emilyChen.id,
      postId: 1
    });
  }
}



// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values({ ...insertCategory, count: 0 })
      .returning();
    return category;
  }

  async updateCategory(id: number, categoryUpdate: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(categoryUpdate)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }
  
  // Post operations
  async getAllPosts(options?: { published?: boolean }): Promise<Post[]> {
    let query = db.select().from(posts);
    
    if (options?.published !== undefined) {
      query = query.where(eq(posts.published, options.published));
    }
    
    return await query.orderBy(desc(posts.createdAt));
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post || undefined;
  }

  async getPostsByCategory(categoryId: number, options?: { published?: boolean }): Promise<Post[]> {
    let query = db.select().from(posts).where(eq(posts.categoryId, categoryId));
    
    if (options?.published !== undefined) {
      query = query.where(eq(posts.published, options.published));
    }
    
    return await query.orderBy(desc(posts.createdAt));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const now = new Date();
    const [post] = await db
      .insert(posts)
      .values({
        ...insertPost,
        createdAt: now,
        updatedAt: now
      })
      .returning();
      
    // Update category count
    await db
      .update(categories)
      .set({ count: db.select({ value: categories.count }).from(categories).where(eq(categories.id, insertPost.categoryId)).then(rows => (rows[0]?.value || 0) + 1) })
      .where(eq(categories.id, insertPost.categoryId));
      
    return post;
  }

  async updatePost(id: number, postUpdate: Partial<InsertPost>): Promise<Post | undefined> {
    const originalPost = await this.getPostById(id);
    if (!originalPost) return undefined;
    
    const [updatedPost] = await db
      .update(posts)
      .set({
        ...postUpdate,
        updatedAt: new Date()
      })
      .where(eq(posts.id, id))
      .returning();
      
    // If category changed, update category counts
    if (postUpdate.categoryId && postUpdate.categoryId !== originalPost.categoryId) {
      // Decrease count for old category
      await db
        .update(categories)
        .set({ count: db.select({ value: categories.count }).from(categories).where(eq(categories.id, originalPost.categoryId)).then(rows => Math.max((rows[0]?.value || 0) - 1, 0)) })
        .where(eq(categories.id, originalPost.categoryId));
        
      // Increase count for new category
      await db
        .update(categories)
        .set({ count: db.select({ value: categories.count }).from(categories).where(eq(categories.id, postUpdate.categoryId)).then(rows => (rows[0]?.value || 0) + 1) })
        .where(eq(categories.id, postUpdate.categoryId));
    }
    
    return updatedPost || undefined;
  }

  async deletePost(id: number): Promise<boolean> {
    const post = await this.getPostById(id);
    if (!post) return false;
    
    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    
    if (result.length > 0) {
      // Update category count
      await db
        .update(categories)
        .set({ count: db.select({ value: categories.count }).from(categories).where(eq(categories.id, post.categoryId)).then(rows => Math.max((rows[0]?.value || 0) - 1, 0)) })
        .where(eq(categories.id, post.categoryId));
        
      // Delete associated comments
      await db.delete(comments).where(eq(comments.postId, id));
      
      return true;
    }
    
    return false;
  }
  
  // Comment operations
  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({
        ...insertComment,
        createdAt: new Date()
      })
      .returning();
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();

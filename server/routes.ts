import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertCategorySchema, insertCommentSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // All API routes
  const apiRouter = '/api';

  // User routes
  app.post(`${apiRouter}/auth/login`, async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't send the password back
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiRouter}/auth/register`, async (req: Request, res: Response) => {
    try {
      const userInput = insertUserSchema.safeParse(req.body);
      
      if (!userInput.success) {
        return res.status(400).json({ 
          message: "Invalid user data",
          errors: userInput.error.format() 
        });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userInput.data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userInput.data);
      
      // Don't send the password back
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Category routes
  app.get(`${apiRouter}/categories`, async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiRouter}/categories/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(200).json(category);
    } catch (error) {
      console.error("Get category error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiRouter}/categories`, async (req: Request, res: Response) => {
    try {
      const categoryInput = insertCategorySchema.safeParse(req.body);
      
      if (!categoryInput.success) {
        return res.status(400).json({ 
          message: "Invalid category data",
          errors: categoryInput.error.format() 
        });
      }
      
      const category = await storage.createCategory(categoryInput.data);
      return res.status(201).json(category);
    } catch (error) {
      console.error("Create category error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(`${apiRouter}/categories/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      // Partial validation of the category update
      const categoryInput = insertCategorySchema.partial().safeParse(req.body);
      
      if (!categoryInput.success) {
        return res.status(400).json({ 
          message: "Invalid category data",
          errors: categoryInput.error.format() 
        });
      }
      
      const updatedCategory = await storage.updateCategory(id, categoryInput.data);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(200).json(updatedCategory);
    } catch (error) {
      console.error("Update category error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(`${apiRouter}/categories/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const deleted = await storage.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      console.error("Delete category error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Post routes
  app.get(`${apiRouter}/posts`, async (req: Request, res: Response) => {
    try {
      const published = req.query.published !== undefined 
        ? req.query.published === 'true' 
        : undefined;
      
      const posts = await storage.getAllPosts({ published });
      return res.status(200).json(posts);
    } catch (error) {
      console.error("Get posts error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get(`${apiRouter}/posts/category/:categoryId`, async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const published = req.query.published !== undefined 
        ? req.query.published === 'true' 
        : undefined;
      
      const posts = await storage.getPostsByCategory(categoryId, { published });
      return res.status(200).json(posts);
    } catch (error) {
      console.error("Get posts by category error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiRouter}/posts/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getPostById(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      return res.status(200).json(post);
    } catch (error) {
      console.error("Get post error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get(`${apiRouter}/posts/slug/:slug`, async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      
      if (!slug) {
        return res.status(400).json({ message: "Invalid post slug" });
      }
      
      const post = await storage.getPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      return res.status(200).json(post);
    } catch (error) {
      console.error("Get post by slug error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiRouter}/posts`, async (req: Request, res: Response) => {
    try {
      console.log("Received post request body:", JSON.stringify(req.body));
      
      // Parse the post data
      const postInput = insertPostSchema.safeParse(req.body);
      
      if (!postInput.success) {
        console.error("Post validation failed:", postInput.error.format());
        return res.status(400).json({ 
          message: "Invalid post data",
          errors: postInput.error.format() 
        });
      }
      
      // Check if category exists
      const category = await storage.getCategoryById(postInput.data.categoryId);
      if (!category) {
        return res.status(400).json({ message: "Category not found" });
      }
      
      // Check if user exists
      const user = await storage.getUser(postInput.data.userId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      
      // Create the post
      const post = await storage.createPost(postInput.data);
      console.log("Post created successfully:", post);
      return res.status(201).json(post);
    } catch (error) {
      console.error("Create post error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(`${apiRouter}/posts/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Partial validation of the post update
      const postInput = insertPostSchema.partial().safeParse(req.body);
      
      if (!postInput.success) {
        return res.status(400).json({ 
          message: "Invalid post data",
          errors: postInput.error.format() 
        });
      }
      
      // If categoryId is provided, check if it exists
      if (postInput.data.categoryId) {
        const category = await storage.getCategoryById(postInput.data.categoryId);
        if (!category) {
          return res.status(400).json({ message: "Category not found" });
        }
      }
      
      const updatedPost = await storage.updatePost(id, postInput.data);
      
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      return res.status(200).json(updatedPost);
    } catch (error) {
      console.error("Update post error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(`${apiRouter}/posts/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const deleted = await storage.deletePost(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      console.error("Delete post error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Comment routes
  app.get(`${apiRouter}/posts/:postId/comments`, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const comments = await storage.getCommentsByPost(postId);
      return res.status(200).json(comments);
    } catch (error) {
      console.error("Get comments error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiRouter}/comments`, async (req: Request, res: Response) => {
    try {
      const commentInput = insertCommentSchema.safeParse(req.body);
      
      if (!commentInput.success) {
        return res.status(400).json({ 
          message: "Invalid comment data",
          errors: commentInput.error.format() 
        });
      }
      
      // Check if post exists
      const post = await storage.getPostById(commentInput.data.postId);
      if (!post) {
        return res.status(400).json({ message: "Post not found" });
      }
      
      // Check if user exists
      const user = await storage.getUser(commentInput.data.userId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      
      const comment = await storage.createComment(commentInput.data);
      return res.status(201).json(comment);
    } catch (error) {
      console.error("Create comment error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(`${apiRouter}/comments/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }
      
      const deleted = await storage.deleteComment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      console.error("Delete comment error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

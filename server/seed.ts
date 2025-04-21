import { db } from "./db";
import { users, categories, posts, comments } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Check if data already exists
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log("Database already has data, skipping seed.");
    return;
  }

  // Create users
  console.log("Creating users...");
  const [adminUser] = await db.insert(users).values({
    username: "admin",
    password: "admin123",
    name: "Admin User",
    email: "admin@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }).returning();

  const [jamesWilson] = await db.insert(users).values({
    username: "james",
    password: "james123",
    name: "James Wilson",
    email: "james@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }).returning();

  const [emilyChen] = await db.insert(users).values({
    username: "emily",
    password: "emily123",
    name: "Emily Chen",
    email: "emily@example.com",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }).returning();

  const [michaelRodriguez] = await db.insert(users).values({
    username: "michael",
    password: "michael123",
    name: "Michael Rodriguez",
    email: "michael@example.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }).returning();

  // Create categories
  console.log("Creating categories...");
  const [technology] = await db.insert(categories).values({
    name: "Technology",
    slug: "technology"
  }).returning();

  const [design] = await db.insert(categories).values({
    name: "Design",
    slug: "design"
  }).returning();

  const [tutorial] = await db.insert(categories).values({
    name: "Tutorial",
    slug: "tutorial"
  }).returning();

  const [development] = await db.insert(categories).values({
    name: "Development",
    slug: "development"
  }).returning();

  const [database] = await db.insert(categories).values({
    name: "Database",
    slug: "database"
  }).returning();

  // Create posts
  console.log("Creating posts...");
  const [post1] = await db.insert(posts).values({
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
  }).returning();

  const [post2] = await db.insert(posts).values({
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
  }).returning();

  // Create comments
  console.log("Creating comments...");
  await db.insert(comments).values({
    content: "Great article! Laravel is definitely my go-to framework for PHP development.",
    userId: emilyChen.id,
    postId: post1.id
  });

  await db.insert(comments).values({
    content: "I've been using Laravel for years and completely agree with all your points. The ecosystem keeps getting better!",
    userId: michaelRodriguez.id,
    postId: post1.id
  });

  await db.insert(comments).values({
    content: "Tailwind has completely changed my approach to CSS. I don't think I could go back to traditional frameworks now.",
    userId: jamesWilson.id,
    postId: post2.id
  });

  console.log("✅ Database seeded successfully!");
}

// Run the seed function
seed()
  .catch(e => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(() => {
    console.log("Done seeding.");
    process.exit(0);
  });
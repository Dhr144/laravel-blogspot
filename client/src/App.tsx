import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Blog from "@/pages/blog";
import Post from "@/pages/post";
import Dashboard from "@/pages/admin/dashboard";
import CreatePost from "@/pages/admin/create-post";
import EditPost from "@/pages/admin/edit-post";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={Post} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected admin routes */}
      <ProtectedRoute path="/admin" component={Dashboard} />
      <ProtectedRoute path="/admin/create" component={CreatePost} />
      <ProtectedRoute path="/admin/edit/:id" component={EditPost} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;

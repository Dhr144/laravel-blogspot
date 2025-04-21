import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, LogOut, Menu, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  // Public navigation links
  const publicNavLinks = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ];
  
  // Protected navigation links (only shown when logged in)
  const protectedNavLinks = [
    { name: "Admin", path: "/admin" },
  ];
  
  // Display admin links only if logged in
  const navLinks = user 
    ? [...publicNavLinks, ...protectedNavLinks]
    : publicNavLinks;

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const closeSheet = () => setIsOpen(false);
  
  // Function to handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return "?";
    return user.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary font-bold text-2xl cursor-pointer">BlogWave</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Desktop menu */}
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <div
                    className={`${
                      isActive(link.path)
                        ? "border-primary text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer`}
                  >
                    {link.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Desktop authentication menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <div className="flex w-full cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                    {logoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="pt-2 pb-3 space-y-1">
                  {navLinks.map((link) => (
                    <Link key={link.path} href={link.path}>
                      <div
                        className={`${
                          isActive(link.path)
                            ? "bg-gray-50 border-primary text-primary"
                            : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                        } block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer`}
                        onClick={closeSheet}
                      >
                        {link.name}
                      </div>
                    </Link>
                  ))}
                </div>
                
                {/* Mobile authentication menu */}
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="mt-3 space-y-1">
                    {user ? (
                      <>
                        <div className="px-4 py-2">
                          <p className="text-sm font-medium text-gray-500">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        </div>
                        <Button
                          variant="ghost" 
                          className="w-full justify-start pl-3 text-red-600"
                          onClick={() => {
                            handleLogout();
                            closeSheet();
                          }}
                          disabled={logoutMutation.isPending}
                        >
                          {logoutMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span>Logging out...</span>
                            </>
                          ) : (
                            <>
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Logout</span>
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <Link href="/auth">
                        <Button className="w-full justify-start" onClick={closeSheet}>
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Package, LayoutDashboard, LogOut, Store, ClipboardList, Search, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isBuyer = user?.role === "BUYER";
  const isSeller = user?.role === "SELLER";

  const navLink = (to: string, label: string, Icon: React.FC<{ size?: number; className?: string }>) => (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium transition-colors px-1 py-0.5",
        location.pathname === to
          ? "text-green-700 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
          : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 border-b-2 border-transparent"
      )}
    >
      <Icon size={15} />
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#1a1a24] border-b border-gray-200 dark:border-white/10 shadow-sm transition-colors duration-200">
      {/* Top bar */}
      <div className="bg-green-700 text-white text-xs text-center py-1.5 px-4">
        🚚 Free delivery on orders above ₹500 &nbsp;|&nbsp; 7-day easy returns
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <Store size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-slate-100 text-lg tracking-tight hidden sm:block">
              Amrit<span className="text-green-600 dark:text-green-400">Shop</span>
            </span>
          </Link>

          {/* Search bar (buyers only) */}
          {isBuyer && (
            <div className="flex-1 max-w-xl hidden sm:flex items-center">
              <div className="relative w-full">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Search for products, brands and more..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-md bg-gray-50 dark:bg-white/5 dark:text-slate-300 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-white/10 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                  onClick={() => navigate("/products")}
                  readOnly
                />
              </div>
            </div>
          )}

          {isSeller && <div className="flex-1" />}
          {!isAuthenticated && <div className="flex-1" />}

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              className="p-1.5 rounded-md text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Nav links */}
                <div className="hidden md:flex items-center gap-4">
                  {isBuyer && (
                    <>
                      {navLink("/products", "Shop", Package)}
                      {navLink("/orders", "Orders", ClipboardList)}
                    </>
                  )}
                  {isSeller && (
                    <>
                      {navLink("/seller/dashboard", "Dashboard", LayoutDashboard)}
                      {navLink("/seller/products", "Products", Package)}
                      {navLink("/seller/orders", "Orders", ClipboardList)}
                    </>
                  )}
                </div>

                {/* Cart (buyer) */}
                {isBuyer && (
                  <Link
                    to="/cart"
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      location.pathname === "/cart"
                        ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10"
                    )}
                  >
                    <ShoppingCart size={18} />
                    <span className="hidden sm:block">Cart</span>
                  </Link>
                )}

                {/* User */}
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-white/10">
                  <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold text-white">
                    {user?.firstName?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-medium text-gray-900 dark:text-slate-200 leading-none">{user?.firstName}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 leading-none mt-0.5">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-1.5 rounded-md text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer ml-1"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Log In</Button>
                <Button size="sm" onClick={() => navigate("/register")}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Navbar } from "@/components/Navbar";
import AuthPage from "@/pages/AuthPage";
import ProductsPage from "@/pages/buyer/ProductsPage";
import ProductDetailPage from "@/pages/buyer/ProductDetailPage";
import CartPage from "@/pages/buyer/CartPage";
import CheckoutPage from "@/pages/buyer/CheckoutPage";
import OrdersPage from "@/pages/buyer/OrdersPage";
import SellerDashboard from "@/pages/seller/SellerDashboard";
import SellerProductsPage from "@/pages/seller/SellerProductsPage";
import SellerOrdersPage from "@/pages/seller/SellerOrdersPage";
import type { ReactNode } from "react";

function ProtectedRoute({ children, role }: { children: ReactNode; role?: "BUYER" | "SELLER" }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === "SELLER" ? "/seller/dashboard" : "/products"} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13] transition-colors duration-200">
      <Navbar />
      <main>
        <Routes>
          {/* Root redirect */}
          <Route
            path="/"
            element={
              isAuthenticated
                ? <Navigate to={user?.role === "SELLER" ? "/seller/dashboard" : "/products"} replace />
                : <Navigate to="/login" replace />
            }
          />

          {/* Auth */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />

          {/* Buyer routes */}
          <Route path="/products" element={<ProtectedRoute role="BUYER"><ProductsPage /></ProtectedRoute>} />
          <Route path="/products/:id" element={<ProtectedRoute role="BUYER"><ProductDetailPage /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute role="BUYER"><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute role="BUYER"><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute role="BUYER"><OrdersPage /></ProtectedRoute>} />

          {/* Seller routes */}
          <Route path="/seller/dashboard" element={<ProtectedRoute role="SELLER"><SellerDashboard /></ProtectedRoute>} />
          <Route path="/seller/products" element={<ProtectedRoute role="SELLER"><SellerProductsPage /></ProtectedRoute>} />
          <Route path="/seller/orders" element={<ProtectedRoute role="SELLER"><SellerOrdersPage /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

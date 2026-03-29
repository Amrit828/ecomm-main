import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { cartApi, type Cart } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator, Spinner } from "@/components/ui/Misc";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      const data = await cartApi.getMyCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleReduce = async (productId: string) => {
    setUpdatingId(productId);
    try {
      const updated = await cartApi.reduceItem(productId, 1);
      setCart(updated);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAdd = async (productId: string) => {
    setUpdatingId(productId);
    try {
      const updated = await cartApi.addItem(productId, 1);
      setCart(updated);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-6">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🛒</p>
          <p className="text-xl font-medium text-gray-700 dark:text-slate-300 mb-2">Your cart is empty</p>
          <p className="text-gray-400 dark:text-slate-500 mb-6">Add products from the marketplace</p>
          <Button onClick={() => navigate("/products")}>Browse Products</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <Card key={item.productId} className="hover:border-green-200 dark:hover:border-violet-700/30 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-green-50 dark:bg-gradient-to-br dark:from-violet-900/40 dark:to-purple-900/20 flex items-center justify-center text-2xl flex-shrink-0">
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-slate-100 text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">₹{item.price.toLocaleString()} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReduce(item.productId)}
                      disabled={updatingId === item.productId}
                      className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-slate-200">
                      {updatingId === item.productId ? "..." : item.quantity}
                    </span>
                    <button
                      onClick={() => handleAdd(item.productId)}
                      disabled={updatingId === item.productId}
                      className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-slate-100 text-sm w-20 text-right">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-slate-400 truncate max-w-[160px]">{item.productName} ×{item.quantity}</span>
                    <span className="text-gray-700 dark:text-slate-300">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span className="text-gray-900 dark:text-slate-200">Total</span>
                  <span className="text-green-600 dark:text-violet-400">₹{cart?.totalPrice.toLocaleString()}</span>
                </div>
                <Button
                  className="w-full mt-2"
                  size="lg"
                  onClick={() => navigate("/checkout")}
                >
                  <ShoppingBag size={16} />
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

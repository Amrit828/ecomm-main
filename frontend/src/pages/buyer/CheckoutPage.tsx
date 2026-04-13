import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CheckCircle } from "lucide-react";
import { cartApi, orderApi, type Cart } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label, Separator } from "@/components/ui/Misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    cartApi.getMyCart().then(setCart).catch(() => {});
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError("Please enter a shipping address.");
      return;
    }
    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty. Add items before checking out.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await orderApi.placeOrder(address);
      setSuccess(true);
      setTimeout(() => navigate("/orders"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-emerald-700/20 border border-green-300 dark:border-emerald-700/40 flex items-center justify-center mb-5">
          <CheckCircle className="text-green-600 dark:text-emerald-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Order Placed!</h2>
        <p className="text-gray-500 dark:text-slate-400">Redirecting to your orders…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping form */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="address">Delivery Address</Label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                  <Input
                    id="address"
                    placeholder="123 Main St, City, State"
                    className="pl-9"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Place Order
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart?.items.map(item => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">{item.productName} ×{item.quantity}</span>
                <span className="text-gray-700 dark:text-slate-300">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold">
              <span className="text-gray-900 dark:text-slate-200">Total</span>
              <span className="text-green-600 dark:text-violet-400 text-lg">₹{cart?.totalPrice.toLocaleString() ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}

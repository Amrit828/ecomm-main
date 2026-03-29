import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ClipboardList, DollarSign, TrendingUp, ArrowRight, ShoppingBag } from "lucide-react";
import { productApi, orderApi, type Product, type Order } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Misc";

function StatCard({ icon: Icon, label, value, lightColor, darkColor }: {
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  lightColor: string;
  darkColor: string;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${lightColor} dark:hidden`}>
          <Icon size={20} />
        </div>
        <div className={`w-11 h-11 rounded-xl items-center justify-center ${darkColor} hidden dark:flex`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productApi.getAll(), orderApi.getSellerOrders()])
      .then(([allProds, allOrders]) => {
        setProducts(allProds.filter(p => p.sellerId === user?.userId));
        setOrders(allOrders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const myItemsRevenue = orders.reduce((total, order) => {
    const myItems = order.items.filter(it => it.sellerId === user?.userId);
    return total + myItems.reduce((s, it) => s + it.price * it.quantity, 0);
  }, 0);

  const pendingItems = orders.flatMap(o =>
    o.items.filter(it => it.sellerId === user?.userId && it.status === "PENDING")
  ).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
          Welcome back, <span className="text-green-600 dark:text-violet-400">{user?.firstName}</span> 👋
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">Here's what's happening with your store today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="Products" value={loading ? "—" : products.length}
          lightColor="bg-green-100 text-green-600" darkColor="bg-violet-700/20 text-violet-400" />
        <StatCard icon={ClipboardList} label="Total Orders" value={loading ? "—" : orders.length}
          lightColor="bg-blue-100 text-blue-600" darkColor="bg-blue-700/20 text-blue-400" />
        <StatCard icon={DollarSign} label="Revenue" value={loading ? "—" : `₹${myItemsRevenue.toLocaleString()}`}
          lightColor="bg-emerald-100 text-emerald-600" darkColor="bg-emerald-700/20 text-emerald-400" />
        <StatCard icon={TrendingUp} label="Pending Items" value={loading ? "—" : pendingItems}
          lightColor="bg-amber-100 text-amber-600" darkColor="bg-amber-700/20 text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <Card>
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/8">
            <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Recent Products</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/seller/products")} className="gap-1 text-xs">
              View all <ArrowRight size={12} />
            </Button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {!loading && products.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{p.name}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">₹{p.price.toLocaleString()} · {p.stock} in stock</p>
                </div>
                {p.stock === 0
                  ? <Badge variant="danger">Out</Badge>
                  : p.stock <= 5
                  ? <Badge variant="warning">Low</Badge>
                  : <Badge variant="success">Active</Badge>}
              </div>
            ))}
            {!loading && products.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-gray-400 dark:text-slate-500 text-sm">No products yet</p>
                <Button size="sm" className="mt-3" onClick={() => navigate("/seller/products")}>
                  Add Product
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/8">
            <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Recent Orders</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/seller/orders")} className="gap-1 text-xs">
              Fulfill <ArrowRight size={12} />
            </Button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {!loading && orders.slice(0, 4).map(order => {
              const myItems = order.items.filter(it => it.sellerId === user?.userId);
              const rev = myItems.reduce((s, it) => s + it.price * it.quantity, 0);
              const isPending = myItems.some(it => it.status === "PENDING");
              return (
                <div key={order.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200 font-mono">
                      #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{myItems.length} item{myItems.length !== 1 ? "s" : ""} · ₹{rev.toLocaleString()}</p>
                  </div>
                  <Badge variant={isPending ? "warning" : "success"}>
                    {isPending ? "Action needed" : "Fulfilled"}
                  </Badge>
                </div>
              );
            })}
            {!loading && orders.length === 0 && (
              <div className="px-5 py-8 text-center">
                <ShoppingBag size={28} className="mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                <p className="text-gray-400 dark:text-slate-500 text-sm">No orders yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

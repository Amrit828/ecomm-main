import { useState, useEffect } from "react";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import { orderApi, type Order } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, Separator, Spinner } from "@/components/ui/Misc";

function statusVariant(status: string): "default" | "success" | "warning" | "danger" {
  if (status === "DELIVERED") return "success";
  if (status === "SHIPPED") return "warning";
  return "default";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    orderApi.getMyOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">📋</p>
          <p className="text-xl font-medium text-gray-700 dark:text-slate-300 mb-2">No orders yet</p>
          <p className="text-gray-400 dark:text-slate-500">Your completed orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="hover:border-green-200 dark:hover:border-violet-700/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-mono text-gray-500 dark:text-slate-400">
                      #{order.id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-green-600 dark:text-violet-400">
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-all cursor-pointer"
                    >
                      {expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                  <Package size={11} />
                  {order.items.length} item{order.items.length > 1 ? "s" : ""} · {order.shippingAddress}
                </p>
              </CardHeader>

              {expanded === order.id && (
                <CardContent className="pt-0 animate-fade-in">
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.productId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{item.productName}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">Qty: {item.quantity} · ₹{item.price.toLocaleString()} each</p>
                        </div>
                        <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

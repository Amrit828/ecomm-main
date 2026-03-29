import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Truck } from "lucide-react";
import { orderApi, type Order } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, Separator, Spinner } from "@/components/ui/Misc";

const STATUSES = ["PENDING", "SHIPPED", "DELIVERED"] as const;
type Status = typeof STATUSES[number];

function statusVariant(status: string): "default" | "success" | "warning" | "danger" {
  if (status === "DELIVERED") return "success";
  if (status === "SHIPPED") return "warning";
  return "default";
}

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  useEffect(() => {
    orderApi.getSellerOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (orderId: string, productId: string, status: Status) => {
    const key = `${orderId}-${productId}`;
    setUpdatingKey(key);
    try {
      await orderApi.updateItemStatus(orderId, productId, status);
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? { ...o, items: o.items.map(it => it.productId === productId ? { ...it, status } : it) }
            : o
        )
      );
    } finally {
      setUpdatingKey(null);
    }
  };

  const myItems = (order: Order) =>
    order.items.filter(it => it.sellerId === user?.userId);

  const totalRevenue = orders.reduce((sum, o) =>
    sum + myItems(o).reduce((s, it) => s + it.price * it.quantity, 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Order Fulfillment</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            {orders.length} order{orders.length !== 1 ? "s" : ""} containing your products ·{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">₹{totalRevenue.toLocaleString()} revenue</span>
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">📦</p>
          <p className="text-xl font-medium text-gray-700 dark:text-slate-300 mb-2">No orders yet</p>
          <p className="text-gray-400 dark:text-slate-500">Orders containing your products will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const sellersItems = myItems(order);
            return (
              <Card key={order.id} className="hover:border-green-200 dark:hover:border-violet-700/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-mono text-gray-500 dark:text-slate-400">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                        {" · "}{order.shippingAddress}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{sellersItems.reduce((s, it) => s + it.price * it.quantity, 0).toLocaleString()}
                      </span>
                      <button
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-all cursor-pointer"
                      >
                        {expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                </CardHeader>

                {expanded === order.id && (
                  <CardContent className="pt-0 animate-fade-in">
                    <Separator className="my-3" />
                    <div className="space-y-3">
                      {sellersItems.map(item => {
                        const key = `${order.id}-${item.productId}`;
                        const nextStatus: Status =
                          item.status === "PENDING" ? "SHIPPED" :
                          item.status === "SHIPPED" ? "DELIVERED" : "DELIVERED";
                        return (
                          <div key={item.productId} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{item.productName}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">
                                Qty: {item.quantity} · ₹{item.price.toLocaleString()} each
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                              {item.status !== "DELIVERED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  loading={updatingKey === key}
                                  onClick={() => handleUpdateStatus(order.id, item.productId, nextStatus)}
                                  className="gap-1.5 text-xs"
                                >
                                  <Truck size={12} />
                                  Mark {nextStatus}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

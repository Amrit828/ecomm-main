import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { productApi, cartApi, type Product } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge, Spinner } from "@/components/ui/Misc";

function getEmoji(name: string) {
  const n = name.toLowerCase();
  if (n.includes("watch")) return "⌚";
  if (n.includes("keyboard") || n.includes("laptop") || n.includes("phone")) return "💻";
  if (n.includes("book")) return "📚";
  if (n.includes("shoe") || n.includes("shirt") || n.includes("cloth")) return "👗";
  if (n.includes("bag")) return "👜";
  return "📦";
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    productApi.getById(id)
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await cartApi.addItem(product.id, 1);
      showToast(`"${product.name}" added to cart!`);
    } catch {
      showToast("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-xl font-medium text-gray-700 dark:text-slate-300 mb-2">Product not found</p>
        <Button onClick={() => navigate("/products")} className="mt-4">Back to Shop</Button>
      </div>
    );
  }

  const discountedPrice = product.discount && product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-white dark:bg-[#1a1a24] border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 text-sm text-green-700 dark:text-green-400 shadow-lg flex items-center gap-2 animate-slide-down">
          <span>✓</span>{toast}
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => navigate("/products")}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Shop
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="h-80 md:h-full min-h-64 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden">
          {product.imageBase64 ? (
            <img
              src={product.imageBase64}
              alt={product.name}
              className="h-full w-full object-contain p-6"
            />
          ) : (
            <span className="text-8xl">{getEmoji(product.name)}</span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight mb-2">
              {product.name}
            </h1>

            {/* Stock */}
            {product.stock === 0 ? (
              <Badge variant="danger">Out of Stock</Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="warning">Only {product.stock} left!</Badge>
            ) : (
              <Badge variant="success">In Stock · {product.stock} available</Badge>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-bold text-gray-900 dark:text-slate-100">
              ₹{discountedPrice.toLocaleString()}
            </span>
            {product.discount && product.discount > 0 && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-700/20 text-green-700 dark:text-green-400 text-sm font-semibold">
                  {product.discount}% off
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div className="mt-auto pt-2">
            <Button
              size="lg"
              className="w-full sm:w-auto px-10"
              loading={adding}
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={18} />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

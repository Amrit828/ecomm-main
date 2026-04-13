import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Search, SlidersHorizontal, Star } from "lucide-react";
import { productApi, tagApi, cartApi, type Product, type Tag } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
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

export default function ProductsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([productApi.getAll(), tagApi.getAll()])
      .then(([products, tags]) => {
        setProducts(products);
        setFiltered(products);
        setTags(tags);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchesCategory = category === "All" || p.tags?.includes(category) || false;
      return matchesSearch && matchesCategory;
    }));
  }, [search, category, products]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddToCart = async (productId: string, name: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setAddingId(productId);
    try {
      await cartApi.addItem(productId, 1);
      showToast(`"${name}" added to cart!`);
    } catch {
      showToast("Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-white border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 shadow-lg flex items-center gap-2 animate-slide-down">
          <span className="text-green-500">✓</span>{toast}
        </div>
      )}

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Today's Best Deals</h1>
          <p className="text-green-100 mb-4">Discover {products.length}+ products from verified sellers</p>
          <div className="relative max-w-lg">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search products, brands..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg bg-white text-gray-900 placeholder:text-gray-400 outline-none border-0 focus:ring-2 focus:ring-green-300"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Category pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setCategory("All")}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
              category === "All"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700"
            }`}
          >
            All
          </button>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setCategory(tag.name)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                category === tag.name
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700"
              }`}
            >
              {tag.name}
            </button>
          ))}
          <div className="shrink-0 ml-auto">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-gray-200 bg-white text-gray-600 hover:border-gray-300 cursor-pointer">
              <SlidersHorizontal size={13} />
              Sort
            </button>
          </div>
        </div>

        {/* Result count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing <span className="font-semibold text-gray-900">{filtered.length}</span> results
          {search && <> for "<span className="text-green-700">{search}</span>"</>}
          {category !== "All" && <> in <span className="text-green-700">{category}</span></>}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner className="h-10 w-10" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-lg font-medium text-gray-600">No products found</p>
            <p className="text-sm">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(product => {
              const discountedPrice = product.discount && product.discount > 0
                ? product.price * (1 - product.discount / 100)
                : product.price;
              return (
                <Card
                  key={product.id}
                  className="group hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {/* Product Image */}
                  <div className="h-40 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative overflow-hidden">
                    {product.imageBase64 ? (
                      <img
                        src={product.imageBase64}
                        alt={product.name}
                        className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-gray-300">
                        <span className="text-4xl">{getEmoji(product.name)}</span>
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <Badge variant="danger">Out of Stock</Badge>
                      </div>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                      <Badge variant="warning" className="absolute top-2 left-2 text-xs">
                        Only {product.stock} left!
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-3">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-1 group-hover:text-green-700 transition-colors">
                      {product.name}
                    </p>

                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={10} className={s <= 4 ? "fill-amber-400 text-amber-400" : "text-gray-300 fill-gray-300"} />
                      ))}
                      <span className="text-xs text-gray-400 ml-0.5">(42)</span>
                    </div>

                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-lg font-bold text-gray-900">₹{discountedPrice.toLocaleString()}</span>
                      {product.discount && product.discount > 0 ? (
                        <>
                          <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                          <span className="text-xs font-medium text-green-600 ml-auto">{product.discount}% off</span>
                        </>
                      ) : null}
                    </div>

                    <Button
                      className="w-full"
                      size="sm"
                      loading={addingId === product.id}
                      disabled={product.stock === 0}
                      onClick={e => { e.stopPropagation(); handleAddToCart(product.id, product.name); }}
                    >
                      <ShoppingCart size={13} />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

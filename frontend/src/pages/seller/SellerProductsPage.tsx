import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Package, DollarSign, AlertCircle } from "lucide-react";
import { productApi, tagApi, type Product, type ProductPayload, type Tag } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label, Badge, Spinner } from "@/components/ui/Misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product?: Product;
  onClose: () => void;
  onSave: (data: ProductPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductPayload>({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
    imageBase64: product?.imageBase64 ?? "",
    discount: product?.discount ?? 0,
    tags: product?.tags ?? [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  useEffect(() => {
    tagApi.getAll()
      .then(tags => setAvailableTags(tags))
      .catch(() => {});
  }, []);

  const toggleTag = (tagName: string) => {
    setForm(p => ({
      ...p,
      tags: p.tags?.includes(tagName)
        ? p.tags.filter(t => t !== tagName)
        : [...(p.tags ?? []), tagName]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(p => ({ ...p, imageBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-md animate-slide-up overflow-y-auto max-h-[90vh]">
        <CardHeader>
          <CardTitle>{product ? "Edit Product" : "Add New Product"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" placeholder="Mechanical Keyboard" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" placeholder="Premium RGB backlit keyboard" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" min="0" step="0.01" placeholder="1499"
                  value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" min="0" placeholder="50"
                  value={form.stock} onChange={e => setForm(p => ({ ...p, stock: Number(e.target.value) }))} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={form.discount}
                onChange={e => setForm(p => ({ ...p, discount: Math.min(100, Math.max(0, Number(e.target.value))) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="image">Product Image</Label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-green-50 dark:file:bg-white/10 file:text-green-700 dark:file:text-slate-200 hover:file:bg-green-100 dark:hover:file:bg-white/20 cursor-pointer"
              />
              {form.imageBase64 && (
                <img
                  src={form.imageBase64}
                  alt="Preview"
                  className="mt-2 h-24 w-full object-contain rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5"
                />
              )}
            </div>
            {availableTags.length > 0 && (
              <div className="space-y-1.5">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.name)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        form.tags?.includes(tag.name)
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-white/10 hover:border-green-400'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1" loading={loading}>
                {product ? "Save Changes" : "Add Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SellerProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const all = await productApi.getAll();
      setProducts(all.filter(p => p.sellerId === user?.userId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async (data: ProductPayload) => {
    if (modal.product) {
      await productApi.update(modal.product.id, data);
    } else {
      await productApi.create(data);
    }
    await fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await productApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock = products.filter(p => p.stock <= 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {modal.open && (
        <ProductModal
          product={modal.product}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">My Products</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{products.length} products listed</p>
        </div>
        <Button onClick={() => setModal({ open: true })} className="gap-2">
          <Plus size={16} /> Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-violet-700/20 flex items-center justify-center">
              <Package size={18} className="text-green-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{products.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-700/20 flex items-center justify-center">
              <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">₹{totalValue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-700/20 flex items-center justify-center">
              <AlertCircle size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{lowStock.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products table */}
      {loading ? (
        <div className="flex justify-center h-40"><Spinner className="h-8 w-8 mt-12" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🏪</p>
          <p className="text-xl font-medium text-gray-700 dark:text-slate-300 mb-2">No products listed</p>
          <p className="text-gray-400 dark:text-slate-500 mb-6">Start adding products to the marketplace</p>
          <Button onClick={() => setModal({ open: true })}>Add First Product</Button>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/8">
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider px-6 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider px-6 py-3">Price</th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider px-6 py-3">Stock</th>
                  <th className="text-left text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{product.name}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">{product.description}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-slate-200">₹{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">{product.stock}</td>
                    <td className="px-6 py-4">
                      {product.stock === 0
                        ? <Badge variant="danger">Out of Stock</Badge>
                        : product.stock <= 5
                        ? <Badge variant="warning">Low Stock</Badge>
                        : <Badge variant="success">In Stock</Badge>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModal({ open: true, product })}
                          className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-violet-700/20 text-gray-400 dark:text-slate-400 hover:text-green-600 dark:hover:text-violet-300 transition-all cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-700/20 text-gray-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-300 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      </div>
    </div>
  );
}

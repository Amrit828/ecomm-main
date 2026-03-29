const BASE_URLS = {
  auth: import.meta.env.VITE_AUTH_URL || "http://localhost:8081",
  product: import.meta.env.VITE_PRODUCT_URL || "http://localhost:8082",
  cart: import.meta.env.VITE_CART_URL || "http://localhost:8083",
  order: import.meta.env.VITE_ORDER_URL || "http://localhost:8084",
};

function getToken(): string | null {
  return localStorage.getItem("ecomm_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers as Record<string, string> ?? {}) },
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "Request failed");
    throw new Error(errText || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

// ── Auth ────────────────────────────────────────────────────────────────────
export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  address?: string;
  phoneNo?: string;
  role: "BUYER" | "SELLER";
}
export interface AuthResponse { token: string }

export const authApi = {
  register: (data: RegisterPayload) =>
    request<AuthResponse>(`${BASE_URLS.auth}/auth/register`, { method: "POST", body: JSON.stringify(data) }),
  login: (email: string, password: string) =>
    request<AuthResponse>(`${BASE_URLS.auth}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  validate: () =>
    request<{ userId: string; role: string }>(`${BASE_URLS.auth}/auth/validate`),
};

// ── Products ────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sellerId: string;
  imageBase64?: string;
  discount?: number;  // percentage 0-100
  tags?: string[];
}
export interface ProductPayload { name: string; description: string; price: number; stock: number; imageBase64?: string; discount?: number; tags?: string[] }

export const productApi = {
  getAll: () => request<Product[]>(`${BASE_URLS.product}/products`),
  getById: (id: string) => request<Product>(`${BASE_URLS.product}/products/${id}`),
  create: (data: ProductPayload) =>
    request<Product>(`${BASE_URLS.product}/products`, { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: ProductPayload) =>
    request<Product>(`${BASE_URLS.product}/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`${BASE_URLS.product}/products/${id}`, { method: "DELETE" }),
};

export interface Tag { id: string; name: string }

export const tagApi = {
  getAll: () => request<Tag[]>(`${BASE_URLS.product}/tags`),
};

// ── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem { productId: string; productName: string; price: number; quantity: number }
export interface Cart { id: string; userId: string; items: CartItem[]; totalPrice: number }

export const cartApi = {
  getMyCart: () => request<Cart>(`${BASE_URLS.cart}/carts/my-cart`),
  addItem: (productId: string, quantity: number) =>
    request<Cart>(`${BASE_URLS.cart}/carts/add`, { method: "POST", body: JSON.stringify({ productId, quantity }) }),
  reduceItem: (productId: string, quantity: number) =>
    request<Cart>(`${BASE_URLS.cart}/carts/reduce`, { method: "PUT", body: JSON.stringify({ productId, quantity }) }),
  clearCart: () => request<void>(`${BASE_URLS.cart}/carts/clear`, { method: "DELETE" }),
};

// ── Orders ──────────────────────────────────────────────────────────────────
export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  sellerId: string;
  status: string;
}
export interface Order {
  id: string;
  buyerId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
}

export const orderApi = {
  placeOrder: (shippingAddress: string) =>
    request<Order>(`${BASE_URLS.order}/orders?shippingAddress=${encodeURIComponent(shippingAddress)}`, { method: "POST" }),
  getMyOrders: () => request<Order[]>(`${BASE_URLS.order}/orders/my-orders`),
  getSellerOrders: () => request<Order[]>(`${BASE_URLS.order}/orders/seller`),
  updateItemStatus: (orderId: string, productId: string, status: string) =>
    request<void>(`${BASE_URLS.order}/orders/${orderId}/items/${productId}/status?status=${status}`, { method: "PUT" }),
};

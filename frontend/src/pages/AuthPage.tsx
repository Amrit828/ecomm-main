import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, MapPin, Store } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Misc";

type Role = "BUYER" | "SELLER";
type Mode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("BUYER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "", password: "", firstName: "", lastName: "", address: "", phoneNo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        const res = await authApi.login(form.email, form.password);
        // Store token temporarily to allow the validate call
        localStorage.setItem("ecomm_token", res.token);
        const info = await authApi.validate();
        login(res.token, {
          userId: info.userId,
          role: info.role as Role,
          email: form.email,
          firstName: form.email.split("@")[0],
        });
        navigate(info.role === "SELLER" ? "/seller/dashboard" : "/products");
      } else {
        const res = await authApi.register({ ...form, role });
        localStorage.setItem("ecomm_token", res.token);
        const info = await authApi.validate();
        login(res.token, {
          userId: info.userId,
          role: info.role as Role,
          email: form.email,
          firstName: form.firstName || form.email.split("@")[0],
        });
        navigate(role === "SELLER" ? "/seller/dashboard" : "/products");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 bg-gradient-to-br from-green-600 to-green-800 text-white p-12">
        <Store size={48} className="mb-6 opacity-90" />
        <h1 className="text-4xl font-bold mb-3">AmritShop</h1>
        <p className="text-green-100 text-lg text-center max-w-xs">
          Your one-stop marketplace for buyers and sellers across the country.
        </p>
        <div className="mt-12 space-y-4 text-green-100 text-sm">
          {["✓ Multi-vendor marketplace", "✓ Real-time inventory tracking", "✓ Secure JWT-protected checkout", "✓ Role-based seller dashboard"].map(f => (
            <p key={f}>{f}</p>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-lg mx-auto w-full">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center">
              <Store size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Amrit<span className="text-green-600">Shop</span></span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {mode === "login" ? "Welcome back!" : "Create your account"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {mode === "login" ? "Sign in to continue shopping" : "Join thousands of buyers and sellers"}
          </p>

          {/* Tab toggle */}
          <div className="flex mb-6 border border-gray-200 rounded-lg p-1 bg-gray-50">
            {(["login", "register"] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  mode === m ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector (register only) */}
            {mode === "register" && (
              <div>
                <Label className="mb-2 block">I want to</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["BUYER", "SELLER"] as Role[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`p-3 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer text-left ${
                        role === r
                          ? "border-green-500 bg-green-50 text-green-800"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className="block text-lg mb-0.5">{r === "BUYER" ? "🛒" : "🏪"}</span>
                      <span>{r === "BUYER" ? "Buy Products" : "Sell Products"}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input id="firstName" name="firstName" placeholder="John" className="pl-8"
                      value={form.firstName} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" placeholder="Doe"
                    value={form.lastName} onChange={handleChange} />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input id="email" name="email" type="email" placeholder="you@example.com"
                  className="pl-8" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input id="password" name="password" type="password" placeholder="At least 8 characters"
                  className="pl-8" value={form.password} onChange={handleChange} required />
              </div>
            </div>

            {mode === "register" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input id="address" name="address" placeholder="123 Main St, City"
                      className="pl-8" value={form.address} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phoneNo">Phone Number</Label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input id="phoneNo" name="phoneNo" placeholder="+91 98765 43210"
                      className="pl-8" value={form.phoneNo} onChange={handleChange} />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              className="text-green-600 hover:text-green-700 font-medium cursor-pointer"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-gray-50 px-2 w-fit mx-auto">or</div>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}

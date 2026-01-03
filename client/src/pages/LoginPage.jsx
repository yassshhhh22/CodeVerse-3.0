import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle authentication logic here
    console.log("Form submitted:", formData);
    navigate("/dashboard");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="min-h-screen w-full bg-black text-text relative font-serif overflow-hidden flex items-center justify-center">
      {/* Big graphic background design with 70% transparency */}
      <div className="absolute inset-0 z-0 opacity-70">
        {/* Large gradient orbs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-primary/40 via-primary/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-[900px] h-[900px] bg-gradient-radial from-accent/40 via-accent/20 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-[650px] h-[650px] bg-gradient-radial from-primary/30 via-primary/15 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>

        {/* Large geometric shapes */}
        <div
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] border-2 border-primary/20 rounded-lg rotate-12 animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-[350px] h-[350px] border-2 border-accent/20 rounded-full animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        ></div>

        {/* Hexagon pattern */}
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
            <polygon
              points="50 1 95 25 95 75 50 99 5 75 5 25"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <polygon
              points="50 10 85 30 85 70 50 90 15 70 15 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <polygon
              points="50 20 75 35 75 65 50 80 25 65 25 35"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(79, 140, 255, 0.1) 2px, transparent 2px), linear-gradient(90deg, rgba(79, 140, 255, 0.1) 2px, transparent 2px)",
            backgroundSize: "100px 100px",
          }}
        ></div>

        {/* Radial rays */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-[600px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent origin-top"
              style={{ transform: `rotate(${i * 30}deg) translateX(-50%)` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-20 left-10 w-3 h-3 bg-primary/60 rounded-full animate-pulse opacity-70"></div>
      <div
        className="absolute top-40 right-20 w-4 h-4 bg-accent/50 rounded-full animate-pulse opacity-70"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute bottom-40 left-20 w-3 h-3 bg-primary/70 rounded-full animate-pulse opacity-70"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-20 right-40 w-4 h-4 bg-accent/60 rounded-full animate-pulse opacity-70"
        style={{ animationDelay: "1.5s" }}
      ></div>
      <div
        className="absolute top-1/3 left-1/2 w-5 h-5 bg-primary/50 rounded-full animate-pulse opacity-70"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-accent/55 rounded-full animate-pulse opacity-70"
        style={{ animationDelay: "2.5s" }}
      ></div>

      {/* Back to home link */}
      <Link
        to="/"
        className="absolute top-8 left-8 text-primary hover:text-primary/80 transition-all duration-300 text-xl font-bold z-50"
      >
        ← CrowdCrawl
      </Link>

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md px-6 max-h-screen overflow-y-auto py-4">
        <div className="bg-background/80 backdrop-blur-xl border-2 border-border rounded-2xl p-6 shadow-[0_0_50px_rgba(79,140,255,0.1)] hover:shadow-[0_0_80px_rgba(79,140,255,0.2)] transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl mb-3 border border-primary/30">
              <Shield size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
            <p className="text-secondary text-xs">
              Log in to access your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-background/50 border border-border rounded-lg focus:border-primary focus:outline-none focus:shadow-[0_0_20px_rgba(79,140,255,0.2)] transition-all duration-300 text-text"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-background/50 border border-border rounded-lg focus:border-primary focus:outline-none focus:shadow-[0_0_20px_rgba(79,140,255,0.2)] transition-all duration-300 text-text"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border bg-background accent-primary"
                />
                <span className="text-secondary">Remember me</span>
              </label>
              <a
                href="#"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-sm bg-primary text-background font-bold rounded-lg hover:shadow-[0_0_30px_rgba(79,140,255,0.6)] hover:scale-[1.02] transition-all duration-300"
            >
              Log In
            </button>
          </form>

          {/* Toggle to signup */}
          <div className="mt-4 text-center text-sm">
            <span className="text-secondary">Don't have an account?</span>{" "}
            <Link
              to="/signup"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/60 border border-border/50 rounded-full backdrop-blur">
            <Shield size={14} className="text-primary" />
            <span className="text-xs text-secondary">
              Secured with end-to-end encryption
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

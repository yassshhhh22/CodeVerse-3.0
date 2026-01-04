import { Link } from "react-router-dom";
import {
  Camera,
  Grid3x3,
  Bell,
  Network,
  Eye,
  Shield,
  ArrowRight,
} from "lucide-react";

function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-black text-text relative font-serif overflow-hidden">
      {/* Big graphic background design with 70% transparency */}
      <div className="absolute inset-0 z-0 opacity-70">
        {/* Large gradient orbs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-primary/40 via-primary/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-[900px] h-[900px] bg-gradient-radial from-accent/40 via-accent/20 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-1/3 left-1/3 w-[700px] h-[700px] bg-gradient-radial from-primary/30 via-primary/15 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>

        {/* Large geometric shapes */}
        <div
          className="absolute bottom-20 left-1/4 w-[500px] h-[500px] border-2 border-accent/30 rounded-lg rotate-45 animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>

        {/* Large hexagon pattern */}
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] opacity-20">
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
              className="absolute top-1/2 left-1/2 w-1 h-[800px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent origin-top"
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

      <nav className="fixed w-full top-0 z-50 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl sm:text-2xl font-bold text-primary">
              CrowdCrawl
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#architecture"
                className="text-text hover:text-primary transition-all duration-300 text-sm lg:text-base hover:drop-shadow-[0_0_8px_rgba(79,140,255,0.6)] whitespace-nowrap"
              >
                System Architecture
              </a>
              <Link
                to="/login"
                className="px-5 py-2.5 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-background hover:shadow-[0_0_20px_rgba(79,140,255,0.5)] transition-all duration-300 font-semibold text-sm lg:text-base whitespace-nowrap"
              >
                Log In
              </Link>
              {/* 
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-primary text-background rounded-lg hover:shadow-[0_0_20px_rgba(79,140,255,0.5)] transition-all duration-300 font-semibold text-sm lg:text-base whitespace-nowrap"
              >
                View Live Dashboard
              </Link> 
              */}
            </div>
            <Link
              to="/login"
              className="md:hidden px-4 py-2 bg-primary text-background rounded-lg text-sm font-semibold hover:shadow-[0_0_15px_rgba(79,140,255,0.5)] transition-all duration-300"
            >
              Log In
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 px-4 relative z-10">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 border border-primary/10 rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 border border-accent/10 rounded-full"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-full mb-6">
                <span className="text-primary text-sm font-semibold">
                  Real-Time Security Intelligence
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                CrowdCrawl
              </h1>
              <p className="text-xl sm:text-2xl text-text mb-8 font-light">
                Real-time crowd density monitoring using computer vision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* 
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-primary text-background rounded-lg font-bold text-lg hover:shadow-[0_0_30px_rgba(79,140,255,0.6)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  View Live Dashboard
                  <ArrowRight size={20} />
                </Link> 
                */}
                <a
                  href="#architecture"
                  className="px-8 py-4 border-2 border-border text-text rounded-lg font-bold text-lg hover:border-primary hover:shadow-[0_0_20px_rgba(79,140,255,0.3)] transition-all duration-300 flex items-center justify-center"
                >
                  System Architecture
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-border/50 to-background border-2 border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(79,140,255,0.2)] relative group">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-accent/30 rounded-br-2xl"></div>

                {/* Animated scan line */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera
                      size={64}
                      className="mx-auto mb-4 text-primary/40 animate-pulse"
                    />
                    <p className="text-secondary text-sm">
                      Live Heatmap Demo Screenshot
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
              <div
                className="absolute -top-4 -left-4 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>

              {/* Floating decorative elements */}
              <div className="absolute top-10 -right-6 w-12 h-12 border border-primary/20 rounded-lg rotate-12 hover:rotate-45 transition-transform duration-500"></div>
              <div className="absolute bottom-10 -left-6 w-10 h-10 border border-accent/20 rounded-full hover:scale-125 transition-transform duration-500"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 border-t border-border/50 relative z-10">
        {/* Section decorative background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-50"></div>
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-accent/5 rounded-full blur-[100px] -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-primary"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-primary"></div>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Core Capabilities
            </h2>
            <p className="text-secondary text-lg">
              Technical foundation of the system
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-8 border border-border rounded-2xl hover:border-primary hover:shadow-[0_0_30px_rgba(79,140,255,0.2)] hover:-translate-y-2 transition-all duration-300 bg-background/50 backdrop-blur group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-300"></div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-primary/50 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
              <div className="w-14 h-14 bg-primary/10 rounded-xl mb-6 flex items-center justify-center group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(79,140,255,0.4)] transition-all duration-300">
                <Camera
                  size={28}
                  className="text-primary group-hover:text-background transition-colors"
                />
              </div>
              <h3 className="text-xl font-bold mb-4">
                Real-Time Crowd Detection
              </h3>
              <ul className="space-y-2 text-secondary text-sm">
                <li>• YOLO-based person detection</li>
                <li>• Edge processing</li>
                <li>• No video storage</li>
              </ul>
            </div>
            <div className="p-8 border border-border rounded-2xl hover:border-accent hover:shadow-[0_0_30px_rgba(245,185,113,0.2)] hover:-translate-y-2 transition-all duration-300 bg-background/50 backdrop-blur group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all duration-300"></div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-accent/50 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
              <div className="w-14 h-14 bg-accent/10 rounded-xl mb-6 flex items-center justify-center group-hover:bg-accent group-hover:shadow-[0_0_20px_rgba(245,185,113,0.4)] transition-all duration-300">
                <Grid3x3
                  size={28}
                  className="text-accent group-hover:text-background transition-colors"
                />
              </div>
              <h3 className="text-xl font-bold mb-4">Density Heatmaps</h3>
              <ul className="space-y-2 text-secondary text-sm">
                <li>• Grid-based density estimation</li>
                <li>• Live and time-aggregated views</li>
                <li>• Zone-based analysis</li>
              </ul>
            </div>
            <div className="p-8 border border-border rounded-2xl hover:border-primary hover:shadow-[0_0_30px_rgba(79,140,255,0.2)] transition-all duration-300 bg-background/50 backdrop-blur group">
              <div className="w-14 h-14 bg-primary/10 rounded-xl mb-6 flex items-center justify-center group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(79,140,255,0.4)] transition-all duration-300">
                <Bell
                  size={28}
                  className="text-primary group-hover:text-background transition-colors"
                />
              </div>
              <h3 className="text-xl font-bold mb-4">Automated Alerts</h3>
              <ul className="space-y-2 text-secondary text-sm">
                <li>• Admin-defined thresholds</li>
                <li>• Warning vs Critical separation</li>
                <li>• Actionable alerts</li>
              </ul>
            </div>
            <div className="p-8 border border-border rounded-2xl hover:border-primary hover:shadow-[0_0_30px_rgba(79,140,255,0.2)] transition-all duration-300 bg-background/50 backdrop-blur group">
              <div className="w-14 h-14 bg-primary/10 rounded-xl mb-6 flex items-center justify-center group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(79,140,255,0.4)] transition-all duration-300">
                <Network
                  size={28}
                  className="text-primary group-hover:text-background transition-colors"
                />
              </div>
              <h3 className="text-xl font-bold mb-4">Scalable Architecture</h3>
              <ul className="space-y-2 text-secondary text-sm">
                <li>• Multi-camera support</li>
                <li>• WebSocket-based streaming</li>
                <li>• Backend aggregation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="architecture"
        className="py-16 sm:py-24 px-4 relative z-10 bg-gradient-to-b from-transparent to-background/50"
      >
        {/* Animated connection lines background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-primary"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
              <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <div className="h-px w-16 bg-gradient-to-l from-accent to-transparent"></div>
              <div
                className="w-3 h-3 bg-primary rounded-full animate-ping"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-secondary text-lg">Linear processing pipeline</p>
          </div>
          <div className="relative">
            <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-6">
              <div className="flex flex-col items-center gap-3 w-32">
                <div className="w-24 h-24 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center hover:shadow-[0_0_25px_rgba(79,140,255,0.4)] transition-all duration-300">
                  <Camera size={32} className="text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold mb-0.5">Camera Feed</h3>
                  <p className="text-secondary text-xs">Live CCTV</p>
                </div>
              </div>

              <ArrowRight
                size={36}
                className="text-primary/50 flex-shrink-0 hidden sm:block"
              />

              <div className="flex flex-col items-center gap-3 w-32">
                <div className="w-24 h-24 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center hover:shadow-[0_0_25px_rgba(79,140,255,0.4)] transition-all duration-300">
                  <Eye size={32} className="text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold mb-0.5">Edge Vision</h3>
                  <p className="text-secondary text-xs">YOLOv8</p>
                </div>
              </div>

              <ArrowRight
                size={36}
                className="text-primary/50 flex-shrink-0 hidden sm:block"
              />

              <div className="flex flex-col items-center gap-3 w-32">
                <div className="w-24 h-24 bg-accent/10 border-2 border-accent rounded-xl flex items-center justify-center hover:shadow-[0_0_25px_rgba(245,185,113,0.4)] transition-all duration-300">
                  <Network size={32} className="text-accent" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold mb-0.5">Streaming</h3>
                  <p className="text-secondary text-xs">WebSocket</p>
                </div>
              </div>

              <ArrowRight
                size={36}
                className="text-primary/50 flex-shrink-0 hidden sm:block"
              />

              <div className="flex flex-col items-center gap-3 w-32">
                <div className="w-24 h-24 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center hover:shadow-[0_0_25px_rgba(79,140,255,0.4)] transition-all duration-300">
                  <Grid3x3 size={32} className="text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold mb-0.5">Backend</h3>
                  <p className="text-secondary text-xs">Aggregation</p>
                </div>
              </div>

              <ArrowRight
                size={36}
                className="text-primary/50 flex-shrink-0 hidden sm:block"
              />

              <div className="flex flex-col items-center gap-3 w-32">
                <div className="w-24 h-24 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center hover:shadow-[0_0_25px_rgba(79,140,255,0.4)] transition-all duration-300">
                  <Bell size={32} className="text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold mb-0.5">Dashboard</h3>
                  <p className="text-secondary text-xs">Visualization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-background/50 to-transparent border-y border-border/50 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <Shield size={32} className="text-primary" />
              <h2 className="text-3xl sm:text-4xl font-bold">
                Privacy & Compliance
              </h2>
            </div>
            <p className="text-secondary text-lg mb-8">
              Privacy-safe by design
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-6 bg-background/80 border border-border rounded-xl hover:border-primary/50 hover:shadow-[0_0_20px_rgba(79,140,255,0.15)] transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 min-w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Eye size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">No Facial Recognition</h3>
                  <p className="text-secondary text-sm">
                    Zero biometric data collection
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-background/80 border border-border rounded-xl hover:border-primary/50 hover:shadow-[0_0_20px_rgba(79,140,255,0.15)] transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 min-w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Camera size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">No Video Storage</h3>
                  <p className="text-secondary text-sm">
                    Streams processed in real-time only
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-background/80 border border-border rounded-xl hover:border-primary/50 hover:shadow-[0_0_20px_rgba(79,140,255,0.15)] transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 min-w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Metadata-Only Processing</h3>
                  <p className="text-secondary text-sm">
                    Anonymized bounding boxes only
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-background/80 border border-border rounded-xl hover:border-primary/50 hover:shadow-[0_0_20px_rgba(79,140,255,0.15)] transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 min-w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">GDPR Compliant</h3>
                  <p className="text-secondary text-sm">
                    Regulatory adherence built-in
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 bg-background/60 border border-border/50 rounded-2xl backdrop-blur">
            <h3 className="text-xl font-bold mb-4">Architecture Preview</h3>
            <ul className="grid sm:grid-cols-2 gap-4 text-secondary">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Edge inference (YOLOv8)
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                WebSocket transport
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Node.js backend
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                React dashboard
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-8 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-4 bg-accent/10 border border-accent/30 rounded-xl">
            <p className="text-secondary text-sm">
              <span className="text-accent font-semibold">
                Demo Configuration:
              </span>{" "}
              Uses live camera and recorded CCTV footage to simulate multi-zone
              deployment.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-12 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="text-2xl font-bold text-primary mb-2">
              CrowdCrawl
            </div>
            <p className="text-secondary text-sm mb-6">
              CodeVerse 3.0 Hackathon
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-background/80 border border-border rounded-lg text-xs font-semibold text-text hover:border-primary/50 transition-all duration-300">
                YOLOv8
              </span>
              <span className="px-4 py-2 bg-background/80 border border-border rounded-lg text-xs font-semibold text-text hover:border-primary/50 transition-all duration-300">
                Node.js
              </span>
              <span className="px-4 py-2 bg-background/80 border border-border rounded-lg text-xs font-semibold text-text hover:border-primary/50 transition-all duration-300">
                React
              </span>
              <span className="px-4 py-2 bg-background/80 border border-border rounded-lg text-xs font-semibold text-text hover:border-primary/50 transition-all duration-300">
                WebSocket
              </span>
              <span className="px-4 py-2 bg-background/80 border border-border rounded-lg text-xs font-semibold text-text hover:border-primary/50 transition-all duration-300">
                OpenCV
              </span>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-secondary text-sm">
            <p>
              Real-time security intelligence system built for public safety
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  Home,
  Gift,
  Percent,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Heart,
  ChevronRight,
  Clock,
  Star,
  Tag,
  CheckCircle2,
  X,
  MoveHorizontal,
  Info,
  MapPin
} from "lucide-react";
import axios from "axios";

// ==========================================
// AXIOS CLIENT HELPER (Connected to Backend)
// ==========================================
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("beautyvibe_user_token") || localStorage.getItem("beautyvibe_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// SAFE IMAGE COMPONENT WITH /primary.png FALLBACK
// ==========================================
const SafeImage = ({ src, alt, className, style, fallback, ...props }) => {
  const localLogoFallback = "/primary.png";
  const remoteFallback = fallback || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80";

  const [imgSrc, setImgSrc] = useState(src || localLogoFallback);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    setImgSrc(src || localLogoFallback);
    setErrorCount(0);
  }, [src]);

  const handleError = () => {
    if (errorCount === 0) {
      setImgSrc(localLogoFallback);
      setErrorCount(1);
    } else if (errorCount === 1) {
      setImgSrc(remoteFallback);
      setErrorCount(2);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      {...props}
    />
  );
};

// ==========================================
// BEFORE / AFTER SLIDER COMPONENT
// ==========================================
const BeforeAfterSlider = ({ beforeImg, afterImg, title }) => {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="relative w-[280px] h-[350px] sm:w-[320px] sm:h-[400px] lg:w-[350px] lg:h-[440px] shrink-0 snap-center rounded-[2rem] overflow-hidden group shadow-md border border-[#EADBD2] bg-white">
      <SafeImage src={beforeImg} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
      
      <SafeImage 
        src={afterImg} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
      />

      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize pointer-events-none" 
        style={{ left: `calc(${sliderPos}%)`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-[#EADBD2]">
          <MoveHorizontal size={16} className="text-[#C56E4E]" />
        </div>
      </div>

      <input 
        type="range" 
        min="0" 
        max="100" 
        value={sliderPos} 
        onChange={(e) => setSliderPos(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10 m-0 touch-pan-y"
      />

      <span className="absolute top-4 left-4 bg-black/40 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md z-0 pointer-events-none">Before</span>
      <span className="absolute top-4 right-4 bg-[#C56E4E]/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md z-0 pointer-events-none">After</span>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-0 pointer-events-none">
        <span className="bg-white/95 text-[#2D2623] px-4 py-2 rounded-full text-xs font-bold shadow-lg border border-[#EADBD2]">{title}</span>
      </div>
    </div>
  );
};

// ==========================================
// ANIMATED QUOTE WORD COMPONENT
// ==========================================
const AnimatedWord = ({ word, delay }) => (
  <motion.span
    initial={{ opacity: 0, y: 30, rotateX: -40 }}
    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, type: "spring", damping: 15 }}
    className="inline-block"
  >
    {word}
  </motion.span>
);

// ==========================================
// CONFIG & FALLBACK DATA
// ==========================================
const heroCarouselImages = [
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80"
];

// Replaced Salon Services with Book Appointment
const serviceModes = [
  { id: "book", icon: CalendarCheck, label: "Book Appointment", sub: "Schedule your slot", path: "/book-appointment" },
  { id: "home", icon: Home, label: "Home Services", sub: "We come to you", path: "/services?mode=home" },
  { id: "packages", icon: Gift, label: "Packages", sub: "Curated beauty plans", path: "/packages" },
  { id: "offers", icon: Percent, label: "Offers", sub: "Exclusive deals", path: "/offers" }
];

const popularCategories = [
  { id: "facial", title: "Facial & Skin Care", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80", path: "/services?category=Facial" },
  { id: "nails", title: "Nail Care", image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&q=80", path: "/services?category=Nails" },
  { id: "hair", title: "Hair Styling", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80", path: "/services?category=Hair" },
  { id: "bridal", title: "Bridal Makeup", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80", path: "/services?category=Bridal" }
];

const fallbackServices = [
  {
    id: "n1", category: "Nails", name: "Sara Pedicure", rating: "4.8", reviews: "1.2K", duration: "45 mins", price: "619", oldPrice: "999",
    image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&q=80",
    description: "Relaxing foot soak followed by cuticle care, heel scrubbing, and premium sara nail polishing."
  },
  {
    id: "n2", category: "Nails", name: "Elixir Pedicure", rating: "4.9", reviews: "980", duration: "50 mins", price: "709", oldPrice: "1,199",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
    description: "Nourishing botanical oils massage with deep moisturizing mask for cracked heels and soft skin."
  },
  {
    id: "f1", category: "Facial", name: "Korean Glow Facial", rating: "4.9", reviews: "3.1K", duration: "1 hr 15 mins", price: "1,799", oldPrice: "2,999",
    image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=80",
    description: "Multi-step hydration and glass-skin facial treatment using authentic Korean serums."
  },
  {
    id: "f2", category: "Facial", name: "O3+ Bridal Facial", rating: "4.8", reviews: "1.5K", duration: "1 hr 30 mins", price: "1,999", oldPrice: "3,499",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
    description: "Instant radiant brightness and deep pigmentation clearing for special occasions."
  },
  {
    id: "h1", category: "Hair", name: "Korean Hair Spa", rating: "4.9", reviews: "2.2K", duration: "1 hr 10 mins", price: "1,499", oldPrice: "2,599",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80",
    description: "Scalp detox with herbal infusion, deep conditioning, and hot steam therapy."
  }
];

const fallbackMakeovers = [
  {
    id: 1, title: "Bridal Glow Therapy",
    beforeImg: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80&sat=-100", 
    afterImg: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80", 
  },
  {
    id: 2, title: "Keratin Smooth Treatment",
    beforeImg: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=600&q=80&sat=-50&con=0.8",
    afterImg: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3, title: "Advanced Acne Clearing",
    beforeImg: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80&sat=-30",
    afterImg: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80",
  }
];

const trendingTabs = ["All", "Nails", "Facial", "Hair", "Body Care", "Grooming"];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 20 } }
};

export default function Main() {
  const [activeTab, setActiveTab] = useState("All");
  const [currentHeroImgIndex, setCurrentHeroImgIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [services, setServices] = useState(fallbackServices);
  const [showLocationBanner, setShowLocationBanner] = useState(true);

  // Auto-play hero background slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImgIndex((prev) => (prev + 1) % heroCarouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Services Data
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setIsLoading(true);
        const res = await API.get("/api/services").catch(() => null);
        const fetchedServices = res?.data?.data || res?.data;
        if (Array.isArray(fetchedServices) && fetchedServices.length > 0) {
          setServices(fetchedServices);
        }
      } catch (err) {
        console.warn("Using fallback data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveData();
  }, []);

  // Group services by Category dynamically
  const groupedServices = services.reduce((acc, service) => {
    const catName = service.category || service.type || "General";
    if (!acc[catName]) {
      acc[catName] = [];
    }
    acc[catName].push(service);
    return acc;
  }, {});

  const activeCategories = activeTab === "All" 
    ? Object.keys(groupedServices)
    : Object.keys(groupedServices).filter(cat => cat.toLowerCase() === activeTab.toLowerCase());

  const handleToggleFavourite = async (service) => {
    const sId = service.id || service._id;
    try {
      await API.post("/api/users/favourites", { serviceId: sId }).catch(() => {});
      setToastMsg(`✨ Pinned "${service.name || service.title}" to Favourites!`);
    } catch (e) {
      setToastMsg(`✨ Pinned to Favourites!`);
    }

    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-32 text-[#2D2623] relative overflow-x-hidden">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-8 sm:space-y-12"
      >
        
        {/* ================= COMPACT & PREMIUM HERO SECTION ================= */}
        <motion.section 
          variants={fadeUp} 
          className="relative rounded-[2rem] sm:rounded-[2.25rem] bg-gradient-to-r from-[#FFF6F0] via-[#FDF3ED] to-[#FFF6F0] border border-[#EADBD2] px-6 py-6 sm:px-10 sm:py-8 lg:px-12 lg:py-10 overflow-hidden shadow-sm"
        >
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md px-3.5 py-1 border border-[#EADBD2] shadow-sm">
                <Sparkles size={13} className="text-[#C56E4E]" />
                <span className="text-[10px] sm:text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider">Premium Beauty & Wellness</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2623] leading-[1.15]">
                Salon & Home <br />
                <span className="text-[#C56E4E]">Beauty Services</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#8C7A70] max-w-md mx-auto lg:mx-0 leading-relaxed font-medium">
                Expert care at our salon or in the comfort of your home. Look good, feel confident, always.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <Link 
                  to="/book-appointment" 
                  className="inline-flex items-center gap-2 rounded-full bg-[#C56E4E] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#C56E4E]/20 hover:bg-[#A35539] transition-all hover:-translate-y-0.5"
                >
                  Book Appointment <ArrowRight size={15} />
                </Link>

                <Link 
                  to="/services" 
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-[#EADBD2] px-6 py-3 text-xs sm:text-sm font-bold text-[#2D2623] shadow-sm hover:border-[#C56E4E] hover:text-[#C56E4E] transition-all"
                >
                  Explore Services
                </Link>
              </div>
            </div>

            {/* Right Compact Image Showcase */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[320px] sm:max-w-[380px] aspect-[16/10] sm:aspect-[4/3] lg:aspect-[4/3] max-h-[300px] sm:max-h-[340px] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden border-4 border-white shadow-lg bg-[#FFF6F0] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentHeroImgIndex}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <SafeImage 
                      src={heroCarouselImages[currentHeroImgIndex]} 
                      alt="Beauty Salon Services" 
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Floating Compact Badges */}
              <div className="hidden sm:flex flex-col gap-2.5 absolute -right-2 lg:-right-4 top-1/2 -translate-y-1/2 z-20">
                <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#EADBD2] shadow-md">
                  <div className="h-8 w-8 rounded-lg bg-[#FFF6F0] flex items-center justify-center text-[#C56E4E] shrink-0">
                    <Home size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#2D2623]">At-Home Service</p>
                    <p className="text-[9px] text-[#8C7A70]">At your convenience</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#EADBD2] shadow-md">
                  <div className="h-8 w-8 rounded-lg bg-[#FFF6F0] flex items-center justify-center text-[#C56E4E] shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#2D2623]">Expert Professionals</p>
                    <p className="text-[9px] text-[#8C7A70]">Trained & Verified</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#EADBD2] shadow-md">
                  <div className="h-8 w-8 rounded-lg bg-[#FFF6F0] flex items-center justify-center text-[#C56E4E] shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#2D2623]">Hygienic & Safe</p>
                    <p className="text-[9px] text-[#8C7A70]">Salon-Grade Standards</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </motion.section>

        {/* ================= 4 SERVICE MODE CARDS (WITH BOOK APPOINTMENT) ================= */}
        <motion.section variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {serviceModes.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.id} 
                to={item.path} 
                className="group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#EADBD2] shadow-sm hover:border-[#C56E4E] hover:shadow-md transition-all flex flex-col items-center text-center"
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-[#FFF6F0] border border-[#EADBD2] flex items-center justify-center text-[#C56E4E] mb-3 group-hover:bg-[#C56E4E] group-hover:text-white transition-colors">
                  <Icon size={20} className="sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#2D2623] group-hover:text-[#C56E4E] transition-colors">
                  {item.label}
                </h3>
                <p className="text-[10px] sm:text-xs text-[#8C7A70] font-medium mt-0.5">
                  {item.sub}
                </p>
              </Link>
            );
          })}
        </motion.section>

        {/* ================= POPULAR SERVICES CATEGORIES ================= */}
        <motion.section variants={fadeUp} className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2623]">Our Popular Services</h2>
            <p className="text-xs sm:text-sm text-[#8C7A70] font-medium">Most loved beauty services by our customers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {popularCategories.map((cat) => (
              <Link key={cat.id} to={cat.path} className="group relative rounded-2xl sm:rounded-3xl overflow-hidden h-[220px] sm:h-[270px] shadow-sm border border-[#EADBD2] bg-[#FFF6F0]">
                <SafeImage 
                  src={cat.image} 
                  alt={cat.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2623]/80 via-[#2D2623]/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white drop-shadow-md">
                    {cat.title}
                  </h3>
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#C56E4E] group-hover:bg-[#C56E4E] group-hover:text-white transition-all shadow-md shrink-0">
                    <ArrowRight size={15} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ================= CATEGORY CATALOG & EXPANDED SERVICES ================= */}
        <motion.section variants={fadeUp} className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADBD2] pb-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2623]">Category Catalog</h2>
              <p className="text-xs text-[#8C7A70] font-medium mt-1">Browse specific treatments & packages by category</p>
            </div>

            <div className="flex overflow-x-auto gap-2 scrollbar-hide py-1">
              {trendingTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-[#C56E4E] text-white shadow-md border border-[#C56E4E]"
                      : "bg-white border border-[#EADBD2] text-[#8C7A70] hover:border-[#C56E4E] hover:text-[#C56E4E]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-[1.5rem] border border-[#EADBD2] p-3 animate-pulse">
                  <div className="h-[180px] w-full rounded-xl bg-[#EADBD2]/40 mb-4" />
                  <div className="h-5 bg-[#EADBD2]/40 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-[#EADBD2]/30 rounded w-1/2 mb-5" />
                  <div className="h-10 bg-[#EADBD2]/40 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-10">
              {activeCategories.map((categoryName) => {
                const categoryServices = groupedServices[categoryName] || [];
                if (categoryServices.length === 0) return null;

                return (
                  <div key={categoryName} className="space-y-4">
                    <div className="flex flex-row items-center justify-between bg-white rounded-2xl px-4 sm:px-6 py-3.5 border border-[#EADBD2] shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#C56E4E]" />
                        <h3 className="font-serif text-base sm:text-xl font-bold text-[#2D2623]">{categoryName}</h3>
                        <span className="text-[10px] sm:text-xs font-bold text-[#8C7A70] bg-[#FFF6F0] px-2.5 py-0.5 rounded-full border border-[#EADBD2]">
                          {categoryServices.length} Options
                        </span>
                      </div>

                      <Link to={`/services?category=${categoryName}`}>
                        <motion.div
                          whileHover="hover"
                          className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#C56E4E] bg-[#FFF6F0] hover:bg-[#C56E4E] hover:text-white px-3.5 py-1.5 rounded-full border border-[#EADBD2] transition-colors cursor-pointer"
                        >
                          <span>View More</span>
                          <motion.div
                            variants={{ hover: { x: 4 } }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <ChevronRight size={14} />
                          </motion.div>
                        </motion.div>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {categoryServices.slice(0, 4).map((service) => {
                        const sName = service.name || service.title || "Service";
                        const sPrice = service.price || "0";
                        const sDuration = service.duration || "45 mins";
                        const sImage = service.image || service.avatar || service.imgUrl;

                        return (
                          <motion.div
                            key={service.id || service._id}
                            className="group bg-white rounded-[1.5rem] border border-[#EADBD2] p-3 shadow-sm hover:shadow-xl hover:border-[#C56E4E]/40 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="relative h-[160px] w-full rounded-xl overflow-hidden mb-3.5 bg-[#FFF6F0] flex items-center justify-center">
                                <SafeImage
                                  src={sImage}
                                  alt={sName}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <button
                                  onClick={() => handleToggleFavourite(service)}
                                  className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md p-2 rounded-full text-[#C56E4E] hover:bg-[#C56E4E] hover:text-white transition-colors shadow-sm cursor-pointer"
                                >
                                  <Heart size={15} />
                                </button>
                              </div>

                              <div className="px-1.5">
                                <h4 className="font-serif text-base font-bold text-[#2D2623] leading-tight mb-2 line-clamp-1">{sName}</h4>
                                
                                <div className="flex items-center gap-3 text-xs text-[#8C7A70] mb-3">
                                  <span className="flex items-center gap-1 font-bold text-[#E5A024]">
                                    <Star size={12} className="fill-current" /> {service.rating || "5.0"}
                                  </span>
                                  <span className="flex items-center gap-1 font-medium">
                                    <Clock size={12} /> {sDuration}
                                  </span>
                                </div>

                                <div className="flex items-end gap-2 mb-3">
                                  <span className="font-serif text-xl sm:text-2xl font-bold text-[#2D2623]">₹{sPrice}</span>
                                  {service.oldPrice && <span className="text-xs font-bold text-[#A39292] line-through mb-0.5">₹{service.oldPrice}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="px-1.5 pb-1">
                              <button
                                onClick={() => setSelectedService(service)}
                                className="w-full py-2.5 rounded-full bg-[#C56E4E] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#A35539] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Info size={14} /> Get Details
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* ================= SPECIAL OFFERS BANNER ================= */}
        <motion.section variants={fadeUp} className="rounded-[2rem] bg-[#2D2623] text-white p-6 sm:p-10 lg:p-12 border border-[#2D2623] shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10 text-center lg:text-left">
            
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="h-14 w-14 rounded-2xl bg-[#C56E4E]/20 border border-[#C56E4E]/40 items-center justify-center text-[#C56E4E] shrink-0 hidden sm:flex">
                <Percent size={28} />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-3xl font-bold mb-1">Special Beauty Offers</h3>
                <p className="text-xs sm:text-sm text-[#EADBD2]/80 font-medium">Get up to 30% OFF on selected services & packages</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EADBD2]">
                <Tag size={15} className="text-[#C56E4E]" />
                <span>Up to 30% OFF</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-[#EADBD2]">
                <Clock size={15} className="text-[#C56E4E]" />
                <span>Limited Time Only</span>
              </div>

              <Link 
                to="/offers" 
                onClick={() => {
                  setToastMsg("✨ Special promo code applied!");
                  setTimeout(() => setToastMsg(null), 3000);
                }}
                className="rounded-full bg-white text-[#2D2623] hover:bg-[#FFF6F0] px-6 sm:px-8 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-105"
              >
                Claim Offer →
              </Link>
            </div>

          </div>
        </motion.section>

        {/* ================= BEFORE & AFTER SLIDER ================= */}
        <motion.section variants={fadeUp} className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-[#2D2623]">Real Results</h2>
            <p className="text-xs sm:text-sm text-[#8C7A70] mt-1 font-medium">Drag the sliders to view customer transformations.</p>
          </div>

          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
            {fallbackMakeovers.map((item) => (
              <BeforeAfterSlider 
                key={item.id} 
                title={item.title} 
                beforeImg={item.beforeImg} 
                afterImg={item.afterImg} 
              />
            ))}
          </div>
        </motion.section>

        {/* ================= MASSIVE TRANSPARENT QUOTE ================= */}
        <motion.section 
          className="w-full pt-4 pb-12 sm:pb-16 flex flex-col justify-center items-center pointer-events-none select-none max-w-full overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center w-full text-[clamp(2rem,6vw,4.5rem)] font-serif leading-[1.1] font-bold text-[#D3A796]/40 drop-shadow-sm">
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              <AnimatedWord word="With" delay={0.1} />
              <AnimatedWord word="Love" delay={0.2} />
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                className="flex items-center justify-center ml-1"
              >
                <Heart className="text-[#C56E4E]/40 w-[clamp(2rem,6vw,3.5rem)] h-[clamp(2rem,6vw,3.5rem)]" fill="currentColor" />
              </motion.span>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap mt-1 sm:mt-0">
              <AnimatedWord word="From" delay={0.4} />
              <AnimatedWord word="Beauty" delay={0.5} />
              <AnimatedWord word="Vibe" delay={0.6} />
            </div>
          </div>
        </motion.section>

      </motion.main>

      {/* ================= SERVICE DETAILS MODAL ================= */}
      <AnimatePresence>
        {selectedService && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="fixed inset-0 z-50 bg-[#2D2623]/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 m-auto max-w-lg w-[92%] sm:w-full h-fit max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white p-5 sm:p-8 shadow-2xl border border-[#EADBD2]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#EADBD2] mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#C56E4E]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C56E4E]">
                    {selectedService.category || selectedService.type || "General"} Details
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedService(null)} 
                  className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-[#FFF6F0] text-[#8C7A70] hover:text-[#C56E4E] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D2623] mb-2">{selectedService.name || selectedService.title}</h2>
              <p className="text-xs font-medium text-[#8C7A70] leading-relaxed mb-5">{selectedService.description || selectedService.desc}</p>

              <div className="bg-[#FCF9F6] rounded-2xl p-4 border border-[#EADBD2] text-xs space-y-2 mb-6">
                <div className="flex justify-between"><span className="text-[#8C7A70]">Duration:</span> <strong className="text-[#2D2623]">{selectedService.duration || "45 mins"}</strong></div>
                <div className="flex justify-between"><span className="text-[#8C7A70]">Rating:</span> <strong className="text-[#E5A024]">★ {selectedService.rating || "5.0"}</strong></div>
                <div className="flex justify-between"><span className="text-[#8C7A70]">Price:</span> <strong className="text-[#C56E4E] text-base">₹{selectedService.price}</strong></div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleFavourite(selectedService)}
                  className="flex-1 py-3 rounded-full border border-[#C56E4E] text-[#C56E4E] text-xs font-bold uppercase tracking-wider hover:bg-[#FFF6F0] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Heart size={15} /> Pin Favourite
                </button>

                <Link
                  to={`/book-appointment?service=${selectedService.id || selectedService._id}`}
                  onClick={() => setSelectedService(null)}
                  className="flex-1 py-3 rounded-full bg-[#C56E4E] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#A35539] transition-colors flex items-center justify-center gap-2 text-center"
                >
                  Book Now <ArrowRight size={15} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= FIXED BOTTOM LOCATION SERVICE BANNER ================= */}
      <AnimatePresence>
        {showLocationBanner && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-40 sm:max-w-md bg-[#2D2623]/95 text-white p-4 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-md border border-[#EADBD2]/20 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#C56E4E] flex items-center justify-center text-white shrink-0 shadow-md">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  Service Area Notice <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </p>
                <p className="text-[11px] text-[#EADBD2]/80 leading-snug font-medium mt-0.5">
                  Appointments are currently accepted in <strong className="text-[#C56E4E]">Guntur</strong> & within a <strong className="text-[#C56E4E]">20 km radius</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowLocationBanner(false)}
              className="text-[#EADBD2]/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              title="Close Notice"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-full bg-[#2D2623]/95 px-5 sm:px-6 py-3 text-white shadow-2xl backdrop-blur-xl border border-white/20 text-xs font-bold"
          >
            <CheckCircle2 size={16} className="text-[#E5A024]" /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
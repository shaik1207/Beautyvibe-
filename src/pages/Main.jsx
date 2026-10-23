import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Clock,
  Heart,
  ArrowRight,
  ShieldCheck,
  Award,
  Clock3,
  ThumbsUp,
  MoveHorizontal,
  X,
  Sparkles,
  CheckCircle2,
  Info,
  Tag
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
// SAFE IMAGE COMPONENT
// ==========================================
const SafeImage = ({ src, alt, className, style, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || "/primary.png");
  const [hasError, setHasError] = useState(false);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        if (!hasError) {
          setImgSrc("/secondary.png");
          setHasError(true);
        }
      }}
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
    <div className="relative w-[300px] h-[400px] lg:w-[380px] lg:h-[480px] shrink-0 snap-center rounded-[2rem] overflow-hidden group shadow-md border border-[#EADBD2] bg-white">
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-[#EADBD2]">
          <MoveHorizontal size={18} className="text-[#C56E4E]" />
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

      <span className="absolute top-5 left-5 bg-black/40 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md z-0 pointer-events-none">Before</span>
      <span className="absolute top-5 right-5 bg-[#C56E4E]/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md z-0 pointer-events-none">After</span>
      
      <div className="absolute bottom-5 left-0 right-0 flex justify-center z-0 pointer-events-none">
        <span className="bg-white/95 text-[#2D2623] px-5 py-2.5 rounded-full text-xs font-bold shadow-lg border border-[#EADBD2]">{title}</span>
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
// FALLBACK STATIC DATA (If backend is offline)
// ==========================================
const fallbackCategories = [
  { id: 1, name: "Salon for Women", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=200&q=80" },
  { id: 2, name: "Spa for Women", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80" },
  { id: 3, name: "Facials", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&q=80" },
  { id: 4, name: "Body Care", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=200&q=80" },
  { id: 5, name: "Mani-Pedi", image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=200&q=80" },
  { id: 6, name: "Hair Care", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=200&q=80" },
  { id: 7, name: "Threading", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80" },
  { id: 8, name: "Packages", image: "https://images.unsplash.com/photo-1552693673-1bf958298935?w=200&q=80" },
];

const fallbackServices = [
  {
    id: "s1", type: "Facial", title: "Korean Glow Facial", rating: "4.8", reviews: "2.1K", duration: "1 hr 15 mins", price: "899", oldPrice: "1,699", discount: "47% OFF",
    image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=80",
    desc: "A multi-step Korean skincare ritual designed to deeply hydrate, brighten, and give your skin an glass-like luminous complexion."
  },
  {
    id: "s2", type: "Body Polishing", title: "Full Body Polishing", rating: "4.7", reviews: "1.8K", duration: "2 hrs 10 mins", price: "1,899", oldPrice: "4,999", discount: "62% OFF",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80",
    desc: "An intensive exfoliating and nourishing body treatment utilizing organic botanical scrubs and essential oils for ultimate radiance."
  },
  {
    id: "s3", type: "Waxing", title: "Rica Waxing", rating: "4.6", reviews: "1.2K", duration: "50 mins", price: "849", oldPrice: "1,399", discount: "39% OFF",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80",
    desc: "Gentle Italian Rica lipo-wax infused with natural oils for smooth, hair-free skin with zero irritation."
  },
  {
    id: "s4", type: "Mani-Pedi", title: "Manicure & Pedicure", rating: "4.5", reviews: "1.1K", duration: "1 hr 20 mins", price: "999", oldPrice: "1,799", discount: "44% OFF",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
    desc: "Complete cuticle care, nail shaping, relaxing massage, and premium polish application for hands and feet."
  }
];

const fallbackOffers = [
  {
    id: "o1",
    code: "BEAUTY20",
    discount: "20% OFF",
    type: "Percentage",
    expiry: "Valid on first booking"
  },
  {
    id: "o2",
    code: "GLOW500",
    discount: "₹500 Flat",
    type: "Flat Amount",
    expiry: "Min booking ₹1,500"
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

const trendingTabs = ["All", "Waxing", "Facial", "Body Polishing", "Mani-Pedi", "Hair Care"];
const heroCarouselImages = [
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1516975080661-460d3c0159f8?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80"
];

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 20 } }
};

export default function Main() {
  const [activeTab, setActiveTab] = useState("All");
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Live Backend Data States (with fallback initializers)
  const [categories, setCategories] = useState(fallbackCategories);
  const [trendingServices, setTrendingServices] = useState(fallbackServices);
  const [offers, setOffers] = useState(fallbackOffers);
  const [makeovers, setMakeovers] = useState(fallbackMakeovers);

  // Fetch Live Backend Data on Mount
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch Services and Offers concurrently
        const [servicesRes, offersRes] = await Promise.all([
          API.get("/api/services").catch(() => null),
          API.get("/api/offers").catch(() => null),
        ]);

        if (servicesRes?.data?.success && Array.isArray(servicesRes.data.data) && servicesRes.data.data.length > 0) {
          setTrendingServices(servicesRes.data.data);
        }

        if (offersRes?.data?.success) {
          const rawOffers = offersRes.data.data;
          const activeOffers = rawOffers.filter(o => o.status === "Active");
          if (activeOffers.length > 0) {
            setOffers(activeOffers);
          }
        }
      } catch (err) {
        console.warn("Using offline fallback data for Main page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveData();
  }, []);

  // Auto-play carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroCarouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredServices = activeTab === "All" 
    ? trendingServices 
    : trendingServices.filter(s => s.category === activeTab || s.type === activeTab);

  const handleToggleFavourite = async (service) => {
    try {
      await API.post("/api/users/favourites", { serviceId: service.id || service._id }).catch(() => {});
      setToastMsg(`✨ Pinned "${service.title || service.name}" to Favourites!`);
    } catch (e) {
      setToastMsg(`✨ Pinned to Favourites!`);
    }

    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setToastMsg(`📋 Promo code "${code}" copied to clipboard!`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-16 text-[#2D2623] relative overflow-x-hidden">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        whileInView="show" 
        viewport={{ once: true }}
        className="max-w-[1240px] mx-auto px-4 lg:px-8 pt-6 lg:pt-8"
      >
        
        {/* ================= HERO BANNER W/ CAROUSEL ================= */}
        <motion.section variants={fadeUp} className="relative w-full rounded-[2.5rem] overflow-hidden mb-12 shadow-sm border border-[#EADBD2] bg-[#EADBD2]">
          
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentHeroIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <SafeImage 
                  src={heroCarouselImages[currentHeroIndex]} 
                  alt="Hero Background" 
                  className="w-full h-full object-cover object-center"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-[#FCF9F6] via-[#FCF9F6]/80 to-transparent lg:via-[#FCF9F6]/70" />

          <div className="relative z-10 flex items-center min-h-[350px] lg:min-h-[440px] px-6 lg:px-16 py-10">
            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold tracking-widest text-[#8C7A70] uppercase mb-4">
                <span>Relax</span> <span className="h-1 w-1 rounded-full bg-[#C56E4E]" />
                <span>Rejuvenate</span> <span className="h-1 w-1 rounded-full bg-[#C56E4E]" />
                <span>Glow</span>
              </div>
              <h1 className="font-serif text-[2.5rem] sm:text-5xl lg:text-[4.5rem] leading-[1.1] text-[#2D2623] mb-4 font-bold">
                Your Moment <br/> <span className="text-[#C56E4E] italic font-normal">of Glow</span>
              </h1>
              <p className="text-sm lg:text-base text-[#5C4841] mb-8 font-medium max-w-sm lg:max-w-none">
                Premium beauty & spa services at your doorstep.
              </p>
              
              <Link to="/services" className="inline-flex items-center gap-3 rounded-full bg-[#C56E4E] px-7 lg:px-8 py-3.5 lg:py-4 text-sm font-bold text-white shadow-lg shadow-[#C56E4E]/30 transition-transform hover:-translate-y-1">
                Book Your Service <ArrowRight size={16} />
              </Link>

              <div className="hidden lg:flex items-center gap-6 mt-10 text-xs font-bold text-[#C56E4E]">
                <p className="flex items-center gap-1.5"><ShieldCheck size={16}/> Trained Experts</p>
                <p className="flex items-center gap-1.5"><Award size={16}/> Premium Products</p>
                <p className="flex items-center gap-1.5"><Clock3 size={16}/> On-Time Service</p>
              </div>
            </div>
          </div>

          {/* Dynamic Active Offer Badge */}
          {offers.length > 0 && (
            <div 
              onClick={() => handleCopyCoupon(offers[0].code)}
              className="absolute top-6 right-6 lg:top-10 lg:right-10 bg-white/95 backdrop-blur-md rounded-3xl p-4 lg:p-5 shadow-xl text-center border border-white transform rotate-3 max-w-[130px] lg:max-w-[150px] cursor-pointer hover:scale-105 transition-transform"
              title="Click to copy coupon code"
            >
              <p className="text-[9px] lg:text-[10px] font-bold text-[#8C7A70] uppercase tracking-wider">{offers[0].type || "Special Offer"}</p>
              <p className="font-serif text-xl lg:text-2xl font-bold text-[#C56E4E] leading-none my-1.5">{offers[0].discount}</p>
              <p className="text-[8px] lg:text-[9px] font-medium text-[#8C7A70] mb-3">{offers[0].expiry || "Active promo"}</p>
              <div className="bg-[#FFF6F0] rounded-lg py-1.5 border border-[#EADBD2] flex items-center justify-center gap-1">
                <Tag size={10} className="text-[#C56E4E]" />
                <p className="text-[8px] lg:text-[9px] text-[#C56E4E] font-bold uppercase tracking-wider">{offers[0].code}</p>
              </div>
            </div>
          )}
        </motion.section>

        {/* ================= CATEGORIES ================= */}
        <motion.section variants={fadeUp} className="mb-14">
          <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {categories.map((cat) => (
              <Link to={`/services?category=${cat.id}`} key={cat.id} className="group snap-start shrink-0 flex flex-col items-center gap-3 w-[90px] lg:w-[110px]">
                <div className="h-[90px] w-[90px] lg:h-[110px] lg:w-[110px] rounded-[1.5rem] bg-white overflow-hidden p-1.5 border border-[#EADBD2] transition-all group-hover:border-[#C56E4E] group-hover:shadow-md">
                  <SafeImage src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-[1rem] transition-transform duration-500 group-hover:scale-110" />
                </div>
                <span className="text-[11px] lg:text-xs font-bold text-[#5C4841] text-center leading-tight transition-colors group-hover:text-[#C56E4E]">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ================= TRENDING SERVICES ================= */}
        <motion.section variants={fadeUp} className="mb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-[#2D2623]">Trending Near You</h2>
            
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
              {trendingTabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === tab 
                      ? "bg-[#C56E4E] text-white shadow-md border border-[#C56E4E]" 
                      : "bg-white border border-[#EADBD2] text-[#8C7A70] hover:border-[#C56E4E] hover:text-[#C56E4E]"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <Link to="/services" className="shrink-0 px-4 py-2 flex items-center gap-1 text-xs font-bold text-[#C56E4E] ml-auto hover:underline">
                View All <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredServices.map((service) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    key={service._id || service.id} 
                    className="group bg-white rounded-[1.5rem] border border-[#EADBD2] p-3 shadow-sm hover:shadow-xl hover:border-[#C56E4E]/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-[180px] w-full rounded-xl overflow-hidden mb-4 bg-[#FFF6F0]">
                        <SafeImage src={service.image} alt={service.title || service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <button 
                          onClick={() => handleToggleFavourite(service)}
                          className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-full text-[#C56E4E] hover:bg-[#C56E4E] hover:text-white transition-colors shadow-sm cursor-pointer"
                        >
                          <Heart size={16} />
                        </button>
                      </div>

                      <div className="px-2">
                        <h3 className="font-serif text-[17px] font-bold text-[#2D2623] leading-tight mb-2">{service.title || service.name}</h3>
                        
                        <div className="flex items-center gap-3 text-xs text-[#8C7A70] mb-4">
                          <span className="flex items-center gap-1 font-bold text-[#E5A024]">
                            <Star size={12} className="fill-current" /> {service.rating || "4.8"} <span className="text-[#8C7A70] font-medium">({service.reviews || "1.2K"})</span>
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock size={12} /> {service.duration}
                          </span>
                        </div>

                        <div className="flex items-end gap-2 mb-5">
                          <span className="font-serif text-2xl font-bold text-[#2D2623]">₹{service.price}</span>
                          {service.oldPrice && <span className="text-xs font-bold text-[#A39292] line-through mb-1">₹{service.oldPrice}</span>}
                          {service.discount && <span className="text-[10px] font-bold text-[#1E9E4A] mb-1 ml-1">{service.discount}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="px-2 pb-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedService(service)}
                        className="w-full py-3 rounded-full bg-[#C56E4E] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#A35539] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Info size={15} /> Get More
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>

        {/* ================= PROMO BANNERS ================= */}
        <motion.section variants={fadeUp} className="grid lg:grid-cols-2 gap-6 mb-16">
          <div className="relative rounded-[2rem] overflow-hidden bg-[#FFF6F0] border border-[#EADBD2] p-8 flex items-center shadow-sm">
            <div className="relative z-10 w-1/2 pr-4">
              <h3 className="font-serif text-3xl font-bold text-[#C56E4E] leading-tight mb-4">
                All-in-One <br/><span className="text-[#2D2623]">Salon Care</span>
              </h3>
              <ul className="text-xs font-bold text-[#5C4841] space-y-2 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#C56E4E]"/> Facial & Waxing</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#C56E4E]"/> Mani-Pedi</li>
              </ul>
              <Link to="/packages" className="inline-flex bg-[#C56E4E] text-white text-xs font-bold px-5 py-3 rounded-full hover:bg-[#A35539] transition-colors">
                Customize Package <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-[55%]">
               <SafeImage src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80" alt="Promo" className="w-full h-full object-cover rounded-l-full opacity-90 mix-blend-multiply" />
            </div>
          </div>

          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-r from-[#FCF9F6] to-[#FFF6F0] border border-[#EADBD2] p-8 flex items-center shadow-sm">
            <div className="relative z-10 w-[60%]">
              <p className="text-[10px] font-bold text-[#8C7A70] uppercase tracking-widest mb-1">Brand Spotlight</p>
              <h3 className="font-serif text-3xl font-bold text-[#2D2623] leading-tight mb-2">SOKORA</h3>
              <p className="text-sm font-bold text-[#C56E4E] mb-6">Korean Skincare Rituals</p>
              <Link to="/offers" className="inline-flex border border-[#2D2623] text-[#2D2623] text-xs font-bold px-5 py-3 rounded-full hover:bg-[#2D2623] hover:text-white transition-colors">
                Shop Now <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-1/2">
               <SafeImage src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80" alt="Products" className="w-full h-full object-cover mix-blend-multiply opacity-80" />
            </div>
          </div>
        </motion.section>

        {/* ================= BEFORE & AFTER CAROUSEL ================= */}
        <motion.section variants={fadeUp} className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl lg:text-3xl font-bold text-[#2D2623]">Real Results</h2>
              <p className="text-sm text-[#8C7A70] mt-1 font-medium">Drag the sliders to see the transformations.</p>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x px-1">
            {makeovers.map((item) => (
              <BeforeAfterSlider 
                key={item.id} 
                title={item.title} 
                beforeImg={item.beforeImg} 
                afterImg={item.afterImg} 
              />
            ))}
          </div>
        </motion.section>

        {/* ================= INFO SECTIONS ================= */}
        <motion.section variants={fadeUp} className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-[2rem] border border-[#EADBD2] p-6 lg:p-8 mb-16 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-[#2D2623] mb-6 border-b border-[#EADBD2] pb-3">Why Choose BeautyVibe?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-3 items-start">
                <ShieldCheck size={20} className="text-[#C56E4E] shrink-0" />
                <div><p className="text-xs font-bold text-[#5C4841]">Verified Professionals</p></div>
              </div>
              <div className="flex gap-3 items-start">
                <Award size={20} className="text-[#C56E4E] shrink-0" />
                <div><p className="text-xs font-bold text-[#5C4841]">Premium Products</p></div>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 size={20} className="text-[#C56E4E] shrink-0" />
                <div><p className="text-xs font-bold text-[#5C4841]">Safe & Hygienic</p></div>
              </div>
              <div className="flex gap-3 items-start">
                <ThumbsUp size={20} className="text-[#C56E4E] shrink-0" />
                <div><p className="text-xs font-bold text-[#5C4841]">10K+ Happy Customers</p></div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#2D2623] mb-6 border-b border-[#EADBD2] pb-3">How It Works?</h3>
            <div className="flex justify-between items-center gap-1 sm:gap-2">
              {[
                { step: "1", label: "Choose Service" },
                { step: "2", label: "Select Time" },
                { step: "3", label: "Confirm Booking" },
                { step: "4", label: "Relax & Enjoy" }
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-[#FFF6F0] text-[#C56E4E] font-bold text-sm flex items-center justify-center border border-[#EADBD2] shadow-sm">{s.step}</div>
                  <p className="text-[10px] font-bold text-[#5C4841] max-w-[60px] leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ================= MASSIVE TRANSPARENT QUOTE ================= */}
        <motion.section 
          className="w-full pt-10 pb-16 flex flex-col justify-center items-center pointer-events-none select-none max-w-full overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center w-full text-[clamp(2.5rem,7vw,5.5rem)] font-serif leading-[1.1] font-bold text-[#D3A796]/40 drop-shadow-sm">
            
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              <AnimatedWord word="With" delay={0.1} />
              <AnimatedWord word="Love" delay={0.2} />
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                className="flex items-center justify-center ml-2"
              >
                <Heart 
                  className="text-[#C56E4E]/40 w-[clamp(2.5rem,7vw,4.5rem)] h-[clamp(2.5rem,7vw,4.5rem)]" 
                  fill="currentColor" 
                />
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

      {/* ================= SERVICE DETAILS MODAL W/ AUTO-PLAY VIDEO WALKTHROUGH ================= */}
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
              className="fixed inset-0 z-50 m-auto max-w-lg w-full h-fit max-h-[92vh] overflow-y-auto rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl border border-[#EADBD2]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#EADBD2] mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#C56E4E]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C56E4E]">{selectedService.type || selectedService.category} Ritual Walkthrough</span>
                </div>
                <button 
                  onClick={() => setSelectedService(null)} 
                  className="grid h-9 w-9 place-items-center rounded-full bg-[#FFF6F0] text-[#8C7A70] hover:text-[#C56E4E] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Embedded Video Walkthrough Preview */}
              <div className="relative h-52 sm:h-56 w-full rounded-2xl overflow-hidden mb-6 bg-black shadow-inner border border-[#EADBD2]">
                <iframe
                  className="w-full h-full object-cover scale-[1.05] pointer-events-none"
                  src="https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&controls=0&loop=1&playlist=ScMzIvxBSi4&modestbranding=1&showinfo=0"
                  title="Service Demonstration Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <h2 className="font-serif text-2xl font-bold text-[#2D2623] mb-2">{selectedService.title || selectedService.name}</h2>
              <p className="text-xs font-medium text-[#8C7A70] leading-relaxed mb-6">{selectedService.desc || selectedService.description}</p>

              <div className="bg-[#FCF9F6] rounded-2xl p-4 border border-[#EADBD2] text-xs space-y-2 mb-6">
                <div className="flex justify-between"><span className="text-[#8C7A70]">Duration:</span> <strong className="text-[#2D2623]">{selectedService.duration}</strong></div>
                <div className="flex justify-between"><span className="text-[#8C7A70]">Customer Rating:</span> <strong className="text-[#E5A024]">★ {selectedService.rating || "4.8"} ({selectedService.reviews || "1.2K"} verified reviews)</strong></div>
                <div className="flex justify-between"><span className="text-[#8C7A70]">Special Price:</span> <strong className="text-[#C56E4E] text-base">₹{selectedService.price}</strong></div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleFavourite(selectedService)}
                  className="flex-1 py-3.5 rounded-full border border-[#C56E4E] text-[#C56E4E] text-xs font-bold uppercase tracking-wider hover:bg-[#FFF6F0] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Heart size={16} /> Pin to Favourites
                </button>

                <Link
                  to="/book-appointment"
                  onClick={() => setSelectedService(null)}
                  className="flex-1 py-3.5 rounded-full bg-[#C56E4E] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#A35539] transition-colors flex items-center justify-center gap-2 text-center"
                >
                  Book Now <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= TOAST NOTIFICATION ================= */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-full bg-[#2D2623]/95 px-6 py-3.5 text-white shadow-2xl backdrop-blur-xl border border-white/20 text-xs font-bold"
          >
            <CheckCircle2 size={16} className="text-[#E5A024]" /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
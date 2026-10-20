import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  SlidersHorizontal, 
  Star, 
  Heart,
  CheckCircle2,
  ChevronDown,
  Check
} from "lucide-react";

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
// PREMIUM MOCK DATA
// ==========================================
const data = [
  { id: "haircut", name: "Signature Hair Styling", category: "Hair", price: 299, duration: "45 min", image: "1562322140-8baeececf3df", desc: "A fresh, personalized look tailored specifically to your features.", rating: "4.9", reviews: "1.2K" },
  { id: "hairspa", name: "Deep Nourish Hair Spa", category: "Hair", price: 499, duration: "60 min", image: "1521590832167-7bcbfaa6381f", desc: "Intensive care restoring shine and vitality to damaged hair.", rating: "4.8", reviews: "850" },
  { id: "facial", name: "24K Gold Glow Facial", category: "Skin", price: 899, duration: "75 min", image: "1570172619644-dfd03ed5d881", desc: "Our premium facial for a radiant, youthful, and lasting glow.", rating: "5.0", reviews: "2.1K" },
  { id: "manicure", name: "Classic Mani-Pedi", category: "Nails", price: 499, duration: "45 min", image: "1604654894610-df63bc536371", desc: "Complete care, shaping, and premium polish for your hands and feet.", rating: "4.7", reviews: "920" },
  { id: "beard", name: "Gentleman's Grooming", category: "Grooming", price: 299, duration: "30 min", image: "1621605815971-fbc98d665033", desc: "Precision beard shaping and hot towel treatment.", rating: "4.8", reviews: "640" },
  { id: "makeup", name: "Bridal Elegance Makeup", category: "Beauty", price: 4999, duration: "120 min", image: "1487412720507-e7ab37603c6f", desc: "Flawless, long-lasting makeup for your most special day.", rating: "4.9", reviews: "3.4K" },
  { id: "massage", name: "Aromatherapy Massage", category: "Spa", price: 1299, duration: "90 min", image: "1544161515-4ab6ce6db874", desc: "Full body relaxation using premium essential oils.", rating: "4.9", reviews: "1.8K" },
  { id: "waxing", name: "Painless Rica Waxing", category: "Skin", price: 699, duration: "45 min", image: "1556228578-0d85b1a4d571", desc: "Smooth, hair-free skin with our gentle Italian wax.", rating: "4.6", reviews: "1.1K" },
];

const categoriesList = ["All", "Hair", "Skin", "Nails", "Spa", "Beauty", "Grooming"];
const imageUrl = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 20 } }
};

export default function Services() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  const sortRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [favourites, setFavourites] = useState(() => {
    try {
      const saved = localStorage.getItem("beautyvibe_favourites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("beautyvibe_favourites", JSON.stringify(favourites));
    } catch (e) {
      console.error(e);
    }
  }, [favourites]);

  const toggleFavourite = (service) => {
    const isAlreadyFav = favourites.some((item) => item.id === service.id);
    let updated;
    if (isAlreadyFav) {
      updated = favourites.filter((item) => item.id !== service.id);
      setToastMessage(`Removed ${service.name} from Favourites`);
    } else {
      updated = [...favourites, service];
      setToastMessage(`✨ Added "${service.name}" to Favourites! Thank you for choosing BeautyVibe.`);
    }
    setFavourites(updated);

    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const filtered = useMemo(() => {
    let list = data.filter((s) =>
      (category === "All" || s.category === category) &&
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [category, search, sort]);

  const sortLabelMap = {
    featured: "Featured",
    low: "Price: Low - High",
    high: "Price: High - Low"
  };

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-24 relative">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="mx-auto w-full max-w-[1440px] px-3 sm:px-6 lg:px-10 pt-6"
      >
        {/* ================= PREMIUM HERO SECTION ================= */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-[#2D2623] p-6 sm:p-12 md:p-16 shadow-xl mb-10 flex items-center min-h-[260px] lg:min-h-[300px]">
          <div className="absolute inset-0 z-0">
            <SafeImage 
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80" 
              alt="Salon Interior" 
              className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2D2623] via-[#2D2623]/80 to-transparent" />
          </div>

          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#C56E4E] rounded-full blur-[140px] opacity-30 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 mb-4 shadow-lg">
              <Sparkles size={14} className="text-[#E5A024]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F3E8E1]">Curated Experiences</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[4rem] font-bold leading-[1.05] mb-4">
              Elevate Your <br/><span className="text-[#D9A087] italic font-normal">Self-Care Ritual</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base font-medium text-[#D3C5BF] max-w-md">
              Discover our premium range of beauty and grooming services, meticulously crafted by experts to bring out your natural glow.
            </p>
          </div>
        </motion.div>

        {/* ================= FILTERS & CUSTOM SORT DRAWER ================= */}
        <motion.div variants={fadeUp} className="mb-8 bg-[#FCF9F6] py-3 border-b border-[#EADBD2]/60">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x w-full lg:w-auto">
              {categoriesList.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`relative snap-start shrink-0 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                    category === c 
                      ? "bg-[#C56E4E] text-white shadow-md" 
                      : "bg-white border border-[#EADBD2] text-[#8C7A70] hover:text-[#C56E4E]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Search & Custom Sort Drawer Controls */}
            <div className="flex flex-row items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-72 flex items-center bg-white border border-[#EADBD2] rounded-full px-4 py-2.5 focus-within:border-[#C56E4E] transition-all shadow-sm">
                <Search size={16} className="text-[#8C7A70] mr-2.5 shrink-0" />
                <input 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder="Search rituals..." 
                  className="bg-transparent border-none outline-none w-full text-xs sm:text-sm font-medium text-[#2D2623] placeholder:text-[#A39292]" 
                />
              </div>
              
              {/* Custom Luxury Sort Dropdown */}
              <div className="relative shrink-0" ref={sortRef}>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 bg-white border border-[#EADBD2] rounded-full px-3.5 sm:px-4 py-2.5 hover:border-[#C56E4E] transition-all shadow-sm text-xs font-bold text-[#5C4841]"
                >
                  <SlidersHorizontal size={16} className="text-[#8C7A70] shrink-0" />
                  <span className="hidden sm:inline">{sortLabelMap[sort]}</span>
                  <ChevronDown size={14} className={`text-[#8C7A70] transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                      className="absolute right-0 top-12 w-52 rounded-2xl bg-white border border-[#EADBD2] shadow-xl p-2 z-50 overflow-hidden"
                    >
                      {[
                        { id: "featured", label: "Featured" },
                        { id: "low", label: "Price: Low - High" },
                        { id: "high", label: "Price: High - Low" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSort(item.id);
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            sort === item.id 
                              ? "bg-[#FFF6F0] text-[#C56E4E]" 
                              : "text-[#5C4841] hover:bg-[#FCF9F6] hover:text-[#2D2623]"
                          }`}
                        >
                          <span>{item.label}</span>
                          {sort === item.id && <Check size={14} className="text-[#C56E4E]" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </motion.div>

        {/* ================= RESULTS INFO ================= */}
        <motion.div variants={fadeUp} className="mb-6 flex items-center justify-between">
          <p className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-widest">
            Showing {filtered.length} {filtered.length === 1 ? 'Ritual' : 'Rituals'}
          </p>
        </motion.div>

        {/* ================= RESULTS GRID (ENFORCED 2x2 ON MOBILE & TABLET) ================= */}
        <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((s) => {
              const isFav = favourites.some((item) => item.id === s.id);

              return (
                <motion.article 
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.35, type: "spring", stiffness: 100 }}
                  key={s.id} 
                  className="group flex flex-col bg-white overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-[#EADBD2] shadow-sm hover:shadow-xl hover:border-[#C56E4E]/50 transition-all duration-500"
                >
                  <div className="relative h-[150px] sm:h-[220px] w-full bg-[#FFF6F0] overflow-hidden">
                    <SafeImage 
                      src={imageUrl(s.image)} 
                      alt={s.name} 
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                    />
                    <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold text-[#C56E4E] uppercase tracking-wider shadow-sm">
                      {s.category}
                    </div>

                    <button 
                      onClick={() => toggleFavourite(s)}
                      title={isFav ? "Remove from favourites" : "Add to favourites"}
                      className={`absolute top-2.5 right-2.5 sm:top-4 sm:right-4 backdrop-blur-md p-2 sm:p-2.5 rounded-full shadow-sm transition-all duration-300 ${
                        isFav 
                          ? "bg-[#C56E4E] text-white scale-110" 
                          : "bg-white/95 text-[#A39292] hover:text-[#C56E4E] hover:bg-[#FFF6F0]"
                      }`}
                    >
                      <Heart size={14} className="sm:w-4 sm:h-4" fill={isFav ? "currentColor" : "none"} />
                    </button>
                  </div>
                  
                  <div className="flex flex-col flex-1 p-3.5 sm:p-6 text-[#2D2623]">
                    <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                      <h2 className="font-serif text-sm sm:text-[18px] font-bold leading-tight pr-1 group-hover:text-[#C56E4E] transition-colors line-clamp-1">
                        {s.name}
                      </h2>
                      <div className="flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-[#E5A024] bg-[#FFF6F0] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shrink-0">
                        <Star size={10} className="fill-current sm:w-3 sm:h-3" /> {s.rating}
                      </div>
                    </div>
                    
                    <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-[13px] font-medium text-[#8C7A70] line-clamp-2 flex-1 leading-relaxed">
                      {s.desc}
                    </p>
                    
                    <div className="mt-3 sm:mt-5 flex flex-col sm:flex-row sm:items-end justify-between border-t border-[#EADBD2]/60 pt-3 sm:pt-4 mb-3.5 sm:mb-5 gap-1 sm:gap-0">
                      <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[#8C7A70] bg-[#FCF9F6] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-[#EADBD2]/50 w-fit">
                        <Clock className="text-[#C56E4E]" size={12} />
                        {s.duration}
                      </span>
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#A39292] uppercase tracking-wider block mb-0.5">Starts at</span>
                        <strong className="font-serif text-base sm:text-2xl font-bold">
                          ₹{s.price.toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>
                    
                    <Link 
                      to={`/services/${s.id}`} 
                      className="flex items-center justify-center gap-1.5 w-full rounded-full bg-[#2D2623] py-2.5 sm:py-3.5 text-[11px] sm:text-[13px] font-bold text-white transition-all duration-300 group-hover:bg-[#C56E4E] shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Book <span className="hidden sm:inline">Appointment</span> <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[2rem] border border-[#EADBD2] shadow-sm mt-4 text-[#2D2623]"
          >
            <h3 className="font-serif text-xl font-bold mb-2">No rituals found</h3>
            <p className="text-xs text-[#8C7A70]">We couldn't find any services matching your search.</p>
          </motion.div>
        )}
      </motion.main>

      {/* ================= LUXURY FLOATING TOAST POPUP ================= */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-full bg-[#2D2623]/95 px-6 py-3.5 text-white shadow-2xl backdrop-blur-xl border border-white/20 max-w-md w-[90%] sm:w-auto text-center justify-center"
          >
            <CheckCircle2 size={18} className="text-[#E5A024] shrink-0" />
            <span className="text-xs sm:text-sm font-medium tracking-wide">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
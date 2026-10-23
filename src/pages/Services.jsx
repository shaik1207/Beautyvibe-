import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Heart, ArrowRight, Sparkles, Search, CheckCircle2, Info } from "lucide-react";
import axios from "axios";

// ==========================================
// AXIOS CLIENT HELPER
// ==========================================
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("beautyvibe_user_token") || localStorage.getItem("beautyvibe_admin_token") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// FALLBACK STATIC CATALOG (Ensures page never breaks)
// ==========================================
const fallbackServices = [
  {
    id: "haircut",
    name: "Signature Hair Styling",
    category: "Hair",
    price: 299,
    duration: "45 mins",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
    description: "Refresh your look with a precision style tailored specifically to your facial features and preferences.",
    rating: "4.9",
    reviews: "1.2K"
  },
  {
    id: "hairspa",
    name: "Deep Nourish Hair Spa",
    category: "Hair",
    price: 499,
    duration: "60 mins",
    image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80",
    description: "Enjoy a deeply relaxing hair-care treatment focused on scalp nourishment, softness, and vibrant shine.",
    rating: "4.8",
    reviews: "850"
  },
  {
    id: "facial",
    name: "24K Gold Glow Facial",
    category: "Skin",
    price: 899,
    duration: "75 mins",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    description: "A refreshing multi-step facial selected to deeply hydrate, brighten, and give your skin a luminous complexion.",
    rating: "5.0",
    reviews: "2.1K"
  },
  {
    id: "manicure",
    name: "Classic Mani-Pedi",
    category: "Nails",
    price: 499,
    duration: "45 mins",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
    description: "Give your hands and feet complete cuticle care, precise nail shaping, and a neat, refreshed finish.",
    rating: "4.7",
    reviews: "920"
  },
  {
    id: "beard",
    name: "Gentleman's Grooming",
    category: "Grooming",
    price: 299,
    duration: "30 mins",
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80",
    description: "Professional beard shaping, trimming, and hot towel treatment for a clean, well-groomed appearance.",
    rating: "4.8",
    reviews: "640"
  },
  {
    id: "makeup",
    name: "Bridal Elegance Makeup",
    category: "Beauty",
    price: 4999,
    duration: "120 mins",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    description: "A personalized, flawless, long-lasting makeup session crafted specifically for your most special occasions.",
    rating: "4.9",
    reviews: "3.4K"
  }
];

const categories = ["All", "Hair", "Skin", "Nails", "Grooming", "Beauty"];

export default function Services() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [services, setServices] = useState(fallbackServices);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Load existing favorites from localStorage on component mount
  useEffect(() => {
    const savedFavs = localStorage.getItem("beautyvibe_user_favorites");
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error("Error parsing favorites:", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/services");
        
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setServices(res.data.data);
        }
      } catch (err) {
        console.warn("Failed to fetch live services, using offline fallback catalog.");
        // Keeps fallbackServices intact
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory === "All" || 
      (s.category && s.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch = (s.title || s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleFavourite = async (service) => {
    const sId = String(service.id || service._id);
    let updatedFavs;
    let isAdding = true;

    // Toggle logic: remove if exists, add if missing
    if (favorites.includes(sId)) {
      updatedFavs = favorites.filter(id => id !== sId);
      isAdding = false;
    } else {
      updatedFavs = [...favorites, sId];
    }

    // Update state and localStorage
    setFavorites(updatedFavs);
    localStorage.setItem("beautyvibe_user_favorites", JSON.stringify(updatedFavs));
    
    // Dispatch event to sync with other tabs or components
    window.dispatchEvent(new Event("storage"));

    setToastMsg(isAdding ? `✨ Pinned "${service.title || service.name}" to Favourites!` : `💔 Removed from Favourites`);
    setTimeout(() => setToastMsg(null), 3000);

    // Silently attempt backend sync if supported
    try {
      await API.post("/api/users/favourites", { serviceId: sId }).catch(() => {});
    } catch (e) {}
  };

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-24 text-[#2D2623]">
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Banner */}
        <div className="relative rounded-[2.5rem] bg-[#2D2623] p-8 lg:p-12 text-white overflow-hidden mb-10 shadow-lg">
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 pointer-events-none">
            <img src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80" alt="Banner" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 mb-4 backdrop-blur-md">
              <Sparkles size={14} className="text-[#E5A024]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5A024]">Explore Catalog</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Professional Salon & Spa Rituals
            </h1>
            <p className="text-xs sm:text-sm text-[#EADBD2]/80 leading-relaxed">
              Discover our comprehensive menu of doorstep beauty services delivered by certified experts using premium organic products.
            </p>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <div className="flex overflow-x-auto gap-2 pb-2 w-full md:w-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-[#C56E4E] text-white shadow-md"
                    : "bg-white border border-[#EADBD2] text-[#8C7A70] hover:border-[#C56E4E] hover:text-[#C56E4E]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A70]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full rounded-full border border-[#EADBD2] bg-white py-3 pl-11 pr-4 text-xs font-semibold text-[#2D2623] outline-none focus:border-[#C56E4E] shadow-sm"
            />
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-[2rem] border border-[#EADBD2] p-4 animate-pulse">
                <div className="h-52 w-full rounded-2xl bg-[#EADBD2]/40 mb-4" />
                <div className="h-5 bg-[#EADBD2]/40 rounded w-3/4 mb-3" />
                <div className="h-4 bg-[#EADBD2]/30 rounded w-1/2 mb-6" />
                <div className="h-11 bg-[#EADBD2]/40 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-[#EADBD2] bg-white p-12 text-center shadow-sm">
            <h3 className="font-serif text-2xl font-bold mb-2">No Services Found</h3>
            <p className="text-xs text-[#8C7A70] mb-6">No rituals match your search query or selected category.</p>
            <button
              onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              className="rounded-full bg-[#C56E4E] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#A35539]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service) => {
                const sId = String(service._id || service.id);
                const sName = service.title || service.name;
                const sImg = service.image?.startsWith("http") ? service.image : `https://images.unsplash.com/photo-${service.image}?auto=format&fit=crop&w=800&q=80`;
                const isFavorited = favorites.includes(sId);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={sId}
                    className="group bg-white rounded-[2rem] border border-[#EADBD2] p-4 shadow-sm hover:shadow-xl hover:border-[#C56E4E]/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-52 w-full rounded-2xl overflow-hidden mb-4 bg-[#FFF6F0]">
                        <img src={sImg} alt={sName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <button
                          onClick={() => handleToggleFavourite(service)}
                          className={`absolute top-3 right-3 backdrop-blur-md p-2.5 rounded-full transition-colors shadow-sm cursor-pointer ${
                            isFavorited 
                              ? "bg-[#C56E4E] text-white" 
                              : "bg-white/90 text-[#C56E4E] hover:bg-[#C56E4E] hover:text-white"
                          }`}
                        >
                          <Heart size={16} className={isFavorited ? "fill-current" : ""} />
                        </button>
                      </div>

                      <div className="px-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C56E4E]">{service.category || "Ritual"}</span>
                          <span className="flex items-center gap-1 text-xs font-bold text-[#E5A024]">
                            <Star size={12} className="fill-current" /> {service.rating || "4.8"}
                          </span>
                        </div>

                        <h3 className="font-serif text-xl font-bold text-[#2D2623] leading-tight mb-2">{sName}</h3>
                        <p className="text-xs font-medium text-[#8C7A70] line-clamp-2 mb-4 leading-relaxed">{service.description || service.desc}</p>

                        <div className="flex items-center justify-between pt-3 border-t border-[#EADBD2]/60 mb-5">
                          <span className="font-serif text-2xl font-bold text-[#2D2623]">₹{Number(service.price).toLocaleString("en-IN")}</span>
                          <span className="flex items-center gap-1 text-xs font-medium text-[#8C7A70]"><Clock size={13} /> {service.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/services/${sId}`}
                        className="flex-1 py-3.5 rounded-full border border-[#C56E4E] text-[#C56E4E] text-xs font-bold uppercase tracking-wider text-center hover:bg-[#FFF6F0] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Info size={14} /> Details
                      </Link>
                      <Link
                        to={`/book-appointment?service=${sId}`}
                        className="flex-1 py-3.5 rounded-full bg-[#C56E4E] text-white text-xs font-bold uppercase tracking-wider text-center shadow-md hover:bg-[#A35539] transition-colors flex items-center justify-center gap-1.5"
                      >
                        Book <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-full bg-[#2D2623]/95 px-6 py-3.5 text-white shadow-2xl backdrop-blur-xl border border-white/20 text-xs font-bold whitespace-nowrap"
          >
            <CheckCircle2 size={16} className="text-[#E5A024]" /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
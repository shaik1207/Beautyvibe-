import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Flame, 
  Percent, 
  RefreshCw, 
  Heart,
  CheckCircle2,
  Trash2
} from "lucide-react";
import API from "../services/axios";

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 20 } }
};

export default function Favorites() {
  const [servicesList, setServicesList] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Load favorites from localStorage securely
  const loadFavorites = () => {
    const savedFavs = localStorage.getItem("beautyvibe_user_favorites");
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error("Error parsing favorites:", e);
        setFavorites([]);
      }
    }
  };

  useEffect(() => {
    loadFavorites();

    // Optional: Listen for storage events to sync favorites across multiple tabs
    const handleStorageChange = (e) => {
      if (e.key === "beautyvibe_user_favorites") {
        loadFavorites();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 2. Fetch Services from Backend
  const fetchLiveServices = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/services");
      const raw = res.data?.data || res.data || [];
      
      if (Array.isArray(raw)) {
        const formatted = raw.map(s => ({
          id: s._id || s.id,
          name: s.title || s.name,
          category: s.category || "General",
          price: Number(s.price) || 0,
          duration: s.duration || "60 mins",
          isTrending: s.isTrending ?? false,
          discountApplicable: s.discountApplicable ?? true,
          image: s.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
          description: s.desc || s.description || "Professional doorstep salon ritual."
        }));
        setServicesList(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch live services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveServices();
  }, []);

  // 3. Robust Type-Agnostic Removal
  const removeFavorite = (e, srvId) => {
    e.preventDefault();
    e.stopPropagation();

    // Convert both IDs to strings to prevent Type Mismatch bugs
    const updatedFavs = favorites.filter(id => String(id) !== String(srvId));
    setFavorites(updatedFavs);
    localStorage.setItem("beautyvibe_user_favorites", JSON.stringify(updatedFavs));
    
    // Dispatch storage event so other components (like Services) update immediately
    window.dispatchEvent(new Event("storage"));
    
    showToast("💔 Removed from your favorites");
  };

  // 4. Robust Type-Agnostic Filtering
  // Fixes the bug where "1" !== 1
  const favoriteServices = servicesList.filter(srv => 
    favorites.some(favId => String(favId) === String(srv.id))
  );

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-32 text-[#2D2623] relative">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="max-w-[1440px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-8"
      >
        
        {/* Header Banner */}
        <motion.div variants={fadeUp} className="bg-[#2D2623] text-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#C56E4E] rounded-full blur-[120px] opacity-30 pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 mb-3 shadow-lg">
              <Heart size={14} className="fill-rose-500 text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F3E8E1]">My Saved Rituals</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">Favorite Treatments</h1>
            <p className="text-xs sm:text-sm text-[#D3C5BF] max-w-lg">
              Quickly access and book your bookmarked luxury salon and doorstep packages anytime.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-sm">
              <Sparkles size={14} className="text-[#E5A024]" />
              <span>{favoriteServices.length} Saved Rituals</span>
            </div>
          </div>
        </motion.div>

        {/* Services Grid */}
        {loading && servicesList.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[2.5rem] border border-[#EADBD2]">
            <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-[#C56E4E]" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Loading your favorite rituals...</p>
          </div>
        ) : favoriteServices.length > 0 ? (
          <motion.div variants={fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteServices.map((srv) => (
              <motion.div
                layout
                key={srv.id}
                className="bg-white rounded-[2.5rem] border border-[#EADBD2] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#C56E4E]/40 transition-all duration-300 flex flex-col justify-between relative group"
              >
                {/* Remove Favorite Button */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => removeFavorite(e, srv.id)}
                  title="Remove from favorites"
                  className="absolute top-4 left-4 z-20 h-10 w-10 rounded-full bg-white/95 backdrop-blur-md border border-[#EADBD2] flex items-center justify-center shadow-md cursor-pointer hover:bg-rose-50 hover:text-rose-600 transition-all text-rose-500"
                >
                  <Trash2 size={16} />
                </motion.button>

                {/* Badges on Top Right */}
                <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5">
                  {srv.isTrending && (
                    <span className="bg-[#C56E4E] text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Flame size={12} /> Trending
                    </span>
                  )}
                  {srv.discountApplicable && (
                    <span className="bg-[#1E9E4A] text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Percent size={10} /> Discount Applicable
                    </span>
                  )}
                </div>

                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-[#FFF6F0]">
                    <img src={srv.image} alt={srv.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-bold text-[#C56E4E] uppercase tracking-wider shadow-sm">
                      {srv.category}
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-[#8C7A70]">REF: {String(srv.id).slice(-6).toUpperCase()}</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-[#8C7A70] bg-[#FCF9F6] px-2.5 py-1 rounded-lg border border-[#EADBD2]">
                        <Clock size={13} className="text-[#C56E4E]" /> {srv.duration}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#2D2623] mb-2">{srv.name}</h3>
                    <p className="text-xs text-[#8C7A70] leading-relaxed mb-6 line-clamp-2">{srv.description}</p>
                  </div>
                </div>

                <div className="p-6 sm:pt-0 sm:px-8 sm:pb-8 flex items-center justify-between border-t border-[#EADBD2]/60 pt-4 mt-auto">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A39292] block">Price</span>
                    <strong className="font-serif text-2xl font-bold text-[#2D2623]">₹{Number(srv.price).toLocaleString("en-IN")}</strong>
                  </div>

                  <Link
                    to={`/book-appointment?service=${srv.id}`}
                    className="flex items-center gap-2 rounded-full bg-[#C56E4E] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#A35539] transition-all cursor-pointer"
                  >
                    Book Now <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[2.5rem] border border-[#EADBD2] p-8 space-y-4">
            <Heart size={36} className="mx-auto text-[#C56E4E] opacity-60" />
            <h3 className="font-serif text-2xl font-bold text-[#2D2623]">No Favorites Saved Yet</h3>
            <p className="text-xs text-[#8C7A70] max-w-sm mx-auto">
              Explore our luxury catalog and click the heart icon on any service to bookmark it here for quick booking.
            </p>
            <div>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full bg-[#C56E4E] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-[#A35539] transition-all cursor-pointer"
              >
                Explore Services Catalog <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

      </motion.main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-full bg-[#2D2623]/95 px-6 py-3.5 text-white shadow-2xl backdrop-blur-xl border border-white/20 text-xs font-bold"
          >
            <CheckCircle2 size={16} className="text-[#E5A024]" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
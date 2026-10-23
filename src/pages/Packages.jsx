import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, ArrowRight, Scissors, RefreshCw, CheckCircle2 } from "lucide-react";
import { io } from "socket.io-client";
import API from "../services/axios";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 20 } }
};

export default function UserPackages() {
  const navigate = useNavigate();
  const [packagesList, setPackagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/packages");
      const raw = res.data?.data || res.data || [];
      if (Array.isArray(raw)) {
        setPackagesList(raw);
      }
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();

    // Dynamically resolve socket URL safely for local and production deployment
    const socketBase = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL;
    let socketUrl = "http://localhost:5000";
    if (typeof socketBase === "string" && socketBase.trim().length > 0) {
      const match = socketBase.match(/(https?:\/\/[^\s)\]'"]+)/);
      if (match) socketUrl = match[1].replace(/\/$/, "");
    } else if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      socketUrl = window.location.origin;
    }

    const socket = io(socketUrl, {
      transports: ["polling", "websocket"],
      reconnection: true,
      secure: socketUrl.startsWith("https")
    });

    socket.on("packageAdded", (newPkg) => {
      setPackagesList(prev => {
        if (prev.some(p => (p._id && p._id === newPkg._id) || (p.id && p.id === newPkg.id))) return prev;
        return [newPkg, ...prev];
      });
      showToast(`✨ New Luxury Bundle Available: ${newPkg.name}!`);
    });

    socket.on("packageDeleted", (deletedId) => {
      setPackagesList(prev => prev.filter(p => p._id !== deletedId && p.id !== deletedId));
    });

    return () => socket.disconnect();
  }, []);

  const handleBookBundle = (pkg) => {
    const bookingDraft = {
      serviceId: pkg._id || pkg.id,
      serviceName: pkg.name,
      category: "Luxury Package",
      price: pkg.price,
      duration: pkg.duration,
      image: pkg.image,
      type: "HOME",
      date: new Date().toISOString().split('T')[0],
      time: "10:00 AM"
    };

    sessionStorage.setItem("beautyvibe_booking_draft", JSON.stringify(bookingDraft));
    navigate("/checkout");
  };

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-36 text-[#2D2623] relative">
      <motion.main variants={staggerContainer} initial="hidden" animate="show" className="max-w-[1440px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Banner */}
        <motion.div variants={fadeUp} className="bg-[#2D2623] text-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#C56E4E] rounded-full blur-[120px] opacity-30 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 mb-3 shadow-lg">
              <Sparkles size={14} className="text-[#E5A024]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F3E8E1]">Curated Bundles</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">Luxury Service Packages</h1>
            <p className="text-xs sm:text-sm text-[#D3C5BF] max-w-lg">
              Experience multi-treatment transformations combined into exclusive discount packages delivered directly to your doorstep.
            </p>
          </div>
          <button onClick={fetchPackages} className="h-10 w-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer shrink-0">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </motion.div>

        {/* Packages Grid */}
        {loading && packagesList.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[2.5rem] border border-[#EADBD2]">
            <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-[#C56E4E]" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Loading luxury packages...</p>
          </div>
        ) : packagesList.length > 0 ? (
          <motion.div variants={fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packagesList.map((pkg, idx) => (
              <motion.div
                layout
                key={pkg._id || pkg.id || `user-pkg-${idx}`}
                className="bg-white rounded-[2.5rem] border border-[#EADBD2] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#C56E4E]/40 transition-all duration-300 flex flex-col justify-between relative group"
              >
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-[#C56E4E] text-white px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                    {pkg.badge || "Special Bundle"}
                  </span>
                </div>

                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-[#FFF6F0]">
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-6 text-white">
                      <span className="text-[10px] font-mono tracking-widest opacity-80">REF: {String(pkg._id || pkg.id || idx).slice(-6).toUpperCase()}</span>
                      <h3 className="font-serif text-2xl font-bold">{pkg.name}</h3>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 space-y-4">
                    <p className="text-xs font-medium text-[#8C7A70]">{pkg.tagline}</p>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C56E4E] block mb-2">
                        Included Rituals ({pkg.services?.length || 0} Treatments):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {pkg.services?.map((srvName, sIdx) => (
                          <span key={sIdx} className="inline-flex items-center gap-1 bg-[#FFF6F0] border border-[#EADBD2] px-3 py-1.5 rounded-xl text-xs font-bold text-[#2D2623]">
                            <Scissors size={12} className="text-[#C56E4E]" /> {srvName}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-[#8C7A70] pt-2">
                      <span className="flex items-center gap-1"><Clock size={14} className="text-[#C56E4E]" /> {pkg.duration}</span>
                      <span>•</span>
                      <span className="text-[#1E9E4A]">Exclusive Savings Active</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:pt-0 sm:px-8 sm:pb-8 flex items-center justify-between border-t border-[#EADBD2]/60 pt-4 mt-auto">
                  <div className="flex items-baseline gap-2">
                    <strong className="font-serif text-3xl font-bold text-[#2D2623]">₹{pkg.price}</strong>
                    {pkg.originalPrice && <span className="text-xs text-[#8C7A70] line-through">₹{pkg.originalPrice}</span>}
                  </div>

                  <button
                    onClick={() => handleBookBundle(pkg)}
                    className="flex items-center gap-2 rounded-full bg-[#C56E4E] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#A35539] transition-all cursor-pointer"
                  >
                    Book Bundle <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[2.5rem] border border-[#EADBD2] p-8">
            <Sparkles size={32} className="mx-auto text-[#C56E4E] mb-3 opacity-60" />
            <h3 className="font-serif text-xl font-bold text-[#2D2623] mb-1">No Packages Available</h3>
            <p className="text-xs text-[#8C7A70]">Newly published packages from the admin panel will appear here instantly in real time.</p>
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
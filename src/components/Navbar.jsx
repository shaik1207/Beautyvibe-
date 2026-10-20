import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Search,
  Sparkles,
  Bell,
  Navigation,
  Compass,
  User,
  PartyPopper
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";

const INTRO_DURATION = 2600;
const INTRO_SESSION_KEY = "luminaeIntroShown";
const easeOut = [0.22, 1, 0.36, 1];

const SafeImage = ({ src, alt, className, ...props }) => {
  const [errorLevel, setErrorLevel] = useState(0);
  const currentSrc = errorLevel === 0 ? src : errorLevel === 1 ? "/primary.png" : "/secondary.png";
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (errorLevel < 2) setErrorLevel((prev) => prev + 1);
      }}
      {...props}
    />
  );
};

const trendingServices = [
  { id: "s1", type: "Facial", title: "Korean Glow Facial", price: "899", image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=150&q=80" },
  { id: "s2", type: "Body Polishing", title: "Full Body Polishing", price: "1,899", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=150&q=80" },
  { id: "s3", type: "Waxing", title: "Rica Waxing", price: "849", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=150&q=80" },
  { id: "s4", type: "Mani-Pedi", title: "Manicure & Pedicure", price: "999", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=150&q=80" }
];

export default function Navbar() {
  const sidebarContext = useSidebar();
  const setMobileOpen = sidebarContext?.setMobileOpen || (() => {});
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomepage = location.pathname === "/";

  const [showNotifications, setShowNotifications] = useState(false);

  // Real-time Location States
  const [currentLocation, setCurrentLocation] = useState("ICMR Campus, Hyderabad");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);

  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(INTRO_SESSION_KEY);
  });

  // Determine if the user is brand new vs returning based on Firebase metadata
  const isNewUser = (() => {
    if (!user?.metadata?.creationTime || !user?.metadata?.lastSignInTime) return false;
    const created = new Date(user.metadata.creationTime).getTime();
    const signedIn = new Date(user.metadata.lastSignInTime).getTime();
    // If created within the last 2 minutes, consider them a new user
    return Math.abs(created - signedIn) < 120000;
  })();

  // iOS-style Avatar Fallback using DiceBear seed derived from user name
  const userAvatarUrl = user?.name || user?.email
    ? `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name || user.email)}&backgroundColor=FFF6F0`
    : null;

  // Automatically detect location on initial mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            const detectedCity = data.city || data.locality || data.principalSubdivision || "Current Location";
            const detectedLocality = data.locality ? `, ${data.locality}` : "";
            setCurrentLocation(`${detectedCity}${detectedLocality}`);
          } catch (error) {
            // Keep default fallback if reverse geocoding fails
          }
        },
        () => {
          // Permission denied or error, keep default location
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    }
  }, []);

  useEffect(() => {
    if (!showIntro) return undefined;
    const timer = window.setTimeout(() => {
      setShowIntro(false);
      sessionStorage.setItem(INTRO_SESSION_KEY, "true");
    }, INTRO_DURATION);
    return () => window.clearTimeout(timer);
  }, [showIntro]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const fetchRealTimeLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
      setShowLocationModal(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();
          const detectedCity = data.city || data.locality || data.principalSubdivision || "Current Location";
          const detectedLocality = data.locality ? `, ${data.locality}` : "";
          setCurrentLocation(`${detectedCity}${detectedLocality}`);
        } catch (error) {
          setCurrentLocation(`Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`);
        } finally {
          setIsLocating(false);
          setShowLocationModal(false);
        }
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location. Please check browser permissions.");
        setIsLocating(false);
        setShowLocationModal(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setIsSearching(true);
      setTimeout(() => {
        const results = trendingServices.filter((p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.type.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
      }, 600);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const SearchDrawerContent = () => (
    <div className="w-full">
      <div className="relative mb-4 flex items-center">
        <Search size={16} className="absolute left-4 text-[#8C7A70]" />
        <input 
          ref={searchInputRef}
          type="text" 
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search facials, waxing, spa..." 
          className="w-full rounded-full border border-[#EADBD2] bg-[#FFF6F0] py-3 pl-11 pr-11 text-xs font-medium text-[#2D2623] outline-none transition-all focus:border-[#C56E4E] focus:bg-white focus:shadow-md"
        />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="absolute right-4 text-[#8C7A70] hover:text-[#C56E4E] transition-colors">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="max-h-[50vh] overflow-y-auto pb-2 scrollbar-hide">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-8 text-[#C56E4E]">
            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
              <Sparkles size={28} className="opacity-70" />
            </motion.div>
            <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="mt-2 text-xs font-bold text-[#8C7A70]">
              Finding the best matches...
            </motion.p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="flex flex-col gap-2">
            {searchResults.map(res => (
              <Link 
                to="/services" 
                key={res.id} 
                onClick={() => setIsSearchOpen(false)} 
                className="flex items-center gap-3 rounded-2xl border border-transparent p-2.5 hover:border-[#EADBD2] hover:bg-[#FFF6F0] transition-all"
              >
                <SafeImage src={res.image} alt={res.title} className="h-10 w-10 rounded-xl object-cover shadow-sm" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#2D2623]">{res.title}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#C56E4E]">{res.type}</p>
                </div>
                <p className="text-xs font-serif font-bold text-[#2D2623]">₹{res.price}</p>
              </Link>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="py-8 text-center text-xs font-medium text-[#8C7A70]">No results found for "{searchQuery}".</div>
        ) : (
          <div className="py-1">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#8C7A70]">Quick Links</p>
            <div className="flex flex-wrap gap-2">
              {["Facials", "Waxing", "Hair Spa", "Bridal Makeup"].map(tag => (
                <button key={tag} onClick={() => { setSearchQuery(tag); handleSearchChange({ target: { value: tag } }); }} className="rounded-full border border-[#EADBD2] bg-white px-3.5 py-1.5 text-[11px] font-medium text-[#5C4841] hover:border-[#C56E4E] hover:text-[#C56E4E] transition-colors shadow-sm">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <LayoutGroup>
      <AnimatePresence mode="wait" initial={false}>
        {showIntro ? (
          <motion.div
            key="luminae-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)", transition: { duration: 0.5, ease: easeOut } }}
            className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_38%,#ffe2d2_0%,#fff5ee_35%,#f8e8de_70%,#f5dfd2_100%)]"
          >
            <div className="absolute left-[10%] top-[14%] h-52 w-52 rounded-full bg-[#F3A383]/20 blur-3xl" />
            <div className="absolute bottom-[5%] right-[10%] h-72 w-72 rounded-full bg-[#E9B19A]/25 blur-3xl" />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: easeOut }}
              className="relative z-10 flex flex-col items-center"
            >
              <motion.img layoutId="beautyvibe-logo-image" src="/primary.png" alt="BeautyVibe" className="h-28 w-auto object-contain drop-shadow-xl" />
              <div className="mt-10 h-[3px] w-52 overflow-hidden rounded-full bg-[#D9B7A7]/35">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.15, ease: "easeInOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[#E9A17D] via-[#D97F56] to-[#B95C42]"
                />
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ delay: 0.4, duration: 1.7, repeat: Infinity }}
                className="mt-4 text-[9px] font-bold uppercase tracking-[0.28em] text-[#AA725D]"
              >
                Preparing your ritual
              </motion.p>
            </motion.div>
          </motion.div>
        ) : (
          <div className="w-full px-3 lg:px-6 pt-2 lg:pt-4 z-40 relative">
            <header className={`relative flex h-14 lg:h-16 w-full items-center justify-between bg-white/75 px-4 lg:px-8 shadow-[0_6px_24px_rgba(0,0,0,0.05)] backdrop-blur-2xl border border-white/65 transition-all duration-500 ${
              isHomepage && !user ? "rounded-2xl max-w-[1400px] mx-auto" : "rounded-full max-w-[1240px] mx-auto"
            }`}>
              {/* MOBILE LEFT: Menu + Logo */}
              <div className="flex lg:hidden items-center gap-2 pl-1">
                <button 
                  onClick={() => setMobileOpen(true)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#5C4841] shadow-sm border border-[#EADBD2] transition-colors hover:bg-white"
                >
                  <Menu size={16} />
                </button>
                <Link to="/" className="font-serif text-lg font-bold text-[#2D2623] tracking-wide ml-1">BV</Link>
              </div>

              {/* DESKTOP LEFT: Real-Time Location Button */}
              <div 
                onClick={() => setShowLocationModal(true)}
                className="hidden lg:flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity ml-1 bg-white/60 px-3.5 py-1.5 rounded-full border border-[#EADBD2]/60 shadow-sm"
              >
                <Navigation size={13} className="text-[#C56E4E] animate-pulse" />
                <span className="text-[11px] font-bold text-[#5C4841] truncate max-w-[200px]">
                  {currentLocation}
                </span>
                <ChevronDown size={12} className="text-[#8C7A70]" />
              </div>

              {/* DESKTOP CENTER: Search Input (Only shown if user is logged in) */}
              {user && (
                <div className="hidden lg:flex flex-1 max-w-sm mx-4">
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="w-full relative flex items-center bg-white/60 border border-[#EADBD2] rounded-full px-4 py-2 transition-all hover:border-[#C56E4E] hover:bg-white hover:shadow-sm"
                  >
                    <Search size={14} className="text-[#8C7A70] mr-2.5" />
                    <span className="text-[11px] font-bold text-[#A39292]">Search facials, waxing, spa...</span>
                  </button>
                </div>
              )}

              {/* RIGHT ACTIONS */}
              <div className="flex items-center gap-2.5 lg:gap-4 pr-0.5 ml-auto">
                {!user ? (
                  <div className="flex items-center gap-2.5">
                    <Link to="/login" className="px-4 py-2 text-xs font-bold text-[#5C4841] hover:text-[#C56E4E] transition-colors">
                      Log In
                    </Link>
                    <Link to="/book-appointment" className="flex items-center gap-1.5 rounded-full bg-[#C56E4E] px-5 py-2 text-[11px] font-bold text-white shadow-md shadow-[#C56E4E]/30 transition-transform hover:-translate-y-0.5">
                      Book Now <ArrowRight size={13} />
                    </Link>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsSearchOpen(true)}
                      className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#5C4841] transition-colors hover:bg-white/80 hover:text-[#C56E4E]"
                    >
                      <Search size={18} />
                    </button>
                    
                    {/* Notifications Button */}
                    <div className="relative cursor-pointer group flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/80">
                      <button onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell size={18} className="text-[#5C4841] group-hover:text-[#C56E4E] transition-colors" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#C56E4E] border-[1.5px] border-white" />
                      </button>
                      <AnimatePresence>
                        {showNotifications && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-12 w-64 lg:w-72 rounded-3xl border border-[#EADBD2] bg-white p-4 shadow-2xl z-50 cursor-default"
                          >
                            <p className="font-serif text-base font-bold text-[#2D2623] mb-3">Notifications</p>
                            <div className="rounded-2xl bg-[#FFF6F0] p-3 border border-[#EADBD2]">
                              <p className="text-xs font-bold text-[#2D2623]">Upcoming Appointment</p>
                              <p className="mt-0.5 text-[11px] text-[#8C7A70]">Hair Spa with Marcus tomorrow at 11:00 AM.</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* iOS Style Profile Avatar & Dynamic Greeting Card Badge */}
                    <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-[#EADBD2]/60">
                      <Link to="/my-account" className="relative group/avatar">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#C56E4E] to-[#E5A024] p-[1.5px] shadow-sm transition-transform group-hover/avatar:scale-105">
                          <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                            {userAvatarUrl ? (
                              <SafeImage src={userAvatarUrl} alt="User Avatar" className="h-full w-full object-cover" />
                            ) : (
                              <User size={16} className="text-[#C56E4E]" />
                            )}
                          </div>
                        </div>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                      </Link>
                      <div className="flex flex-col items-start cursor-pointer group" onClick={() => navigate('/my-account')}>
                         <span className="text-xs font-bold text-[#5C4841] group-hover:text-[#C56E4E] transition-colors flex items-center gap-1">
                           {isNewUser ? (
                             <>Welcome! <PartyPopper size={12} className="text-[#C56E4E]" /></>
                           ) : (
                             user?.name ? `Hi, ${user.name.split(' ')[0]}` : "My Account"
                           )}
                         </span>
                         <span className="text-[8px] font-bold text-[#8C7A70] uppercase tracking-wider">
                           {isNewUser ? "New Member" : "Welcome Back"}
                         </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </header>

            {/* REAL-TIME LOCATION CONFIRMATION MODAL */}
            <AnimatePresence>
              {showLocationModal && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowLocationModal(false)}
                    className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed inset-0 z-[101] m-auto max-w-sm sm:max-w-md w-full h-fit max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl border border-[#EADBD2]"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#EADBD2] mb-5">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full bg-[#FFF6F0] flex items-center justify-center text-[#C56E4E] border border-[#EADBD2]">
                          <Compass size={18} />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#C56E4E]">Location Services</span>
                          <h3 className="font-serif text-lg font-bold text-[#2D2623]">Detect Real-Time Location</h3>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowLocationModal(false)} 
                        className="grid h-8 w-8 place-items-center rounded-full bg-[#FFF6F0] text-[#8C7A70] hover:text-[#C56E4E] transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-xs font-medium text-[#5C4841] mb-5 leading-relaxed">
                      Allow BeautyVibe to access your device's live coordinates to instantly check service availability and coordinate doorstep salon experts in your area.
                    </p>
                    <div className="flex flex-col gap-2.5">
                      <button
                        disabled={isLocating}
                        onClick={fetchRealTimeLocation}
                        className="w-full py-3 rounded-full bg-[#C56E4E] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#A35539] transition-colors flex items-center justify-center gap-2"
                      >
                        {isLocating ? (
                          <>Detecting Location...</>
                        ) : (
                          <>
                            <Navigation size={14} /> Confirm & Detect Live Location
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowLocationModal(false)}
                        className="w-full py-2.5 rounded-full bg-[#FFF6F0] border border-[#EADBD2] text-xs font-bold text-[#8C7A70] hover:text-[#2D2623] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* SEARCH DRAWER OVERLAY */}
            <AnimatePresence>
              {isSearchOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setIsSearchOpen(false)}
                    className="fixed inset-0 top-[70px] lg:top-[80px] z-[45] bg-[#2D2623]/20 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 250, damping: 25 }}
                    className="absolute left-4 right-4 sm:left-10 sm:right-10 md:left-1/2 md:right-auto md:w-[550px] md:-translate-x-1/2 top-[70px] lg:top-[80px] z-[50] rounded-[2rem] border border-[#EADBD2] bg-white p-4 lg:p-5 shadow-2xl"
                  >
                    <SearchDrawerContent />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
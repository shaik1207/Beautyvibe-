import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Heart, GripVertical, ArrowRight, Sparkles, Clock, Star } from "lucide-react";

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

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 20 } }
};

export default function Favourites() {
  const [favourites, setFavourites] = useState(() => {
    try {
      const saved = localStorage.getItem("beautyvibe_favourites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDraggingId, setIsDraggingId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("beautyvibe_favourites", JSON.stringify(favourites));
    } catch (e) {
      console.error(e);
    }
  }, [favourites]);

  const handleRemove = (id) => {
    setFavourites(favourites.filter((item) => item.id !== id));
  };

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-24 text-[#2D2623] relative">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-6"
      >
        
        {/* ================= HEADER SECTION ================= */}
        <motion.div variants={fadeUp} className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF6F0] border border-[#EADBD2] px-4 py-1.5 mb-3 shadow-sm">
              <Sparkles size={14} className="text-[#C56E4E]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70]">Curated Rituals</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2623]">My Favourites</h1>
          </div>

          {favourites.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider bg-white px-4 py-2 rounded-full border border-[#EADBD2] shadow-sm">
                💡 Drag the 3-dot grip to rearrange
              </span>
              <span className="text-xs font-bold text-[#C56E4E] bg-[#FFF6F0] px-4 py-2 rounded-full border border-[#EADBD2]">
                {favourites.length} {favourites.length === 1 ? 'Pinned' : 'Pinned'}
              </span>
            </div>
          )}
        </motion.div>

        {/* ================= REORDERABLE GRID OR EMPTY STATE ================= */}
        <AnimatePresence mode="popLayout">
          {favourites.length > 0 ? (
            <Reorder.Group 
              axis="y" 
              values={favourites} 
              onReorder={setFavourites}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 list-none"
            >
              {favourites.map((item) => {
                const isBeingDragged = isDraggingId === item.id;

                return (
                  <Reorder.Item 
                    key={item.id} 
                    value={item}
                    onDragStart={() => setIsDraggingId(item.id)}
                    onDragEnd={() => setIsDraggingId(null)}
                    className={`group relative flex flex-col bg-white overflow-hidden rounded-[2rem] border border-[#EADBD2] shadow-sm transition-all duration-300 ${
                      isBeingDragged 
                        ? "shadow-2xl ring-4 ring-[#C56E4E]/30 scale-105 z-50 cursor-grabbing" 
                        : isDraggingId !== null 
                        ? "backdrop-blur-md opacity-40 scale-[0.98] border-dashed border-[#C56E4E]/50" 
                        : "hover:shadow-xl hover:border-[#C56E4E]/50"
                    }`}
                  >
                    <div className="relative h-[220px] w-full bg-[#FFF6F0] overflow-hidden">
                      <SafeImage 
                        src={item.image?.startsWith("http") ? item.image : `https://images.unsplash.com/photo-${item.image}?auto=format&fit=crop&w=800&q=80`} 
                        alt={item.name} 
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 pointer-events-none" 
                      />
                      
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-[#C56E4E] uppercase tracking-wider shadow-sm">
                        {item.category}
                      </div>

                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <div 
                          title="Drag to rearrange"
                          className="cursor-grab active:cursor-grabbing bg-white/95 backdrop-blur-md p-2 rounded-full text-[#8C7A70] hover:text-[#2D2623] shadow-sm transition-colors"
                        >
                          <GripVertical size={16} />
                        </div>
                        <button 
                          onClick={() => handleRemove(item.id)}
                          title="Remove from favourites"
                          className="bg-white/95 backdrop-blur-md p-2 rounded-full text-[#C56E4E] hover:bg-[#C56E4E] hover:text-white shadow-sm transition-colors"
                        >
                          <Heart size={16} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="font-serif text-[18px] font-bold text-[#2D2623] leading-tight pr-2 group-hover:text-[#C56E4E] transition-colors">
                          {item.name}
                        </h2>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#E5A024] bg-[#FFF6F0] px-2 py-1 rounded-md shrink-0">
                          <Star size={12} className="fill-current" /> {item.rating}
                        </div>
                      </div>
                      
                      <p className="mt-1 text-[13px] font-medium text-[#8C7A70] line-clamp-2 flex-1 leading-relaxed">
                        {item.desc}
                      </p>
                      
                      <div className="mt-5 flex items-end justify-between border-t border-[#EADBD2]/60 pt-4 mb-5">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-[#8C7A70] bg-[#FCF9F6] px-3 py-1.5 rounded-lg border border-[#EADBD2]/50">
                          <Clock className="text-[#C56E4E]" size={14} />
                          {item.duration}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-[#A39292] uppercase tracking-wider block mb-0.5">Starts at</span>
                          <strong className="font-serif text-2xl font-bold text-[#2D2623]">
                            ₹{typeof item.price === 'number' ? item.price.toLocaleString("en-IN") : item.price}
                          </strong>
                        </div>
                      </div>
                      
                      <Link 
                        to={`/services/${item.id}`} 
                        className="flex items-center justify-center gap-2 w-full rounded-full bg-[#2D2623] py-3.5 text-[13px] font-bold text-white transition-all duration-300 group-hover:bg-[#C56E4E] shadow-md hover:shadow-lg hover:-translate-y-0.5"
                      >
                        Book Appointment <ArrowRight size={16} />
                      </Link>
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          ) : (
            /* ================= EMPTY STATE WITH PRIMARY LOGO & ANIMATED TEXT ================= */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.5 }}
              className="py-28 flex flex-col items-center justify-center text-center bg-white rounded-[2.5rem] border border-[#EADBD2] shadow-sm my-4 px-5"
            >
              <motion.div 
                animate={{ y: [-6, 6, -6] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="h-32 w-32 bg-[#FFF6F0] rounded-[2.5rem] flex items-center justify-center mb-6 border border-[#EADBD2] shadow-xl p-4 overflow-hidden relative"
              >
                <SafeImage 
                  src="/primary.png" 
                  alt="BeautyVibe Logo" 
                  className="w-full h-full object-contain drop-shadow-md" 
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2623] mb-2">
                  No Favourites Found
                </h3>
                <p className="text-sm font-medium text-[#8C7A70] max-w-sm mx-auto mb-8">
                  You haven't pinned any rituals to your favourites yet. Tap the heart icon on any service to curate your personal self-care collection.
                </p>

                <Link 
                  to="/services" 
                  className="inline-flex items-center gap-2 rounded-full bg-[#C56E4E] px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#C56E4E]/30 hover:bg-[#A35539] transition-all hover:-translate-y-0.5"
                >
                  Explore Services <ArrowRight size={16} />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.main>
    </div>
  );
}
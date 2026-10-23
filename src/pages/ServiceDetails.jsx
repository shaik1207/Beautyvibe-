import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Star, RefreshCw } from "lucide-react";
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

// Fallback static catalog for offline safety
const fallbackServices = {
  haircut: { id: "haircut", name: "Signature Hair Styling", price: 299, duration: "45 minutes", category: "Hair", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1100&q=85", description: "Refresh your look with a precision style tailored specifically to your facial features and preferences.", benefits: ["Personalized style consultation", "Professional styling tools", "Finishing and maintenance advice"], rating: "4.9", reviews: "1.2K" },
  hairspa: { id: "hairspa", name: "Deep Nourish Hair Spa", price: 499, duration: "60 minutes", category: "Hair", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1100&q=85", description: "Enjoy a deeply relaxing hair-care treatment focused on scalp nourishment, softness, and vibrant shine.", benefits: ["Intensive scalp care", "Relaxing aromatherapy massage", "Post-care hydration advice"], rating: "4.8", reviews: "850" },
  facial: { id: "facial", name: "24K Gold Glow Facial", price: 899, duration: "75 minutes", category: "Skin", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1100&q=85", description: "A refreshing multi-step facial selected to deeply hydrate, brighten, and give your skin an glass-like luminous complexion.", benefits: ["Skin type consultation", "Deep cleansing and exfoliation", "Radiance after-care recommendations"], rating: "5.0", reviews: "2.1K" },
  manicure: { id: "manicure", name: "Classic Mani-Pedi", price: 499, duration: "45 minutes", category: "Nails", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1100&q=85", description: "Give your hands and feet complete cuticle care, precise nail shaping, and a neat, refreshed finish.", benefits: ["Nail shaping & buffing", "Gentle cuticle care", "Premium polish application"], rating: "4.7", reviews: "920" },
  beard: { id: "beard", name: "Gentleman's Grooming", price: 299, duration: "30 minutes", category: "Grooming", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1100&q=85", description: "Professional beard shaping, trimming, and hot towel treatment for a clean, well-groomed appearance.", benefits: ["Precision beard shaping", "Hot towel relaxation finish", "Beard oil styling advice"], rating: "4.8", reviews: "640" },
  makeup: { id: "makeup", name: "Bridal Elegance Makeup", price: 4999, duration: "120 minutes", category: "Beauty", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1100&q=85", description: "A personalized, flawless, long-lasting makeup session crafted specifically for your most special occasions.", benefits: ["Look & tone consultation", "Premium cosmetic application", "Finishing touches & setting spray"], rating: "4.9", reviews: "3.4K" },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 20 } }
};

export default function ServiceDetails() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch live service details from backend
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/api/services/${id}`);
        if (res.data?.success && res.data.data) {
          const s = res.data.data;
          
          // Parse benefits if stored as JSON string in database
          let parsedBenefits = ["Personalized style consultation", "Professional tools", "Finishing advice"];
          if (s.benefits) {
            if (Array.isArray(s.benefits)) parsedBenefits = s.benefits;
            else if (typeof s.benefits === 'string') {
              try { parsedBenefits = JSON.parse(s.benefits); } catch (e) { parsedBenefits = [s.benefits]; }
            }
          }

          setService({
            id: s._id || s.id,
            name: s.title || s.name,
            price: s.price,
            duration: s.duration || "45 minutes",
            category: s.category || "General",
            image: s.image || "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1100&q=85",
            description: s.desc || s.description || "Luxurious self-care ritual tailored specifically to your needs.",
            benefits: parsedBenefits,
            rating: s.rating || "4.8",
            reviews: s.reviews || "1K"
          });
        } else {
          setService(fallbackServices[id] || null);
        }
      } catch (err) {
        console.warn("Backend unavailable or service not found, checking fallback catalog.");
        setService(fallbackServices[id] || null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchServiceDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#FCF9F6] text-[#2D2623]">
        <RefreshCw size={32} className="animate-spin text-[#C56E4E] mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Loading ritual details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#FCF9F6] text-[#2D2623]">
        <h1 className="font-serif text-3xl font-bold mb-3">Service not found</h1>
        <p className="text-xs text-[#8C7A70] mb-6">The ritual you are looking for does not exist or has been removed.</p>
        <Link className="rounded-full bg-[#C56E4E] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg" to="/services">
          Back to Services
        </Link>
      </div>
    );
  }

  const imageUrl = service.image?.startsWith("http") 
    ? service.image 
    : `https://images.unsplash.com/photo-${service.image}?auto=format&fit=crop&w=1100&q=85`;

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-28 text-[#2D2623]">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8"
      >
        
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          
          {/* Left Image Showcase */}
          <motion.div variants={fadeUp} className="relative rounded-[2.5rem] overflow-hidden bg-[#FFF6F0] border border-[#EADBD2] shadow-sm h-[350px] sm:h-[450px] lg:h-[580px]">
            <img src={imageUrl} alt={service.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-[#C56E4E] uppercase tracking-widest shadow-sm">
              {service.category} Ritual
            </div>

            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#C56E4E]" />
                <span className="text-xs font-bold text-[#2D2623]">Doorstep Certified Expert</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#E5A024]">
                <Star size={14} className="fill-current" /> {service.rating} <span className="text-[#8C7A70] font-medium">({service.reviews})</span>
              </div>
            </div>
          </motion.div>

          {/* Right Details Panel */}
          <motion.div variants={fadeUp} className="py-2">
            
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF6F0] border border-[#EADBD2] px-4 py-1.5 mb-4 shadow-sm">
              <Sparkles size={14} className="text-[#C56E4E]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70]">BeautyVibe Curated</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2623] leading-tight mb-4">
              {service.name}
            </h1>

            <p className="text-sm sm:text-base font-medium text-[#8C7A70] leading-relaxed mb-6">
              {service.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#5C4841] bg-white p-4 rounded-2xl border border-[#EADBD2] shadow-sm mb-8">
              <span className="flex items-center gap-1.5 bg-[#FCF9F6] px-3 py-2 rounded-xl border border-[#EADBD2]/60">
                <Clock className="text-[#C56E4E]" size={15} /> {service.duration}
              </span>
              <span className="text-[#8C7A70] font-medium">✨ Home service availability verified for your location</span>
            </div>

            <div className="mb-8">
              <span className="text-[10px] font-bold text-[#A39292] uppercase tracking-wider block mb-1">Service Price</span>
              <span className="font-serif text-4xl font-bold text-[#2D2623]">₹{Number(service.price).toLocaleString("en-IN")}</span>
            </div>

            <h2 className="font-serif text-xl font-bold text-[#2D2623] mb-4">What to Expect</h2>
            
            <ul className="space-y-3 mb-10">
              {service.benefits.map((b, index) => (
                <li key={index} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-[#5C4841] bg-white px-4 py-3 rounded-2xl border border-[#EADBD2]/60 shadow-sm">
                  <CheckCircle2 className="text-[#C56E4E] shrink-0" size={18} />
                  {b}
                </li>
              ))}
            </ul>

            <Link 
              to={`/book-appointment?service=${id}`} 
              className="flex items-center justify-center gap-2 w-full rounded-full bg-[#C56E4E] py-4 px-8 text-sm font-bold uppercase tracking-wider text-white shadow-xl hover:bg-[#A35539] transition-all hover:-translate-y-0.5"
            >
              Book This Service <ArrowRight size={16} />
            </Link>

          </motion.div>

        </div>

      </motion.main>
    </div>
  );
}
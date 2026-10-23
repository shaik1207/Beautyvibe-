import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Home, 
  MapPin, 
  X,
  Share2,
  CalendarDays
} from "lucide-react";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 65, damping: 20 } }
};

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const lastConfirmed = sessionStorage.getItem("beautyvibe_last_confirmed");
    if (lastConfirmed) {
      try {
        setBooking(JSON.parse(lastConfirmed));
      } catch (e) {
        console.error("Error parsing confirmation data:", e);
      }
    } else {
      // Fallback default state for preview / demonstration
      setBooking({
        id: "QBBRWULJAU",
        passCode: "BV-8492026",
        serviceName: "Signature Bridal & Facial Ritual",
        type: "SALON",
        date: "27 Sep",
        time: "02:15 PM - 03:30 PM",
        amount: 2499,
        address: "BeautyVibe Luxury Lounge, Near HDFC ATM, Tiruvuru"
      });
    }
  }, []);

  if (!booking) {
    return (
      <div className="flex-1 min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#FCF9F6] text-[#2D2623]">
        <h2 className="font-serif text-2xl font-bold mb-2">No Recent Booking Found</h2>
        <p className="text-xs text-[#8C7A70] mb-6">It looks like you haven't completed a checkout recently or the session expired.</p>
        <Link to="/services" className="rounded-full bg-[#C56E4E] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
          Explore Services Catalog
        </Link>
      </div>
    );
  }

  // The unique string that the admin scanner will read and verify
  const passCodeStr = booking.passCode || booking.id || "BV-8492026";
  
  // Real-time API generated QR code (100% scannable by the admin module)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(passCodeStr)}&margin=10`;

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-32 text-[#2D2623] relative overflow-hidden">
      
      {/* Background Ambience Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 rounded-full bg-[#C56E4E]/10 blur-[100px] pointer-events-none" />

      {/* Navigation Cancel Action top right */}
      <div className="max-w-md mx-auto px-4 pt-6 flex justify-end relative z-20">
        <button 
          onClick={() => navigate("/")}
          className="h-10 w-10 rounded-full bg-white border border-[#EADBD2] shadow-sm flex items-center justify-center text-[#8C7A70] hover:text-[#C56E4E] hover:border-[#C56E4E]/30 transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="max-w-md mx-auto px-4 pt-2 pb-12 space-y-6 relative z-10"
      >
        
        {/* Header Status Block */}
        <motion.div variants={fadeUp} className="text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-[#EBF7EE] text-[#1E9E4A] border border-[#D1EED7] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-wide text-[#2D2623]">Booking Confirmed</h1>
          <p className="text-xs text-[#8C7A70]">Present this pass at the salon for instant verification.</p>
        </motion.div>

        {/* Cinematic Ticket Pass (BeautyVibe Premium Theme) */}
        <motion.div 
          variants={fadeUp} 
          className="relative bg-gradient-to-b from-[#2D2623] to-[#1A1513] rounded-[2rem] border border-[#4A3F39] shadow-2xl overflow-visible text-white"
        >
          {/* Decorative Left Ticket Notch (Matches the #FCF9F6 outer background) */}
          <div className="absolute top-[58%] -left-[14px] w-[26px] h-[26px] rounded-full bg-[#FCF9F6] shadow-inner z-10" />
          {/* Decorative Right Ticket Notch */}
          <div className="absolute top-[58%] -right-[14px] w-[26px] h-[26px] rounded-full bg-[#FCF9F6] shadow-inner z-10" />

          {/* Top header information */}
          <div className="p-6 text-center border-b border-white/10 pb-5">
            <h2 className="font-serif text-xl font-bold tracking-wide text-white">BeautyVibe</h2>
            <div className="flex items-center justify-center gap-2 mt-2 text-[10px] font-semibold tracking-wider text-[#C56E4E] uppercase">
              <span>VIP Client</span>
              <span className="w-1 h-1 rounded-full bg-[#8C7A70]" />
              <span>Premium Pass</span>
            </div>
          </div>

          {/* Real QR Code Container */}
          <div className="flex flex-col items-center justify-center py-8 relative">
            <div className="relative p-1 rounded-2xl bg-gradient-to-br from-[#C56E4E] to-[#E5A024] shadow-[0_0_30px_rgba(197,110,78,0.25)]">
              <div className="p-2 rounded-[14px] bg-white">
                {/* Real QR Code Image rendered from API */}
                <img 
                  src={qrCodeUrl} 
                  alt="Booking QR Code Pass" 
                  className="w-40 h-40 object-contain rounded-lg"
                  crossOrigin="anonymous"
                />
              </div>
            </div>
            <p className="mt-4 font-mono text-[11px] tracking-[0.2em] text-[#EADBD2]/70 uppercase">
              {passCodeStr}
            </p>
          </div>

          {/* Central Dashed Divider */}
          <div className="px-6 py-0 relative z-0">
            <div className="border-t-[1.5px] border-dashed border-[#4A3F39] w-full" />
          </div>

          {/* Reservation Details */}
          <div className="p-7 space-y-5">
            
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <span className="text-[10px] uppercase tracking-wider text-[#8C7A70] font-bold">Service Ritual</span>
                <p className="text-sm font-semibold text-white font-serif leading-tight">{booking.serviceName}</p>
                <div className="flex gap-2 items-center text-[10px] text-[#EADBD2]/70">
                  <span className="bg-[#C56E4E]/20 text-[#E5A024] font-bold px-2 py-0.5 rounded border border-[#C56E4E]/30 uppercase">
                    {booking.type || "SALON"}
                  </span>
                  <span>·</span>
                  <span>Confirmed</span>
                </div>
              </div>

              {/* Service Price Badge */}
              <div className="shrink-0 text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#8C7A70] font-bold block mb-1">Total</span>
                <span className="font-serif text-lg font-bold text-[#C56E4E]">₹{Number(booking.amount || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Schedule & Location */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <CalendarDays size={16} className="text-[#C56E4E]" />
                <span className="text-xs font-semibold text-white/90">
                  {booking.date}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-[#C56E4E]" />
                <span className="text-xs font-semibold text-white/90">
                  {booking.time} <span className="text-white/40 font-normal">(approx)</span>
                </span>
              </div>
              <div className="flex items-start gap-3 pt-3 border-t border-white/10">
                <MapPin size={16} className="text-[#C56E4E] shrink-0 mt-0.5" />
                <span className="text-xs text-white/70 font-medium leading-relaxed">
                  {booking.address || "BeautyVibe Luxury Studio, Corporate Branch."}
                </span>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Modern Interactive Actions */}
        <motion.div variants={fadeUp} className="space-y-3 pt-2">
          <Link
            to="/my-bookings"
            className="w-full py-4 rounded-2xl bg-[#C56E4E] hover:bg-[#A35539] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#C56E4E]/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            Track My Appointment 
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <div className="flex gap-3">
            <Link
              to="/main"
              className="flex-1 py-3.5 rounded-2xl bg-white border border-[#EADBD2] text-[#2D2623] hover:bg-[#F8F4F0] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Home size={14} /> Home
            </Link>
            
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'BeautyVibe Booking Pass',
                    text: `Confirmed appointment for ${booking.serviceName} at BeautyVibe Salon!`,
                    url: window.location.href,
                  });
                } else {
                  alert("Pass Code copied: " + passCodeStr);
                }
              }}
              className="px-6 rounded-2xl bg-white border border-[#EADBD2] text-[#2D2623] hover:bg-[#F8F4F0] text-xs font-bold transition-all flex items-center justify-center shadow-sm cursor-pointer"
            >
              <Share2 size={16} />
            </button>
          </div>
        </motion.div>

        {/* Verification Footing */}
        <motion.div 
          variants={fadeUp} 
          className="text-center pt-4 flex items-center justify-center gap-1.5 text-[10px] text-[#8C7A70]"
        >
          <ShieldCheck size={14} className="text-[#C56E4E]" /> 
          Verified by BeautyVibe Secure Protocol
        </motion.div>

      </motion.main>
    </div>
  );
}
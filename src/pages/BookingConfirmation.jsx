import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  CalendarDays, 
  Clock, 
  MapPin, 
  QrCode, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Store, 
  House,
  Barcode,
  Scissors
} from "lucide-react";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 20 } }
};

export default function BookingConfirmation() {
  const [booking, setBooking] = useState(null);
  const [toast, setToast] = useState(true);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("beautyvibe_checkout_draft") || sessionStorage.getItem("salonpro_checkout_draft");
      setBooking(JSON.parse(saved || "null"));
    } catch {
      setBooking(null);
    }

    // Auto-dismiss toast after 4 seconds
    const timer = setTimeout(() => setToast(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-28 text-[#2D2623] relative">
      
      {/* ================= INSTANT TOAST NOTIFICATION ================= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-full bg-[#2D2623]/95 px-6 py-3.5 text-white shadow-2xl backdrop-blur-xl border border-white/20 text-xs font-bold"
          >
            <CheckCircle2 size={16} className="text-[#E5A024]" />
            <span>✨ Booking Confirmed! Your BookMyShow-style VIP Pass is ready.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pt-10"
      >
        
        <motion.div variants={fadeUp} className="bg-white rounded-[2.5rem] border border-[#EADBD2] p-6 sm:p-10 text-center shadow-xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#C56E4E] via-[#E5A024] to-[#C56E4E]" />

          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="h-16 w-16 rounded-full bg-[#FFF6F0] border border-[#EADBD2] text-[#C56E4E] flex items-center justify-center mx-auto mb-4 shadow-sm"
          >
            <CheckCircle2 size={32} />
          </motion.div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF6F0] border border-[#EADBD2] px-4 py-1.5 mb-2 shadow-sm">
            <Sparkles size={14} className="text-[#C56E4E]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70]">VIP Access Pass</span>
          </div>

          <h1 className="font-serif text-3xl font-bold text-[#2D2623] mb-2">Booking Confirmed!</h1>
          <p className="text-xs sm:text-sm font-medium text-[#8C7A70] max-w-md mx-auto mb-8 leading-relaxed">
            Your appointment has been successfully secured. Present your BookMyShow-style ticket pass below upon arrival.
          </p>

          {booking && (
            <motion.div 
              variants={fadeUp}
              className="relative rounded-[2rem] bg-gradient-to-r from-[#2D2623] to-[#3D322E] text-white shadow-2xl overflow-hidden border border-white/10 mb-8 text-left flex flex-col md:flex-row"
            >
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#C56E4E] rounded-full blur-3xl opacity-30 pointer-events-none" />

              {/* LEFT TICKET STUB */}
              <div className="p-6 sm:p-8 flex-1 relative z-10">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <Scissors size={14} className="text-[#E5A024]" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#E5A024]">BeautyVibe VIP Admission</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">
                    {booking.id || "BV-8492"}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#A39292] block">Primary Ritual</span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold">{booking.serviceName}</h3>
                    {booking.additionalServices && booking.additionalServices.length > 0 && (
                      <p className="text-[11px] text-[#E5A024] mt-0.5">+ {booking.additionalServices.join(", ")}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-[#D3C5BF] pt-2">
                    <div className="flex items-center gap-1.5 font-medium">
                      <CalendarDays size={14} className="text-[#E5A024]" /> {booking.date}
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock size={14} className="text-[#E5A024]" /> {booking.time}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#D3C5BF]">
                    <MapPin size={14} className="text-[#E5A024] shrink-0" /> 
                    <span className="truncate">{booking.address || (booking.type === "HOME" ? "Doorstep Service" : "Salon Visit")}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-[#D3C5BF]">Total Paid:</span>
                  <span className="font-serif text-xl font-bold text-[#E5A024]">₹{booking.total}</span>
                </div>
              </div>

              {/* PERFORATED DIVIDER (DESKTOP) */}
              <div className="hidden md:flex flex-col items-center justify-center relative px-1">
                <div className="h-4 w-4 rounded-full bg-white -ml-2 absolute -top-2" />
                <div className="h-full border-r-2 border-dashed border-white/25 my-2" />
                <div className="h-4 w-4 rounded-full bg-white -ml-2 absolute -bottom-2" />
              </div>

              {/* RIGHT BARCODE STUB */}
              <div className="bg-[#231E1C] p-6 sm:p-8 md:w-44 flex flex-col items-center justify-center text-center relative z-10 border-t md:border-t-0 md:border-l border-white/10">
                <div className="h-16 w-16 bg-white rounded-xl p-1.5 flex items-center justify-center text-[#2D2623] mb-3 shadow-inner">
                  <QrCode size={48} />
                </div>
                <div className="text-[#A39292] font-mono text-[9px] tracking-[0.2em] uppercase">
                  ||||| | |||| |||||
                </div>
                <span className="text-[9px] text-[#E5A024] font-bold mt-2 uppercase tracking-wider">Scan at Entry</span>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/my-bookings" 
              className="rounded-full bg-[#C56E4E] px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-[#A35539] transition-all flex items-center justify-center gap-2"
            >
              View My Bookings <ArrowRight size={16} />
            </Link>
            <Link 
              to="/services" 
              className="rounded-full border border-[#EADBD2] bg-[#FCF9F6] px-8 py-4 text-xs font-bold uppercase tracking-wider text-[#5C4841] hover:bg-white hover:border-[#C56E4E] transition-all"
            >
              Explore More Services
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] text-[#8C7A70]">
            <ShieldCheck size={14} className="text-[#C56E4E]" /> Verified secure booking session
          </div>

        </motion.div>

      </motion.main>
    </div>
  );
}
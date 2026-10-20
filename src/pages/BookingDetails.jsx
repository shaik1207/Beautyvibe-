import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  QrCode, 
  CheckCircle2, 
  X, 
  Scissors, 
  Sparkles, 
  ShieldCheck, 
  PhoneCall, 
  Navigation 
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
// ANIMATION VARIANTS
// ==========================================
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 20 } }
};

export default function BookingDetails() {
  const { id } = useParams();
  const [showQRModal, setShowQRModal] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  // Mock Data Lookup based on ID (or fallback to dynamic details)
  const bookingData = {
    id: id || "BV-8921",
    serviceName: "Korean Glow Facial",
    category: "Facial",
    price: "899",
    date: "October 18, 2026",
    time: "11:00 AM - 12:15 PM",
    location: "ICMR Campus, Hyderabad",
    expert: "Ananya Sharma",
    status: isAccepted ? "Accepted & Checked-In" : "Confirmed",
    image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=80",
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=BeautyVibe-Booking-${id || "BV-8921"}`
  };

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-24 text-[#2D2623] relative">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-8"
      >
        
        {/* ================= BACK BUTTON ================= */}
        <motion.div variants={fadeUp} className="mb-6">
          <Link 
            to="/my-bookings" 
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8C7A70] hover:text-[#C56E4E] transition-colors bg-white px-4 py-2 rounded-full border border-[#EADBD2] shadow-sm"
          >
            <ArrowLeft size={14} /> Back to My Bookings
          </Link>
        </motion.div>

        {/* ================= MAIN TICKET CARD ================= */}
        <motion.div 
          variants={fadeUp} 
          className="bg-white rounded-[2.5rem] border border-[#EADBD2] shadow-sm overflow-hidden p-6 sm:p-10 relative"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C56E4E] rounded-full blur-[140px] opacity-10 pointer-events-none" />

          {/* Top Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EADBD2]/60">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8C7A70] mb-1">
                <Sparkles size={12} className="text-[#C56E4E]" /> Booking Reference
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2623]">{bookingData.id}</h1>
            </div>

            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shadow-sm w-fit ${
              isAccepted ? 'bg-[#1E9E4A]/10 text-[#1E9E4A] border border-[#1E9E4A]/20' : 'bg-[#FFF6F0] text-[#C56E4E] border border-[#EADBD2]'
            }`}>
              <CheckCircle2 size={14} /> {bookingData.status}
            </span>
          </div>

          {/* Service Highlight Box */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-6 rounded-3xl bg-[#FFF6F0] p-5 sm:p-6 border border-[#EADBD2]/80">
            <SafeImage src={bookingData.image} alt={bookingData.serviceName} className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border border-[#EADBD2] shadow-sm shrink-0" />
            
            <div className="flex-1 w-full text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C56E4E]">{bookingData.category} Ritual</span>
              <h2 className="font-serif text-2xl font-bold text-[#2D2623] mt-1">{bookingData.serviceName}</h2>
              <p className="font-serif text-2xl font-bold text-[#C56E4E] mt-2">₹{bookingData.price}</p>
            </div>
          </div>

          {/* Appointment Details Grid */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FCF9F6] border border-[#EADBD2]/60">
              <div className="p-2.5 rounded-xl bg-white text-[#C56E4E] shadow-sm border border-[#EADBD2]">
                <CalendarDays size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A70]">Appointment Date</p>
                <p className="text-sm font-bold text-[#2D2623] mt-0.5">{bookingData.date}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FCF9F6] border border-[#EADBD2]/60">
              <div className="p-2.5 rounded-xl bg-white text-[#C56E4E] shadow-sm border border-[#EADBD2]">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A70]">Time Slot</p>
                <p className="text-sm font-bold text-[#2D2623] mt-0.5">{bookingData.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FCF9F6] border border-[#EADBD2]/60 sm:col-span-2">
              <div className="p-2.5 rounded-xl bg-white text-[#C56E4E] shadow-sm border border-[#EADBD2] shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A70]">Service Location</p>
                <p className="text-sm font-bold text-[#2D2623] mt-0.5">{bookingData.location}</p>
                <p className="text-xs text-[#8C7A70] mt-1">Our expert will arrive at your designated room/office address on time.</p>
              </div>
            </div>
          </div>

          {/* Expert Info Card */}
          <div className="mt-6 flex items-center justify-between p-4 rounded-2xl bg-white border border-[#EADBD2] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-[#FFF6F0] flex items-center justify-center text-[#C56E4E] font-bold border border-[#EADBD2]">
                <Scissors size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A70]">Assigned Beauty Expert</p>
                <p className="text-sm font-bold text-[#2D2623]">{bookingData.expert}</p>
              </div>
            </div>
            <button onClick={() => alert("Connecting to your assigned expert...")} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFF6F0] border border-[#EADBD2] text-xs font-bold text-[#C56E4E] hover:bg-[#C56E4E] hover:text-white transition-colors">
              <PhoneCall size={14} /> Call Expert
            </button>
          </div>

          {/* QR Code Action CTA Banner */}
          <div className="mt-8 rounded-3xl bg-gradient-to-r from-[#2D2623] to-[#453833] p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#D9A087] mb-1">
                <ShieldCheck size={14} /> Instant Check-In
              </div>
              <h3 className="font-serif text-xl font-bold">Ready for your session?</h3>
              <p className="text-xs text-[#D3C5BF] mt-1">Open your scanner pass to verify and accept your order.</p>
            </div>

            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-2 rounded-full bg-[#C56E4E] px-7 py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#A35539] transition-transform hover:-translate-y-0.5 shrink-0"
            >
              <QrCode size={18} /> View QR & Accept
            </button>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-[#EADBD2]/60 flex flex-wrap items-center justify-between gap-4">
            <Link to="/services" className="text-xs font-bold text-[#C56E4E] hover:underline flex items-center gap-1">
              Explore More Services →
            </Link>
            <span className="text-[11px] font-medium text-[#8C7A70]">
              Need help? Contact BeautyVibe Support.
            </span>
          </div>

        </motion.div>
      </motion.main>

      {/* ================= QR CODE SCANNER MODAL ================= */}
      <AnimatePresence>
        {showQRModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRModal(false)}
              className="fixed inset-0 z-50 bg-[#2D2623]/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 m-auto max-w-sm sm:max-w-md w-full h-fit max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl border border-[#EADBD2]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#EADBD2] mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C56E4E]">Salon Pass & Scanner</span>
                  <h3 className="font-serif text-2xl font-bold text-[#2D2623]">{bookingData.serviceName}</h3>
                </div>
                <button 
                  onClick={() => setShowQRModal(false)} 
                  className="grid h-9 w-9 place-items-center rounded-full bg-[#FFF6F0] text-[#8C7A70] hover:text-[#C56E4E] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="bg-[#FFF6F0] border border-[#EADBD2] p-4 rounded-3xl shadow-inner mb-6">
                  <img src={bookingData.qrCodeUrl} alt="Booking QR Code" className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl" />
                </div>

                <p className="text-xs text-[#8C7A70] mb-2">Reference ID: <strong className="text-[#2D2623]">{bookingData.id}</strong></p>
                <p className="text-xs font-medium text-[#5C4841] mb-6">
                  Have your beauty expert scan this QR code to confirm your appointment and check-in.
                </p>

                <div className="w-full bg-[#FCF9F6] rounded-2xl p-4 border border-[#EADBD2] text-left mb-6 text-xs space-y-2">
                  <div className="flex justify-between"><span className="text-[#8C7A70]">Date & Slot:</span> <strong className="text-[#2D2623]">{bookingData.date}</strong></div>
                  <div className="flex justify-between"><span className="text-[#8C7A70]">Expert Assigned:</span> <strong className="text-[#2D2623]">{bookingData.expert}</strong></div>
                  <div className="flex justify-between"><span className="text-[#8C7A70]">Total Payable:</span> <strong className="text-[#C56E4E]">₹{bookingData.price}</strong></div>
                </div>

                <button
                  onClick={() => {
                    setIsAccepted(true);
                    setShowQRModal(false);
                  }}
                  className="w-full py-4 rounded-full bg-[#2D2623] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#C56E4E] transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> Accept Order & Verify Pass
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
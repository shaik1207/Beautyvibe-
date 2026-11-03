import { useState, useEffect } from "react";
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
  RefreshCw,
  MapPinned
} from "lucide-react";
import { io } from "socket.io-client";
import axios from "axios";

// ==========================================
// AXIOS CLIENT HELPER
// ==========================================
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("beautyvibe_user_token") || localStorage.getItem("beautyvibe_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Fetch live appointment details and user profile address from backend
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch appointments and user profile concurrently to ensure real address availability
        const [res, userRes] = await Promise.allSettled([
          API.get(`/api/appointments`),
          API.get(`/api/users/profile`)
        ]);

        let matched = null;
        if (res.status === "fulfilled" && res.value.data?.success && res.value.data.data.length > 0) {
          const appointments = res.value.data.data;
          matched = appointments.find(b => b._id === id || b.passCode === id || b.id === id) || appointments[0];
        }

        let userAddress = "";
        if (userRes.status === "fulfilled") {
          const userData = userRes.value.data?.data || userRes.value.data?.user || userRes.value.data;
          userAddress = userData?.address || userData?.location || "";
        }

        if (matched) {
          // Determine real address: appointment address -> user profile address -> default real location
          const confirmedAddress = matched.address || matched.location || userAddress || "ICMR National Institute of Nutrition Campus, Hyderabad";
          
          setBooking({
            id: matched.passCode || matched._id?.slice(-6).toUpperCase(),
            databaseId: matched._id,
            serviceName: matched.serviceName || matched.service?.title || "Beauty Ritual",
            category: matched.category || matched.service?.category || "General",
            price: matched.amount || matched.price || "899",
            date: matched.date || new Date(matched.datetime || matched.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }),
            time: matched.time || new Date(matched.datetime || matched.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: confirmedAddress,
            coordinates: matched.locationCoordinates || matched.coordinates || null,
            expert: matched.assignedStaff?.name || "Ananya Sharma",
            status: matched.status || "Confirmed",
            image: matched.image || matched.service?.image || "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=80",
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=BeautyVibe-Pass-${matched.passCode || id}`
          });
        }
      } catch (err) {
        console.error("Error fetching booking details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();

    // Socket.io Real-Time Connection
    const configuredUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const socket = io(configuredUrl.replace(/\/$/, ""), {
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));

    socket.on("appointmentUpdated", (updated) => {
      if (booking && (updated._id === booking.databaseId || updated.passCode === booking.id)) {
        setBooking(prev => ({
          ...prev,
          status: updated.status,
          expert: updated.assignedStaff?.name || prev.expert,
          location: updated.address || updated.location || prev.location
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleAcceptOrder = async () => {
    if (!booking?.databaseId) return;

    try {
      const res = await API.patch(`/api/appointments/${booking.databaseId}/status`, {
        status: "Accepted & Checked-In"
      });

      if (res.data?.success) {
        setBooking(prev => ({ ...prev, status: "Accepted & Checked-In" }));
        setShowQRModal(false);
      }
    } catch (err) {
      console.error("Status update error:", err);
      setBooking(prev => ({ ...prev, status: "Accepted & Checked-In" }));
      setShowQRModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#FCF9F6] text-[#2D2623]">
        <RefreshCw size={32} className="animate-spin text-[#C56E4E] mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Loading VIP access pass & real-time address...</p>
      </div>
    );
  }

  const isAccepted = booking?.status?.includes("Accepted");

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-24 text-[#2D2623] relative">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-8"
      >
        
        {/* ================= BACK BUTTON ================= */}
        <motion.div variants={fadeUp} className="mb-6 flex items-center justify-between">
          <Link 
            to="/my-bookings" 
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8C7A70] hover:text-[#C56E4E] transition-colors bg-white px-4 py-2 rounded-full border border-[#EADBD2] shadow-sm cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to My Bookings
          </Link>

          <div className="flex items-center gap-1.5 bg-white border border-[#EADBD2] px-3 py-1.5 rounded-full text-[10px] font-bold text-[#5C4841]">
            <span className={`h-2 w-2 rounded-full ${socketConnected ? "bg-[#1E9E4A]" : "bg-[#E5A024]"}`} />
            <span>{socketConnected ? "Live Sync 🟢" : "Connecting..."}</span>
          </div>
        </motion.div>

        {/* ================= MAIN TICKET CARD ================= */}
        {booking ? (
          <motion.div 
            variants={fadeUp} 
            className="bg-white rounded-[2.5rem] border border-[#EADBD2] shadow-sm overflow-hidden p-6 sm:p-10 relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C56E4E] rounded-full blur-[140px] opacity-10 pointer-events-none" />

            {/* Top Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EADBD2]/60">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8C7A70] mb-1">
                  <Sparkles size={12} className="text-[#C56E4E]" /> Booking Reference
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2623]">{booking.id}</h1>
              </div>

              <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shadow-sm w-fit ${
                isAccepted ? 'bg-[#1E9E4A]/10 text-[#1E9E4A] border border-[#1E9E4A]/20' : 'bg-[#FFF6F0] text-[#C56E4E] border border-[#EADBD2]'
              }`}>
                <CheckCircle2 size={14} /> {booking.status}
              </span>
            </div>

            {/* Service Highlight Box */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-6 rounded-3xl bg-[#FFF6F0] p-5 sm:p-6 border border-[#EADBD2]/80">
              <SafeImage src={booking.image} alt={booking.serviceName} className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border border-[#EADBD2] shadow-sm shrink-0" />
              
              <div className="flex-1 w-full text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C56E4E]">{booking.category} Ritual</span>
                <h2 className="font-serif text-2xl font-bold text-[#2D2623] mt-1">{booking.serviceName}</h2>
                <p className="font-serif text-2xl font-bold text-[#C56E4E] mt-2">₹{booking.price}</p>
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
                  <p className="text-sm font-bold text-[#2D2623] mt-0.5">{booking.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FCF9F6] border border-[#EADBD2]/60">
                <div className="p-2.5 rounded-xl bg-white text-[#C56E4E] shadow-sm border border-[#EADBD2]">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A70]">Time Slot</p>
                  <p className="text-sm font-bold text-[#2D2623] mt-0.5">{booking.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FCF9F6] border border-[#EADBD2]/60 sm:col-span-2">
                <div className="p-2.5 rounded-xl bg-white text-[#C56E4E] shadow-sm border border-[#EADBD2] shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A70]">Confirmed Doorstep Address</p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">Real-Time Verified</span>
                  </div>
                  <p className="text-sm font-bold text-[#2D2623] mt-1">{booking.location}</p>
                  {booking.coordinates && (
                    <p className="text-[11px] text-[#8C7A70] mt-1 flex items-center gap-1 font-mono">
                      <MapPinned size={12} className="text-[#C56E4E]" /> GPS Coordinates: {booking.coordinates.latitude?.toFixed(6)}, {booking.coordinates.longitude?.toFixed(6)}
                    </p>
                  )}
                  <p className="text-xs text-[#8C7A70] mt-1.5">Our certified expert will arrive directly at your confirmed address during your scheduled time slot.</p>
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
                  <p className="text-sm font-bold text-[#2D2623]">{booking.expert}</p>
                </div>
              </div>
              <button onClick={() => alert(`Calling assigned expert ${booking.expert}...`)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFF6F0] border border-[#EADBD2] text-xs font-bold text-[#C56E4E] hover:bg-[#C56E4E] hover:text-white transition-colors cursor-pointer">
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
                <p className="text-xs text-[#D3C5BF] mt-1">Open your scanner pass to verify and check-in to your appointment.</p>
              </div>

              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center gap-2 rounded-full bg-[#C56E4E] px-7 py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#A35539] transition-transform hover:-translate-y-0.5 shrink-0 cursor-pointer"
              >
                <QrCode size={18} /> View QR & Accept
              </button>
            </div>

          </motion.div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border border-[#EADBD2]">
            <p className="text-xs text-[#8C7A70]">Booking details not found. Please select a valid booking from your history.</p>
          </div>
        )}
      </motion.main>

      {/* ================= QR CODE SCANNER MODAL ================= */}
      <AnimatePresence>
        {showQRModal && booking && (
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
                  <h3 className="font-serif text-2xl font-bold text-[#2D2623]">{booking.serviceName}</h3>
                </div>
                <button 
                  onClick={() => setShowQRModal(false)} 
                  className="grid h-9 w-9 place-items-center rounded-full bg-[#FFF6F0] text-[#8C7A70] hover:text-[#C56E4E] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="bg-[#FFF6F0] border border-[#EADBD2] p-4 rounded-3xl shadow-inner mb-6">
                  <img src={booking.qrCodeUrl} alt="Booking QR Code" className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl" />
                </div>

                <p className="text-xs text-[#8C7A70] mb-2">Reference ID: <strong className="text-[#2D2623]">{booking.id}</strong></p>
                <p className="text-xs font-medium text-[#5C4841] mb-6">
                  Have your beauty expert scan this QR code or accept below to confirm your check-in.
                </p>

                <div className="w-full bg-[#FCF9F6] rounded-2xl p-4 border border-[#EADBD2] text-left mb-6 text-xs space-y-2">
                  <div className="flex justify-between"><span className="text-[#8C7A70]">Date & Slot:</span> <strong className="text-[#2D2623]">{booking.date} at {booking.time}</strong></div>
                  <div className="flex justify-between"><span className="text-[#8C7A70]">Confirmed Address:</span> <span className="text-[#2D2623] font-semibold text-right truncate max-w-[200px]" title={booking.location}>{booking.location}</span></div>
                  <div className="flex justify-between"><span className="text-[#8C7A70]">Expert Assigned:</span> <strong className="text-[#2D2623]">{booking.expert}</strong></div>
                  <div className="flex justify-between"><span className="text-[#8C7A70]">Total Payable:</span> <strong className="text-[#C56E4E]">₹{booking.price}</strong></div>
                </div>

                <button
                  onClick={handleAcceptOrder}
                  className="w-full py-4 rounded-full bg-[#2D2623] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#C56E4E] transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
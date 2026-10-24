import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  RefreshCw, 
  AlertCircle, 
  LogIn, 
  Phone, 
  Star, 
  Navigation,
  Car,
  Home,
  Check,
  X,
  QrCode,
  Sparkles,
  Compass,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { io } from "socket.io-client";
import API from "../services/axios"; 

// --- UTILITY FUNCTIONS ---
const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "—";
  const match = String(timeString).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(timeString);
   
  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const parseStaff = (staffString) => {
  if (!staffString) return { name: "Sneha Patel", role: "Hair Specialist • 5+ Years Experience" };
  const match = staffString.match(/(.*?)\s*\((.*?)\)/);
  if (match) {
    return { name: match[1].trim(), role: `${match[2].trim()} • 5+ Years Experience` };
  }
  return { name: staffString, role: "Beauty Expert • 5+ Years Experience" };
};

// --- ANIMATION VARIANTS ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 20 } }
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
   
  // Modals & Action States
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [trackingBooking, setTrackingBooking] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    setIsUnauthorized(false);

    const token = localStorage.getItem("beautyvibe_user_token") || localStorage.getItem("beautyvibe_admin_token") || localStorage.getItem("token");
    if (!token) {
      setIsUnauthorized(true);
      setError("You are not signed in. Please sign in to view your bookings.");
      setLoading(false);
      return;
    }

    try {
      const response = await API.get("/api/appointments");
      const result = response.data;
      const list = result?.data || result || [];
       
      const normalized = list.map(item => ({
        ...item,
        uid: item._id || item.id,
        serviceName: item.serviceName || item.service?.name || "Hair Spa & Blow Dry",
        image: item.image || item.serviceImage || item.service?.image || "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=400&q=80",
        address: item.address || "Home Service • 2, MG Road, Bangalore"
      }));
       
      setAppointments(Array.isArray(normalized) ? normalized : []);
    } catch (err) {
      console.error("[BeautyVibe] Failed to fetch appointments:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        setIsUnauthorized(true);
        setError("Your session has expired or your token is invalid. Please sign in again.");
      } else {
        setError(err.response?.data?.message || "Unable to load your appointment history. Please check your connection.");
      }
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

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

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("appointmentUpdated", () => fetchAppointments());

    return () => socket.disconnect();
  }, []);

  const openPassModal = (booking) => {
    setActiveBooking(booking);
    setPassModalOpen(true);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      const status = app.status || "Pending";
      const hasStaff = app.staff || app.assignedStaff;
      if (activeTab === "All") return true;
      if (activeTab === "Upcoming") return status === "Pending" || (status === "Accepted" && !hasStaff);
      if (activeTab === "In Progress") return status === "Accepted" && hasStaff;
      if (activeTab === "Completed") return status === "Completed";
      if (activeTab === "Cancelled") return status === "Cancelled" || status === "Rejected";
      return true;
    });
  }, [appointments, activeTab]);

  return (
    <div className="relative min-w-0 flex-1 bg-[#FCF9F6] pb-32 font-sans text-[#2D2623] selection:bg-[#C56E4E] selection:text-white min-h-screen">
      <div className="mx-auto max-w-3xl space-y-6 px-4 pt-6 sm:px-6 sm:pt-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF6F0] border border-[#EADBD2] px-3.5 py-1 mb-2 shadow-sm">
              <Sparkles size={13} className="text-[#C56E4E]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70]">Client Dashboard</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2623]">My Bookings</h1>
            <p className="mt-1 text-xs sm:text-sm text-[#8C7A70]">Track your beauty rituals and live expert arrivals in real time</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold bg-white border border-[#EADBD2] px-3.5 py-2 rounded-full shadow-sm">
              <span className={`h-2 w-2 rounded-full ${socketConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
              <span className="text-[#5C4841]">{socketConnected ? "Live Sync Active 🟢" : "Connecting..."}</span>
            </div>
            <button
              onClick={fetchAppointments}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#EADBD2] shadow-sm transition hover:bg-[#FFF6F0] text-[#5C4841] cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-[#C56E4E]" : ""} />
            </button>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {["All", "Upcoming", "In Progress", "Completed", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                activeTab === tab 
                  ? "bg-[#C56E4E] text-white shadow-md shadow-[#C56E4E]/20"
                  : "bg-white text-[#8C7A70] border border-[#EADBD2] hover:border-[#C56E4E] hover:text-[#C56E4E]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0 text-red-500" />
              <p className="font-medium text-xs sm:text-sm">{error}</p>
            </div>
            {isUnauthorized && (
              <button
                onClick={() => navigate("/login")}
                className="shrink-0 rounded-full bg-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow transition hover:bg-red-700 flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn size={14} /> Sign In
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#EADBD2] border-t-[#C56E4E]" />
              <p className="text-xs font-bold uppercase tracking-widest text-[#8C7A70]">Loading your beauty rituals...</p>
            </div>
          </div>
        )}

        {!loading && filteredAppointments.length === 0 && !error && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-[2.5rem] border border-[#EADBD2] bg-white p-10 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF6F0]">
              <CalendarDays size={28} className="text-[#C56E4E]" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#2D2623]">No Bookings Found</h3>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#8C7A70]">
              No appointments match this category. Explore our catalog and book your next luxury session today!
            </p>
            <button
              onClick={() => navigate("/services")}
              className="mt-6 rounded-full bg-[#C56E4E] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#A35539] cursor-pointer"
            >
              Explore Services
            </button>
          </div>
        )}

        {!loading && filteredAppointments.length > 0 && (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
            {filteredAppointments.map((app) => (
              <BookingCard 
                key={app.uid} 
                booking={app} 
                onShowPass={() => openPassModal(app)}
                onTrack={() => setTrackingBooking(app)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Show Booking Pass Modal */}
      <AnimatePresence>
        {passModalOpen && activeBooking && (
          <BookingPassModal 
            booking={activeBooking} 
            onClose={() => setPassModalOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Live Swiggy-Style Map Tracking Modal */}
      <AnimatePresence>
        {trackingBooking && (
          <LiveTrackingModal 
            booking={trackingBooking} 
            onClose={() => setTrackingBooking(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- BOOKING CARD COMPONENT (WITH COLLAPSIBLE DRAWER & SHOW PASS BUTTON) ---
function BookingCard({ booking, onShowPass, onTrack }) {
  const isCompleted = booking.status === "Completed";
  const isCancelled = booking.status === "Cancelled" || booking.status === "Rejected";
  const hasStaff = booking.staff || booking.assignedStaff;
  const staff = parseStaff(hasStaff);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Status Badge Logic matching reference image
  let badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let statusText = "WAITING FOR CONFIRMATION";

  if (hasStaff && !isCompleted && !isCancelled) {
    statusText = "EXPERT ON THE WAY";
  } else if (booking.status === "Accepted") {
    badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
    statusText = "CONFIRMED";
  } else if (isCompleted) {
    statusText = "COMPLETED";
  } else if (isCancelled) {
    badgeBg = "bg-red-50 text-red-700 border-red-200";
    statusText = "CANCELLED";
  }

  // Stepper steps calculation
  let activeStep = 1; 
  if (hasStaff) activeStep = 2;
  if (isCompleted) activeStep = 4;
  if (isCancelled) activeStep = 0;

  return (
    <motion.div variants={fadeUp} className="bg-white rounded-[2rem] border border-[#EADBD2] shadow-sm p-6 sm:p-7 space-y-5">
      
      {/* Top Row: Thumbnail, Status, Title, Price */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-[#EADBD2]/60 pb-5">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FFF6F0] overflow-hidden shrink-0 border border-[#EADBD2]">
            <img 
              src={booking.image} 
              alt={booking.serviceName} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="min-w-0 space-y-1">
            <span className={`inline-block px-3 py-0.5 rounded-full text-[9px] font-bold tracking-wider border ${badgeBg}`}>
              {statusText}
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2D2623] truncate">{booking.serviceName}</h3>
            <p className="text-xs text-[#8C7A70] font-medium">
              {formatDate(booking.date)} • {formatTime(booking.time)}
            </p>
            <p className="text-[11px] text-[#8C7A70] truncate max-w-xs sm:max-w-sm">
              📍 {booking.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <span className="font-serif text-xl font-bold text-[#2D2623]">
            ₹{Number(booking.amount || booking.price || 0).toLocaleString("en-IN")}
          </span>
          <button 
            onClick={onShowPass} 
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2D2623] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#433632] transition shadow-sm cursor-pointer"
          >
            <QrCode size={13} /> Show Pass
          </button>
        </div>
      </div>

      {/* Expert Profile & Call / Drawer Toggle Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-[#FCF9F6] p-4 rounded-2xl border border-[#EADBD2] gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" 
            alt="Expert" 
            className="w-12 h-12 rounded-full object-cover border border-[#EADBD2] shrink-0" 
          />
          <div>
            <p className="font-bold text-sm text-[#2D2623] flex items-center gap-2">
              {staff.name}
              <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Star size={10} className="fill-amber-500 mr-0.5" /> 4.8
              </span>
            </p>
            <p className="text-xs text-[#8C7A70] font-medium">{staff.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <a 
            href="tel:+919876543210" 
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition shadow-sm cursor-pointer"
          >
            <Phone size={13} /> Call
          </a>
          <button 
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-[#C56E4E] bg-[#FFF6F0] border border-[#C56E4E]/30 hover:bg-[#FFEBDD] transition shadow-sm cursor-pointer"
          >
            Track Expert {isDrawerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Collapsible Drawer Style Tracking Section */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-5 pt-2 border-t border-[#EADBD2]/60"
          >
            {/* Horizontal Stepper Timeline */}
            <div className="py-3">
              <div className="relative flex items-center justify-between w-full max-w-md mx-auto">
                <div className="absolute left-4 right-4 top-3 h-[2px] bg-[#EADBD2] -z-0" />
                <motion.div 
                  className="absolute left-4 top-3 h-[2px] bg-[#C56E4E] -z-0" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(activeStep / 4) * 88}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />

                {[
                  { label: "Booking Confirmed", step: 0 },
                  { label: "Expert Assigned", step: 1 },
                  { label: "Expert On the Way", step: 2 },
                  { label: "Arriving Soon", step: 3 },
                  { label: "Service Completed", step: 4 }
                ].map((item, idx) => {
                  const isDone = idx <= activeStep;
                  return (
                    <div key={idx} className="flex flex-col items-center relative z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-sm ${
                        isDone ? "bg-[#C56E4E] text-white ring-4 ring-[#FFF6F0]" : "bg-white border-2 border-[#EADBD2] text-[#8C7A70]"
                      }`}>
                        {isDone ? <Check size={12} strokeWidth={3} /> : idx + 1}
                      </div>
                      <span className={`text-[9px] mt-1.5 text-center font-bold leading-tight max-w-[60px] ${isDone ? "text-[#2D2623]" : "text-[#A39292]"}`}>
                        {item.label.replace('\n', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Alert Banner & Live Map Button */}
            <div className="bg-[#FFF6F0] border border-[#EADBD2] px-4 py-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <div className="text-xs leading-relaxed text-[#5C4841]">
                  <strong className="text-[#2D2623] font-bold block">Your expert has been assigned!</strong>
                  {staff.name} will start preparing and head to your location soon.
                </div>
              </div>

              {!isCancelled && (
                <button
                  onClick={onTrack}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#C56E4E] hover:bg-[#A35539] transition shadow-sm shrink-0 cursor-pointer"
                >
                  <Navigation size={13} /> Open Live Map
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

// --- DIGITAL TICKET PASS MODAL ---
function BookingPassModal({ booking, onClose }) {
  const passCodeStr = booking.passCode || booking.uid || "BV-8492026";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(passCodeStr)}&margin=10`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2D2623]/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-gradient-to-b from-[#2D2623] to-[#1A1513] rounded-[2.5rem] border border-[#4A3F39] shadow-2xl w-full max-w-sm text-white overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-white/60 hover:text-white z-20 bg-white/10 p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer">
          <X size={18} />
        </button>

        <div className="absolute top-[58%] -left-[16px] w-[32px] h-[32px] rounded-full bg-[#FCF9F6] shadow-inner z-10" />
        <div className="absolute top-[58%] -right-[16px] w-[32px] h-[32px] rounded-full bg-[#FCF9F6] shadow-inner z-10" />

        <div className="p-7 text-center border-b border-white/10 pt-10">
          <h2 className="font-serif text-2xl font-bold tracking-wide text-white">BeautyVibe</h2>
          <div className="flex items-center justify-center gap-2 mt-2 text-[10px] font-bold tracking-widest text-[#E5A024] uppercase">
            <span>VIP Client</span>
            <span className="w-1 h-1 rounded-full bg-[#8C7A70]" />
            <span>Digital Pass</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-8 relative">
          <div className="relative p-1.5 rounded-3xl bg-gradient-to-br from-[#C56E4E] to-[#E5A024] shadow-[0_0_30px_rgba(197,110,78,0.3)]">
            <div className="p-3 rounded-[20px] bg-white">
              <img src={qrCodeUrl} alt="Booking QR Code" className="w-44 h-44 object-contain rounded-xl" />
            </div>
          </div>
          <p className="mt-4 font-mono text-xs tracking-[0.25em] text-[#EADBD2]/80 uppercase">
            {passCodeStr}
          </p>
        </div>

        <div className="px-7 py-0 relative z-0">
          <div className="border-t-[1.5px] border-dashed border-white/20 w-full" />
        </div>

        <div className="p-7 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] uppercase tracking-wider text-[#8C7A70] font-bold">Service Ritual</span>
              <p className="text-sm font-semibold text-white font-serif leading-tight">{booking.serviceName}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#8C7A70] font-bold block mb-1">Total</span>
              <span className="font-serif text-lg font-bold text-[#C56E4E]">₹{Number(booking.amount || booking.price || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-white/90">
            <CalendarDays size={15} className="text-[#C56E4E]" />
            <span>{formatDate(booking.date)} • {formatTime(booking.time)}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- SWIGGY-STYLE LIVE MAP TRACKING MODAL ---
function LiveTrackingModal({ booking, onClose }) {
  const staff = parseStaff(booking.staff || booking.assignedStaff);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#2D2623]/70 backdrop-blur-sm sm:p-4"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col h-[90vh] sm:h-[650px] border border-[#EADBD2]"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between p-5 border-b border-[#EADBD2] bg-[#FCF9F6] z-20">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#C56E4E] block">Swiggy-Style Live Tracking</span>
            <h3 className="font-serif text-lg font-bold text-[#2D2623]">{staff.name} is on the way</h3>
          </div>
          <button onClick={onClose} className="bg-white h-9 w-9 rounded-full shadow-sm text-[#8C7A70] hover:text-[#C56E4E] border border-[#EADBD2] flex items-center justify-center transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Real Swiggy-Style Simulated Live Map View */}
        <div className="flex-1 bg-[#E8F0F2] relative overflow-hidden">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-50">
            <defs>
              <pattern id="mapgrid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#CBD5E1" strokeWidth="1.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapgrid)" />
            {/* Route path */}
            <path d="M 60,120 Q 150,80 220,180 T 360,280" fill="none" stroke="#C56E4E" strokeWidth="5" strokeDasharray="8 6" className="animate-pulse" />
          </svg>

          {/* Expert Scooter / Bike Marker Moving */}
          <motion.div 
            animate={{ x: [0, 60, 120, 160], y: [0, 30, 80, 120] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute top-[100px] left-[50px] bg-[#2D2623] text-white p-2.5 rounded-full shadow-xl border-2 border-white z-10 flex items-center justify-center"
          >
            <Car size={20} className="text-[#E5A024]" />
          </motion.div>

          {/* Destination Pin */}
          <div className="absolute bottom-[80px] right-[80px] bg-red-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white z-10">
            <Home size={20} />
          </div>

          {/* Floating ETA Card */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-[#EADBD2] text-center z-10 flex items-center gap-2">
            <Compass size={16} className="text-[#C56E4E] animate-spin" />
            <span className="text-xs font-bold text-[#2D2623]">Estimated arrival in <span className="text-[#C56E4E]">14 mins</span> (3.2 km)</span>
          </div>
        </div>

        {/* Bottom Drawer Info */}
        <div className="bg-white rounded-t-[2.5rem] -mt-6 z-20 relative p-6 shadow-[0_-10px_20px_rgba(0,0,0,0.06)] space-y-5">
          <div className="flex justify-center -mt-3 mb-1">
            <div className="w-12 h-1.5 bg-[#EADBD2] rounded-full" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" 
                alt="Expert" 
                className="w-12 h-12 rounded-full object-cover border border-[#EADBD2]" 
              />
              <div>
                <p className="font-bold text-sm text-[#2D2623] flex items-center gap-2">
                  {staff.name}
                  <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    <Star size={10} className="fill-amber-500 mr-0.5" /> 4.8
                  </span>
                </p>
                <p className="text-xs text-[#8C7A70]">Heading to: {booking.address}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <a href="tel:+919876543210" className="w-full py-3.5 rounded-full bg-red-50 text-red-600 font-bold text-xs border border-red-200 hover:bg-red-100 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer">
              <Phone size={15} /> Call Expert
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
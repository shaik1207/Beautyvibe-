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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  Users,
  QrCode
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
  if (!staffString) return null;
  const match = staffString.match(/(.*?)\s*\((.*?)\)/);
  if (match) {
    return { name: match[1].trim(), role: match[2].trim() };
  }
  return { name: staffString, role: "Beauty Expert" };
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
  const [actionLoading, setActionLoading] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [staffList, setStaffList] = useState([]);

  const fetchStaffMembers = useCallback(async () => {
    try {
      const res = await API.get("/api/staff");
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list) && list.length > 0) {
        const formattedStaff = list.map((s) => `${s.firstName || ""} ${s.lastName || ""} (${s.role || "Expert"})`.trim());
        setStaffList(formattedStaff);
      } else {
        setStaffList([
          "Sameer Shaik (Senior Aesthetician)",
          "Ananya Rao (Master Hair Stylist)",
          "Pooja Hegde (Spa & Massage Expert)",
        ]);
      }
    } catch (err) {
      setStaffList([
        "Sameer Shaik (Senior Aesthetician)",
        "Ananya Rao (Master Hair Stylist)",
        "Pooja Hegde (Spa & Massage Expert)",
      ]);
    }
  }, []);

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
        image: item.image || item.serviceImage || item.service?.image || "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80"
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
    fetchStaffMembers();

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl, { transports: ["polling", "websocket"], reconnection: true });

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("appointmentUpdated", () => fetchAppointments());

    return () => socket.disconnect();
  }, [fetchStaffMembers]);

  const updateStatus = async (booking, status) => {
    if (!booking._id) return;
    setActionLoading(booking._id);
    try {
      await API.patch(`/api/appointments/${booking._id}/status`, { status });
      setAppointments((current) => current.map((item) => (item._id === booking._id ? { ...item, status } : item)));
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const assignStaff = async (booking, staffName) => {
    if (!booking._id) return;
    setActionLoading(booking._id);
    try {
      await API.patch(`/api/appointments/${booking._id}/assign-staff`, { assignedStaff: staffName });
      setAppointments((current) => current.map((item) => (item._id === booking._id ? { ...item, assignedStaff: staffName, staff: staffName } : item)));
      setOpenDropdownId(null);
    } catch (error) {
      console.error("Staff assignment failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

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
    <div className="relative min-w-0 flex-1 bg-[#F9FAFB] pb-32 font-sans text-[#2D2623] selection:bg-[#C56E4E] selection:text-white min-h-screen">
      <div className="mx-auto max-w-4xl space-y-6 px-4 pt-6 sm:px-6 sm:pt-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1A1E23]">My Bookings</h1>
            <p className="mt-1 text-sm text-gray-500">Track your beauty journey with real-time updates</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
              <span className={`h-2 w-2 rounded-full ${socketConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
              <span className="text-gray-600">{socketConnected ? "Live Sync 🟢" : "Connecting..."}</span>
            </div>
            <button
              onClick={fetchAppointments}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm transition hover:bg-gray-50 text-gray-600"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-[#C56E4E]" : ""} />
            </button>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {["All", "Upcoming", "In Progress", "Completed", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                activeTab === tab 
                  ? "bg-[#E6B3A3] text-[#632915]"
                  : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0 text-red-500" />
              <p className="font-medium">{error}</p>
            </div>
            {isUnauthorized && (
              <button
                onClick={() => navigate("/login")}
                className="shrink-0 rounded-full bg-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow transition hover:bg-red-700 flex items-center gap-1.5"
              >
                <LogIn size={14} /> Sign In
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#C56E4E]" />
              <p className="text-xs font-semibold text-gray-500">Loading your journey...</p>
            </div>
          </div>
        )}

        {!loading && filteredAppointments.length === 0 && !error && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0E7]">
              <CalendarDays size={28} className="text-[#C56E4E]" />
            </div>
            <h3 className="font-serif text-xl font-bold">No Bookings Found</h3>
            <p className="mt-2 max-w-sm text-xs leading-6 text-gray-500">
              No appointments match this category. Book your next beauty ritual today!
            </p>
            <button
              onClick={() => navigate("/services")}
              className="mt-6 rounded-full bg-[#C56E4E] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#A35539]"
            >
              Book Service
            </button>
          </div>
        )}

        {!loading && filteredAppointments.length > 0 && (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
            {filteredAppointments.map((app) => (
              <BookingCard 
                key={app._id || app.requestId} 
                booking={app} 
                staffList={staffList}
                actionLoading={actionLoading}
                updateStatus={updateStatus}
                assignStaff={assignStaff}
                openDropdownId={openDropdownId}
                setOpenDropdownId={setOpenDropdownId}
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

      {/* Live Tracking Overlay Modal */}
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

// --- BOOKING CARD COMPONENT ---
function BookingCard({ booking, staffList, actionLoading, updateStatus, assignStaff, openDropdownId, setOpenDropdownId, onShowPass, onTrack }) {
  const isHome = String(booking.type || "").toUpperCase() === "HOME";
  const isCompleted = booking.status === "Completed";
  const isCancelled = booking.status === "Cancelled" || booking.status === "Rejected";
  const isPending = booking.status === "Pending";
  const isAccepted = booking.status === "Accepted";
  const hasStaff = booking.staff || booking.assignedStaff;
  
  const [isTrackingExpanded, setIsTrackingExpanded] = useState(false);

  // Determine timeline step (4 steps now)
  let activeStep = 0;
  if (isPending) activeStep = 0; 
  else if (isAccepted && !hasStaff) activeStep = 0; 
  else if (isAccepted && hasStaff) activeStep = isHome ? 2 : 1; // Show Arriving soon if home service
  else if (isCompleted) activeStep = 3; 

  const staffDetails = parseStaff(hasStaff);
  
  let badgeColor = "bg-emerald-100 text-emerald-700";
  let statusText = "CONFIRMED";
  if (hasStaff && !isCompleted && !isCancelled) { badgeColor = "bg-blue-100 text-blue-700"; statusText = "EXPERT ASSIGNED"; }
  if (isCompleted) { badgeColor = "bg-green-100 text-green-700"; statusText = "COMPLETED"; }
  if (isCancelled) { badgeColor = "bg-red-100 text-red-700"; statusText = "CANCELLED"; }

  return (
    <motion.div variants={fadeUp} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 overflow-hidden">
      <div className="flex gap-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
          <img 
            src={booking.image || "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80"} 
            alt={booking.serviceName} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${badgeColor}`}>
              {statusText}
            </span>
            <span className="font-serif font-bold text-lg text-gray-900">
              ₹{Number(booking.amount || booking.price || 0).toLocaleString("en-IN")}
            </span>
          </div>
          <h3 className="font-serif text-lg font-bold text-gray-900 truncate">{booking.serviceName || "Premium Beauty Ritual"}</h3>
          
          <div className="mt-1.5 space-y-1 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={13} /> {formatDate(booking.date)} • {formatTime(booking.time)}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={13} /> {isHome ? "Home Service" : "Salon Visit"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          {isPending && (
            <>
              <button
                onClick={() => updateStatus(booking, "Accepted")}
                disabled={actionLoading === booking._id}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
              >
                <Check size={14} /> Accept
              </button>
              <button
                onClick={() => updateStatus(booking, "Rejected")}
                disabled={actionLoading === booking._id}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-red-50 px-3 text-xs font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
              >
                <X size={14} /> Reject
              </button>
            </>
          )}

          {isAccepted && !hasStaff && (
            <button
              onClick={() => setOpenDropdownId(openDropdownId === booking._id ? null : booking._id)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50 shadow-sm"
            >
              <Users size={14} /> Assign Staff
            </button>
          )}

          {(isAccepted || isCompleted) && (
            <button
              onClick={onShowPass}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#302722] text-white px-4 text-xs font-bold transition hover:bg-[#B66B4B] shadow-sm"
            >
              <QrCode size={14} /> Show Pass
            </button>
          )}

          {isCancelled && (
            <span className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-red-50 px-3 text-xs font-bold text-red-700">
              <X size={14} /> Cancelled
            </span>
          )}
        </div>

        {!isCancelled && (
          <button
            onClick={() => setIsTrackingExpanded(!isTrackingExpanded)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C56E4E] hover:text-[#A35539] transition-colors ml-auto"
          >
            Track Status {isTrackingExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {isAccepted && !hasStaff && openDropdownId === booking._id && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-2 shadow-inner">
          <p className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Select Expert
          </p>
          {staffList.map((staff) => (
            <button
              key={staff}
              onClick={() => assignStaff(booking, staff)}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2.5 text-left text-[11px] font-medium text-gray-700 hover:bg-white hover:shadow-sm transition-all"
            >
              {staff}
            </button>
          ))}
        </div>
      )}

      {/* Expandable Tracking Status Area */}
      <AnimatePresence>
        {isTrackingExpanded && !isCancelled && (
          <motion.div
            initial={{ height: 0, opacity: 0, scale: 0.95 }}
            animate={{ height: "auto", opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden origin-top"
          >
            <div className="mt-4 bg-gray-50 rounded-2xl border border-gray-100 p-5 shadow-inner">
              
              <div className="px-4 pb-4">
                <Stepper currentStep={activeStep} />
              </div>

              {hasStaff && (
                <div className="mt-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" 
                        alt="Expert" 
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0" 
                      />
                      <div>
                        <p className="font-bold text-sm text-gray-900 flex items-center gap-2">
                          {staffDetails?.name || "Expert"}
                          <span className="flex items-center text-xs font-semibold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                            <Star size={10} className="fill-amber-500 mr-0.5" /> 4.9
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 font-medium">{staffDetails?.role || "Specialist"} • 5+ Yrs Exp</p>
                      </div>
                    </div>
                    
                    <a href="tel:+919876543210" className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition shadow-sm">
                      <Phone size={14} /> Call Expert
                    </a>
                  </div>

                  {isHome && activeStep >= 1 && (
                    <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><Car size={16} /></div>
                        <div>
                          <p className="text-xs font-bold text-blue-900">Your expert is on the way</p>
                          <p className="text-[10px] text-blue-700">Estimated arrival in <strong className="font-bold">12 minutes</strong></p>
                        </div>
                      </div>
                      <button onClick={onTrack} className="text-xs font-bold bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-1">
                        <Navigation size={12} className="text-blue-500" /> View Live Location
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

// --- VISUAL STEPPER COMPONENT (4 STEPS) ---
function Stepper({ currentStep }) {
  const steps = [
    { label: "Booking\nConfirmed", icon: Check },
    { label: "Expert\nAssigned", icon: Users },
    { label: "Arriving\nSoon", icon: Clock },
    { label: "Service\nCompleted", icon: CheckCircle2 }
  ];

  return (
    <div className="relative flex items-center justify-between w-full">
      <div className="absolute left-0 right-0 top-3 h-[2px] bg-gray-200 -z-10" />
      <motion.div 
        className="absolute left-0 top-3 h-[2px] bg-blue-500 -z-10" 
        initial={{ width: 0 }}
        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {steps.map((step, idx) => {
        const isActive = idx <= currentStep;
        const Icon = step.icon;
        return (
          <div key={idx} className="flex flex-col items-center relative group">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 border-2 ${
              isActive ? "bg-blue-500 border-blue-500 text-white shadow-sm" : "bg-white border-gray-300 text-gray-300"
            }`}>
              {isActive && idx < currentStep ? <Check size={12} strokeWidth={3} /> : <Icon size={12} strokeWidth={isActive ? 2.5 : 2} />}
            </div>
            <div className="absolute top-8 w-24 text-center -ml-9 flex flex-col">
              {step.label.split('\n').map((line, i) => (
                <span key={i} className={`text-[9px] leading-tight font-bold ${isActive ? "text-gray-800" : "text-gray-400 font-medium"}`}>
                  {line}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- DIGITAL TICKET PASS MODAL ---
function BookingPassModal({ booking, onClose }) {
  const passCodeStr = booking.passCode || booking.id || "BV-8492026";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(passCodeStr)}&margin=10`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-gradient-to-b from-[#2D2623] to-[#1A1513] rounded-[2rem] border border-[#4A3F39] shadow-2xl w-full max-w-sm text-white overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-20">
          <X size={20} />
        </button>

        <div className="absolute top-[58%] -left-[14px] w-[26px] h-[26px] rounded-full bg-gray-900 shadow-inner z-10" />
        <div className="absolute top-[58%] -right-[14px] w-[26px] h-[26px] rounded-full bg-gray-900 shadow-inner z-10" />

        <div className="p-6 text-center border-b border-white/10 pb-5 pt-8">
          <h2 className="font-serif text-xl font-bold tracking-wide text-white">BeautyVibe</h2>
          <div className="flex items-center justify-center gap-2 mt-2 text-[10px] font-semibold tracking-wider text-[#C56E4E] uppercase">
            <span>VIP Client</span>
            <span className="w-1 h-1 rounded-full bg-[#8C7A70]" />
            <span>Digital Pass</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-8 relative">
          <div className="relative p-1 rounded-2xl bg-gradient-to-br from-[#C56E4E] to-[#E5A024] shadow-[0_0_30px_rgba(197,110,78,0.25)]">
            <div className="p-2 rounded-[14px] bg-white">
              <img src={qrCodeUrl} alt="Booking QR Code" className="w-40 h-40 object-contain rounded-lg" />
            </div>
          </div>
          <p className="mt-4 font-mono text-[11px] tracking-[0.2em] text-[#EADBD2]/70 uppercase">
            {passCodeStr}
          </p>
        </div>

        <div className="px-6 py-0 relative z-0">
          <div className="border-t-[1.5px] border-dashed border-[#4A3F39] w-full" />
        </div>

        <div className="p-7 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <span className="text-[10px] uppercase tracking-wider text-[#8C7A70] font-bold">Service Ritual</span>
              <p className="text-sm font-semibold text-white font-serif leading-tight">{booking.serviceName}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#8C7A70] font-bold block mb-1">Total</span>
              <span className="font-serif text-lg font-bold text-[#C56E4E]">₹{Number(booking.amount || booking.price || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <CalendarDays size={14} className="text-[#C56E4E]" />
            <span className="text-xs font-semibold text-white/90">{formatDate(booking.date)} • {formatTime(booking.time)}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- LIVE TRACKING OVERLAY MODAL (Only Call) ---
function LiveTrackingModal({ booking, onClose }) {
  const staffDetails = parseStaff(booking.staff || booking.assignedStaff) || { name: "Assigned Expert", role: "Specialist" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-sm sm:p-4"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col h-[85vh] sm:h-[600px]"
      >
        <div className="absolute top-4 left-4 z-10">
          <button onClick={onClose} className="bg-white/90 p-2 rounded-full shadow-sm text-gray-700 hover:bg-white border border-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="absolute top-5 left-0 right-0 flex justify-center z-0 pointer-events-none">
          <span className="bg-white/90 px-4 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-200">
            Live Tracking
          </span>
        </div>

        <div className="flex-1 bg-[#E8F0F2] relative overflow-hidden">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-40">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path d="M 80,100 L 150,140 L 130,220 L 250,250" fill="none" stroke="#3B82F6" strokeWidth="4" strokeLinejoin="round" />
          </svg>
          <div className="absolute top-[80px] left-[60px] bg-white p-2 rounded-full shadow-lg border border-blue-100 z-10">
            <Car size={20} className="text-blue-600" />
          </div>
          <div className="absolute top-[230px] left-[230px] bg-red-500 p-2 rounded-full shadow-lg border-2 border-white z-10">
            <Home size={20} className="text-white" />
          </div>
          <div className="absolute top-[130px] left-[150px] bg-white px-4 py-2 rounded-2xl shadow-lg border border-gray-100 text-center z-10">
            <p className="text-sm font-bold text-gray-900">12 mins away</p>
            <p className="text-xs text-gray-500">2.5 km</p>
          </div>
        </div>

        <div className="bg-white rounded-t-3xl -mt-6 z-20 relative p-5 sm:p-6 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] flex flex-col gap-5">
          <div className="flex justify-center -mt-8 mb-2">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" 
                alt="Expert" 
                className="w-12 h-12 rounded-full object-cover border border-gray-200" 
              />
              <div>
                <p className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  {staffDetails.name}
                  <span className="flex items-center text-xs font-semibold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                    <Star size={10} className="fill-amber-500 mr-0.5" /> 4.9
                  </span>
                </p>
                <p className="text-xs text-gray-500">{staffDetails.role} • KA 05 AB 1234</p>
              </div>
            </div>
          </div>

          <a href="tel:+919876543210" className="w-full flex justify-center items-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-xs border border-red-100 transition hover:bg-red-100">
            <Phone size={16} /> Call Expert
          </a>

          <div className="space-y-0 relative pl-4 mt-2 overflow-y-auto max-h-40">
            <div className="absolute left-6 top-3 bottom-6 w-0.5 bg-gray-200" />
            
            <div className="relative flex gap-4 pb-6">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 border-[3px] border-white shadow-sm">
                <Check size={10} strokeWidth={3} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Booking Confirmed</p>
                <p className="text-[10px] text-gray-500">9:00 AM</p>
              </div>
            </div>

            <div className="relative flex gap-4 pb-6">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 border-[3px] border-white shadow-sm">
                <Check size={10} strokeWidth={3} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Expert Assigned</p>
                <p className="text-[10px] text-gray-500">9:10 AM</p>
              </div>
            </div>

            <div className="relative flex gap-4 pb-6">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 z-10 border-[3px] border-white shadow-sm">
                <Car size={10} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Expert On The Way</p>
                <p className="text-[10px] text-gray-500">9:25 AM</p>
              </div>
            </div>

            <div className="relative flex gap-4 pb-6 opacity-40">
              <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shrink-0 z-10" />
              <div>
                <p className="text-xs font-bold text-gray-900">Arriving Soon</p>
                <p className="text-[10px] text-gray-500">Estimated at 9:40 AM</p>
              </div>
            </div>

            <div className="relative flex gap-4 opacity-40">
              <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shrink-0 z-10" />
              <div>
                <p className="text-xs font-bold text-gray-900">Service Completed</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
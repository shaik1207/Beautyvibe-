import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  Clock, 
  House, 
  Store, 
  Sparkles, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ArrowRight,
  QrCode,
  ShieldCheck,
  Check,
  Plus,
  Calendar,
  ChevronDown,
  RefreshCw,
  AlertCircle
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

const availableTimeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 20 } }
};

export default function BookAppointment() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialServiceId = params.get("service") || "";
  
  const [allServices, setAllServices] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [date, setDate] = useState("2026-10-20");
  const [time, setTime] = useState("");
  const [type, setType] = useState("SALON");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [error, setError] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState(null);

  // Fetch services and booked slots for the chosen date
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, slotsRes] = await Promise.all([
          API.get("/api/services"),
          API.get(`/api/appointments/booked-slots?date=${date}`).catch(() => ({ data: { data: [] } }))
        ]);

        if (servicesRes.data?.success && servicesRes.data.data.length > 0) {
          const formatted = servicesRes.data.data.map(s => ({
            id: s._id || s.id,
            name: s.title || s.name,
            price: Number(s.price) || 0,
            duration: s.duration || "45 min",
            image: s.image || "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=200&q=80"
          }));
          setAllServices(formatted);
          
          const target = formatted.find(s => s.id === initialServiceId) || formatted[0];
          if (target) {
            setSelectedServiceIds([target.id]);
          }
        }

        if (slotsRes.data?.data) {
          setBookedSlots(slotsRes.data.data); // e.g. ["11:00 AM", "02:00 PM"]
        }
      } catch (err) {
        console.error("Failed to load booking data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Socket.io Connection for Real-Time Slot Updates
    const socket = io("http://localhost:5000", {
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));

    socket.on("appointmentBooked", (newBooking) => {
      if (newBooking.date === date || newBooking.datetime?.includes(date)) {
        setBookedSlots(prev => [...prev, newBooking.time]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [date, initialServiceId]);

  // Separate Selected vs Recommended
  const primarySelectedId = selectedServiceIds[0];
  const primaryService = allServices.find((s) => s.id === primarySelectedId) || allServices[0] || { id: "", name: "Select Ritual", price: 0, duration: "45 min", image: "" };
  const additionalSelectedIds = selectedServiceIds.slice(1);
  const additionalSelectedServices = allServices.filter((s) => additionalSelectedIds.includes(s.id));
  const recommendedServices = allServices.filter((s) => !selectedServiceIds.includes(s.id));

  const totalCalculatedPrice = selectedServiceIds.reduce((sum, id) => {
    const s = allServices.find(item => item.id === id);
    return sum + (s ? s.price : 0);
  }, 0);

  const toggleRecommendedService = (id) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter(item => item !== id));
      }
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      setError("Please select your preferred date and time slot.");
      return;
    }
    if (bookedSlots.includes(time)) {
      setError("Selected time slot is already booked. Please pick another time.");
      return;
    }
    if (!primaryService.id) {
      setError("Please select at least one valid service.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        serviceId: primaryService.id,
        serviceName: primaryService.name,
        additionalServices: additionalSelectedServices.map(s => s.name),
        amount: totalCalculatedPrice,
        datetime: `${date}T${time}`,
        type,
        paymentMethod
      };

      const res = await API.post("/api/appointments", payload);

      if (res.data?.success) {
        sessionStorage.setItem("beautyvibe_booking_draft", JSON.stringify({
          ...res.data.data,
          price: totalCalculatedPrice,
          date,
          time,
          type,
          paymentMethod
        }));
        navigate("/checkout");
      }
    } catch (err) {
      console.error("Booking error:", err);
      sessionStorage.setItem("beautyvibe_booking_draft", JSON.stringify({
        serviceId: primaryService.id,
        serviceName: primaryService.name, 
        additionalServices: additionalSelectedServices.map(s => s.name),
        price: totalCalculatedPrice, 
        date, 
        time, 
        type, 
        paymentMethod
      }));
      navigate("/checkout");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#FCF9F6] text-[#2D2623]">
        <RefreshCw size={32} className="animate-spin text-[#C56E4E] mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Loading live appointment slots...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-28 text-[#2D2623]">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8"
      >
        
        {/* Header Intro */}
        <motion.div variants={fadeUp} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF6F0] border border-[#EADBD2] px-4 py-1.5 mb-3 shadow-sm">
              <Sparkles size={14} className="text-[#C56E4E]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70]">Your Self-Care Ritual</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2623]">Book an Appointment</h1>
            <p className="mt-2 text-xs sm:text-sm font-medium text-[#8C7A70]">Customize your ritual, pick your preferred live schedule, and secure your booking pass.</p>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-[#EADBD2] px-4 py-2 rounded-2xl text-xs font-bold text-[#5C4841] shadow-sm w-fit">
            <span className={`h-2.5 w-2.5 rounded-full ${socketConnected ? "bg-[#1E9E4A]" : "bg-[#E5A024]"}`} />
            <span>{socketConnected ? "Live Database Connected 🟢" : "Connecting..."}</span>
          </div>
        </motion.div>

        <form onSubmit={handleCreateAppointment} className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form Panel (7 Cols) */}
          <motion.div variants={fadeUp} className="lg:col-span-7 space-y-8 bg-white rounded-[2.5rem] border border-[#EADBD2] p-6 sm:p-8 shadow-sm">
            
            {/* 1. SELECTED RITUAL */}
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2D2623] mb-4 flex items-center justify-between">
                <span>1. Selected Ritual</span>
                <span className="text-xs font-bold text-[#C56E4E] bg-[#FFF6F0] px-3 py-1 rounded-full border border-[#EADBD2]">Primary Service</span>
              </h2>

              <div className="rounded-[2rem] border-2 border-[#C56E4E] bg-[#FFF6F0]/50 p-4 flex items-center gap-4 shadow-md">
                <img src={primaryService.image} alt={primaryService.name} className="h-16 w-16 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-serif text-base font-bold text-[#2D2623]">{primaryService.name}</h3>
                  <p className="text-xs text-[#8C7A70] mt-0.5"><Clock size={12} className="inline mr-1" /> {primaryService.duration}</p>
                </div>
                <strong className="font-serif text-lg font-bold text-[#C56E4E]">₹{primaryService.price}</strong>
              </div>

              {additionalSelectedServices.length > 0 && (
                <div className="mt-3 space-y-2">
                  {additionalSelectedServices.map(add => (
                    <div key={add.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#FCF9F6] border border-[#EADBD2] text-xs font-bold text-[#5C4841]">
                      <span>+ {add.name}</span>
                      <span className="font-serif text-sm text-[#2D2623]">₹{add.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RECOMMENDED RITUALS (ADD-ONS) */}
            {recommendedServices.length > 0 && (
              <div>
                <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-[#8C7A70] mb-3">Recommended Add-on Rituals</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recommendedServices.map((rec) => (
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      key={rec.id}
                      onClick={() => toggleRecommendedService(rec.id)}
                      className="group flex items-center gap-3 p-3 rounded-2xl border border-[#EADBD2] hover:border-[#C56E4E] cursor-pointer bg-[#FCF9F6] transition-all shadow-sm"
                    >
                      <img src={rec.image} alt={rec.name} className="h-12 w-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-xs font-bold text-[#2D2623] truncate">{rec.name}</h4>
                        <span className="font-serif text-xs font-bold text-[#C56E4E]">₹{rec.price}</span>
                      </div>
                      <div className="h-6 w-6 rounded-full border border-[#EADBD2] flex items-center justify-center text-[#8C7A70] group-hover:border-[#C56E4E] group-hover:text-[#C56E4E]">
                        <Plus size={14} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. LOCATION TYPE */}
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2D2623] mb-4">2. Select Service Location</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["SALON", Store, "At the Salon"], 
                  ["HOME", House, "At my Doorstep"]
                ].map(([value, Icon, label]) => (
                  <button 
                    type="button" 
                    key={value} 
                    onClick={() => setType(value)} 
                    className={`rounded-2xl border p-4 flex flex-col items-center text-center transition-all cursor-pointer ${
                      type === value 
                        ? "border-[#C56E4E] bg-[#FFF6F0] shadow-md ring-2 ring-[#C56E4E]/20 text-[#C56E4E]" 
                        : "border-[#EADBD2] hover:border-[#C56E4E]/50 text-[#8C7A70] bg-white"
                    }`}
                  >
                    <Icon size={22} className="mb-2" />
                    <span className="text-xs font-bold text-[#2D2623]">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. SCHEDULE & AVAILABLE TIME SLOTS (WITH STRIKE-THROUGH & HOVER TOOLTIP) */}
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2D2623] mb-4">3. Preferred Schedule</h2>
              
              <div className="bg-[#FCF9F6] rounded-3xl border border-[#EADBD2] p-5 space-y-5">
                
                {/* Date Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A70] mb-2">Select Date</label>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="w-full flex items-center justify-between bg-white border border-[#EADBD2] rounded-2xl px-4 py-3.5 text-xs font-bold text-[#2D2623] hover:border-[#C56E4E] transition-all shadow-sm cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#C56E4E]" />
                      {date ? `Selected Date: ${date}` : "Choose appointment date..."}
                    </span>
                    <ChevronDown size={16} className={`text-[#8C7A70] transition-transform duration-300 ${isCalendarOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isCalendarOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="overflow-hidden mt-3 rounded-2xl bg-white border border-[#EADBD2] p-4 shadow-xl"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-serif text-sm font-bold text-[#2D2623]">October 2026</span>
                          <span className="text-[10px] font-bold text-[#C56E4E] bg-[#FFF6F0] px-2.5 py-1 rounded-full border border-[#EADBD2]">Live Calendar</span>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { day: "Thu", num: "16" },
                            { day: "Fri", num: "17" },
                            { day: "Sat", num: "18" },
                            { day: "Sun", num: "19" },
                            { day: "Mon", num: "20" },
                          ].map(d => {
                            const fullDateStr = `2026-10-${d.num}`;
                            const isSelected = date === fullDateStr;

                            return (
                              <button
                                key={d.num}
                                type="button"
                                onClick={() => {
                                  setDate(fullDateStr);
                                  setIsCalendarOpen(false);
                                }}
                                className={`flex flex-col items-center py-2.5 rounded-xl border transition-all cursor-pointer ${
                                  isSelected 
                                    ? "bg-[#C56E4E] border-[#C56E4E] text-white shadow-md scale-105" 
                                    : "bg-[#FCF9F6] border-[#EADBD2] text-[#5C4841] hover:border-[#C56E4E]"
                                }`}
                              >
                                <span className="text-[9px] uppercase tracking-wider opacity-80">{d.day}</span>
                                <strong className="text-sm font-serif mt-0.5">{d.num}</strong>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Time Slots with Strike-Through & Hover Tooltip */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A70]">Select Time Slot</label>
                    <span className="text-[10px] text-[#8C7A70]">Strikes indicate booked slots</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 relative">
                    {availableTimeSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isTimeSelected = time === slot;

                      return (
                        <div key={slot} className="relative">
                          <button
                            type="button"
                            disabled={isBooked}
                            onClick={() => !isBooked && setTime(slot)}
                            onMouseEnter={() => isBooked && setHoveredSlot(slot)}
                            onMouseLeave={() => setHoveredSlot(null)}
                            className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                              isBooked 
                                ? "bg-[#EADBD2]/40 border-[#EADBD2] text-[#A39292] line-through cursor-not-allowed opacity-60" 
                                : isTimeSelected 
                                ? "bg-[#C56E4E] border-[#C56E4E] text-white shadow-md cursor-pointer" 
                                : "bg-white border-[#EADBD2] text-[#5C4841] hover:border-[#C56E4E] cursor-pointer"
                            }`}
                          >
                            {slot}
                          </button>

                          {/* Hover Tooltip: "Slot not available" */}
                          <AnimatePresence>
                            {isBooked && hoveredSlot === slot && (
                              <motion.div
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-lg bg-[#2D2623] px-2.5 py-1 text-[10px] font-bold text-white shadow-xl pointer-events-none"
                              >
                                Slot not available
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2D2623] rotate-45" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* 4. PAYMENT GATEWAY */}
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2D2623] mb-4">4. Secure Payment Method</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { id: "upi", label: "UPI / GPay", icon: Smartphone },
                  { id: "card", label: "Credit/Debit", icon: CreditCard },
                  { id: "cod", label: "Pay on Arrival", icon: Banknote },
                ].map((pay) => {
                  const Icon = pay.icon;
                  return (
                    <button
                      key={pay.id}
                      type="button"
                      onClick={() => setPaymentMethod(pay.id)}
                      className={`rounded-2xl border p-3.5 flex flex-col items-center text-center transition-all cursor-pointer ${
                        paymentMethod === pay.id 
                          ? "border-[#C56E4E] bg-[#FFF6F0] shadow-md ring-2 ring-[#C56E4E]/20 text-[#C56E4E]" 
                          : "border-[#EADBD2] hover:border-[#C56E4E]/50 text-[#8C7A70] bg-white"
                      }`}
                    >
                      <Icon size={20} className="mb-1.5" />
                      <span className="text-[11px] font-bold text-[#2D2623]">{pay.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </motion.div>

          {/* Right Preview Pass & Checkout Panel (5 Cols) */}
          <motion.div variants={fadeUp} className="lg:col-span-5 space-y-6 sticky top-6">
            
            {/* Live Pass Preview Card */}
            <div className="bg-gradient-to-br from-[#2D2623] to-[#433632] rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#C56E4E] rounded-full blur-3xl opacity-30 pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <QrCode size={20} className="text-[#E5A024]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D3C5BF]">VIP Pass Preview</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-[#E5A024]">
                  {type === "SALON" ? "Salon Visit" : "Doorstep"}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#A39292] block mb-0.5">Primary Ritual</span>
                  <h3 className="font-serif text-xl font-bold">{primaryService.name}</h3>
                  {additionalSelectedServices.length > 0 && (
                    <p className="text-[11px] text-[#E5A024] mt-1">+ {additionalSelectedServices.length} add-on ritual(s)</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-[#D3C5BF]">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#A39292] block">Date</span>
                    <strong className="text-white">{date || "Select Date..."}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#A39292] block">Time Slot</span>
                    <strong className="text-white">{time || "Select Time..."}</strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-[#D3C5BF]">Estimated Total:</span>
                  <span className="font-serif text-2xl font-bold text-[#E5A024]">₹{totalCalculatedPrice}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#A39292]">
                <ShieldCheck size={14} className="text-[#E5A024]" /> Guaranteed expert assignment & instant pass generation
              </div>
            </div>

            {/* Error Message & CTA */}
            <div className="bg-white rounded-[2.5rem] border border-[#EADBD2] p-6 shadow-sm">
              {error && (
                <div className="mb-4 rounded-2xl bg-[#FDF2F2] border border-[#F8D7DA] p-3 text-xs font-bold text-[#B33A3A] text-center flex items-center justify-center gap-1.5">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full rounded-full bg-[#C56E4E] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:bg-[#A35539] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Booking Appointment..." : "Proceed to Secure Checkout"} <ArrowRight size={16} />
              </button>

              <p className="mt-4 text-center text-[11px] font-medium text-[#8C7A70]">
                Need help? <Link to="/help" className="text-[#C56E4E] font-bold underline">Visit our support center</Link>
              </p>
            </div>

          </motion.div>

        </form>

      </motion.main>
    </div>
  );
}
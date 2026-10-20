import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Tag, 
  CreditCard, 
  Store, 
  House, 
  CalendarDays, 
  Clock,
  ShieldCheck,
  QrCode,
  MapPin,
  Loader2
} from "lucide-react";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 20 } }
};

export default function Checkout() {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [address, setAddress] = useState("");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState("ONLINE");
  const [message, setMessage] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("beautyvibe_booking_draft") || sessionStorage.getItem("salonpro_booking_draft");
      setBooking(JSON.parse(saved || "null"));
    } catch {
      setBooking(null);
    }
  }, []);

  // Real-time Current Location Detector via Geolocation API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setMessage("📍 Fetching your real-time GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode using OpenStreetMap Nominatim API for a clean human-readable address
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
            setMessage("✨ Successfully detected your current location!");
          } else {
            setAddress(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)} (Current GPS Location)`);
            setMessage("✨ GPS coordinates captured successfully!");
          }
        } catch {
          setAddress(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)} (Current GPS Location)`);
          setMessage("✨ GPS coordinates captured successfully!");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        setMessage("Unable to retrieve your location. Please check location permissions.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  if (!booking) {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#FCF9F6] text-[#2D2623]">
        <h1 className="font-serif text-3xl font-bold mb-3">No booking selected</h1>
        <p className="text-xs text-[#8C7A70] mb-6">Please select a service and schedule your appointment first.</p>
        <Link className="rounded-full bg-[#C56E4E] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg" to="/book-appointment">
          Choose a Service
        </Link>
      </div>
    );
  }

  const total = Math.max(0, booking.price - discount);

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === "WELCOME15" || code === "BEAUTY20") {
      const pct = code === "BEAUTY20" ? 0.20 : 0.15;
      setDiscount(Math.round(booking.price * pct));
      setMessage(`🎉 Coupon "${code}" applied successfully!`);
    } else {
      setDiscount(0);
      setMessage("This coupon code is invalid or expired.");
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (booking.type === "HOME" && !address.trim()) {
      setMessage("Please enter or detect your doorstep / campus address.");
      return;
    }

    const finalOrder = {
      ...booking, 
      address: address || "ICMR Campus, Hyderabad (Salon Visit)", 
      payment, 
      coupon: coupon || "None", 
      discount, 
      total,
      id: `BV-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };

    sessionStorage.setItem("beautyvibe_checkout_draft", JSON.stringify(finalOrder));
    navigate("/booking-confirmation");
  };

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-28 text-[#2D2623]">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8"
      >
        
        {/* Header Intro */}
        <motion.div variants={fadeUp} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF6F0] border border-[#EADBD2] px-4 py-1.5 mb-3 shadow-sm">
            <Sparkles size={14} className="text-[#C56E4E]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70]">Secure Checkout</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2623]">Finalize Appointment</h1>
          <p className="mt-2 text-xs sm:text-sm font-medium text-[#8C7A70]">Review your service details, apply discounts, and generate your VIP pass.</p>
        </motion.div>

        <form onSubmit={submit} className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Details Panel (7 Cols) */}
          <motion.div variants={fadeUp} className="lg:col-span-7 space-y-6">
            
            {/* Appointment Details Card */}
            <div className="bg-white rounded-[2.5rem] border border-[#EADBD2] p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-[#2D2623] mb-4 flex items-center justify-between">
                <span>Appointment Summary</span>
                <QrCode size={20} className="text-[#C56E4E]" />
              </h2>

              <div className="bg-[#FFF6F0] rounded-2xl p-4 border border-[#EADBD2] mb-6">
                <p className="font-serif text-lg font-bold text-[#2D2623]">{booking.serviceName}</p>
                {booking.additionalServices && booking.additionalServices.length > 0 && (
                  <p className="text-xs text-[#C56E4E] font-bold mt-1">+ Add-ons: {booking.additionalServices.join(", ")}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-[#8C7A70]">
                  <span className="flex items-center gap-1"><CalendarDays size={14} className="text-[#C56E4E]" /> {booking.date} · {booking.time}</span>
                  <span className="flex items-center gap-1">
                    {booking.type === "HOME" ? <House size={14} className="text-[#C56E4E]" /> : <Store size={14} className="text-[#C56E4E]" />}
                    {booking.type === "HOME" ? "Doorstep Service" : "At the Salon"}
                  </span>
                </div>
              </div>

              {booking.type === "HOME" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">
                      Service Address / Location
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C56E4E] bg-[#FFF6F0] border border-[#EADBD2] px-3 py-1.5 rounded-full hover:bg-[#C56E4E] hover:text-white transition-all shadow-sm"
                    >
                      {isLocating ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} />}
                      {isLocating ? "Detecting GPS..." : "Detect Current Location"}
                    </button>
                  </div>

                  <textarea 
                    required 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    rows="3" 
                    className="w-full rounded-2xl border border-[#EADBD2] bg-[#FFF6F0] p-4 text-xs font-medium text-[#2D2623] outline-none focus:border-[#C56E4E] focus:bg-white resize-none" 
                    placeholder="Enter complete building number, room, or campus address (or click 'Detect Current Location')" 
                  />
                </div>
              )}
            </div>

            {/* Payment Preference Card */}
            <div className="bg-white rounded-[2.5rem] border border-[#EADBD2] p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-[#2D2623] mb-4">Payment Preference</h2>
              <div className="space-y-3">
                {[
                  ["ONLINE", "Secure Online Payment (UPI / GPay / Card)"],
                  ["PAY_AT_SALON", "Pay on Arrival / After Service"]
                ].map(([val, label]) => (
                  <label 
                    key={val} 
                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      payment === val ? "bg-[#FFF6F0] border-[#C56E4E] text-[#2D2623]" : "bg-[#FCF9F6] border-[#EADBD2] text-[#5C4841]"
                    }`}
                  >
                    <input type="radio" checked={payment === val} onChange={() => setPayment(val)} className="accent-[#C56E4E]" />
                    <span className="text-xs font-bold">{label}</span>
                  </label>
                ))}
              </div>
            </div>

          </motion.div>

          {/* Right Price Summary Card (5 Cols) */}
          <motion.div variants={fadeUp} className="lg:col-span-5 sticky top-6">
            <div className="bg-white rounded-[2.5rem] border border-[#EADBD2] p-6 sm:p-8 shadow-xl">
              <h2 className="font-serif text-xl font-bold text-[#2D2623] mb-6">Price Breakdown</h2>

              <div className="space-y-3 text-xs font-medium text-[#8C7A70] mb-6">
                <div className="flex justify-between"><span>Service Fee:</span> <strong className="font-serif text-sm text-[#2D2623]">₹{booking.price}</strong></div>
                <div className="flex justify-between"><span>Doorstep / Expert Convenience:</span> <strong className="text-[#1E9E4A]">FREE</strong></div>
              </div>

              {/* Coupon Input */}
              <div className="mb-6">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A70] mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1 flex items-center bg-[#FCF9F6] border border-[#EADBD2] rounded-2xl px-3.5 py-2.5">
                    <Tag size={15} className="text-[#8C7A70] mr-2 shrink-0" />
                    <input 
                      value={coupon} 
                      onChange={(e) => setCoupon(e.target.value)} 
                      placeholder="Try WELCOME15 or BEAUTY20" 
                      className="bg-transparent border-none outline-none w-full text-xs font-bold text-[#2D2623] uppercase placeholder:normal-case placeholder:text-[#A39292]" 
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={applyCoupon} 
                    className="rounded-2xl bg-[#C56E4E] px-5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#A35539] transition-all shrink-0"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {discount > 0 && (
                <div className="mb-6 flex justify-between text-xs font-bold text-[#1E9E4A] bg-[#EBF7EE] p-3 rounded-2xl border border-[#D1EED7]">
                  <span>Promo Discount Applied:</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="border-t border-[#EADBD2] pt-4 mb-6 flex justify-between items-center">
                <span className="font-serif text-base font-bold text-[#2D2623]">Total Payable:</span>
                <span className="font-serif text-3xl font-bold text-[#C56E4E]">₹{total}</span>
              </div>

              {message && (
                <div className="mb-6 rounded-2xl bg-[#FFF6F0] border border-[#EADBD2] p-3 text-xs font-bold text-[#C56E4E] text-center">
                  {message}
                </div>
              )}

              <button 
                type="submit"
                className="w-full rounded-full bg-[#C56E4E] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:bg-[#A35539] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Proceed to Generate Pass <ArrowRight size={16} />
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-[#8C7A70]">
                <ShieldCheck size={14} className="text-[#C56E4E]" /> Secure 256-bit encrypted checkout
              </div>

            </div>
          </motion.div>

        </form>

      </motion.main>
    </div>
  );
}
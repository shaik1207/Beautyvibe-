import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Star, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare, 
  X,
  QrCode
} from "lucide-react";

// ==========================================
// MOCK BOOKINGS DATA
// ==========================================
const initialBookings = [
  {
    id: "BV-8492",
    serviceName: "Korean Glow Facial",
    category: "Skincare",
    date: "Tomorrow, Oct 16, 2026",
    time: "11:00 AM",
    price: "899",
    status: "Upcoming",
    address: "ICMR Campus, Hyderabad",
    image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400&q=80"
  },
  {
    id: "BV-7321",
    serviceName: "Deep Nourish Hair Spa",
    category: "Hair Care",
    date: "Oct 10, 2026",
    time: "03:30 PM",
    price: "499",
    status: "Completed",
    address: "ICMR Campus, Hyderabad",
    image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&q=80",
    hasReviewed: false
  },
  {
    id: "BV-5109",
    serviceName: "Full Body Polishing",
    category: "Body Care",
    date: "Sep 28, 2026",
    time: "10:00 AM",
    price: "1,899",
    status: "Completed",
    address: "ICMR Campus, Hyderabad",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80",
    hasReviewed: true
  }
];

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 20 } }
};

export default function MyBookings() {
  const [bookings, setBookings] = useState(initialBookings);
  const [activeTab, setActiveTab] = useState("All");

  // Review Modal States
  const [reviewBooking, setReviewBooking] = useState(null);
  const [selectedEmoji, setSelectedEmoji] = useState("🤩");
  const [reviewText, setReviewText] = useState("");
  const [thankYouPopup, setThankYouPopup] = useState(null);

  const emojis = [
    { symbol: "🤩", label: "Ecstatic" },
    { symbol: "😊", label: "Satisfied" },
    { symbol: "😐", label: "Neutral" },
    { symbol: "😞", label: "Disappointed" }
  ];

  const handleOpenReviewModal = (booking) => {
    setReviewBooking(booking);
    setSelectedEmoji("🤩");
    setReviewText("");
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewBooking) return;

    // Mark booking as reviewed
    setBookings(bookings.map(b => b.id === reviewBooking.id ? { ...b, hasReviewed: true } : b));
    
    const completedBookingId = reviewBooking.id;
    const emojiSymbol = selectedEmoji;

    setReviewBooking(null);
    setThankYouPopup({ id: completedBookingId, emoji: emojiSymbol });
  };

  const filteredBookings = activeTab === "All" 
    ? bookings 
    : bookings.filter(b => b.status === activeTab);

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-28 text-[#2D2623] relative">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-6"
      >
        
        {/* ================= HERO HEADER ================= */}
        <motion.div variants={fadeUp} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF6F0] border border-[#EADBD2] px-4 py-1.5 mb-3 shadow-sm">
              <Sparkles size={14} className="text-[#C56E4E]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70]">Appointment History</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2623]">My Bookings</h1>
          </div>

          {/* Tabs Filter */}
          <div className="flex gap-2 bg-white p-1.5 rounded-full border border-[#EADBD2] shadow-sm w-fit">
            {["All", "Upcoming", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab 
                    ? "bg-[#C56E4E] text-white shadow-md" 
                    : "text-[#8C7A70] hover:text-[#2D2623]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ================= BOOKINGS LIST ================= */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={booking.id} 
                  className="bg-white rounded-[2.5rem] border border-[#EADBD2] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden shrink-0 bg-[#FFF6F0] border border-[#EADBD2]">
                      <img src={booking.image} alt={booking.serviceName} className="h-full w-full object-cover" />
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-bold text-[#C56E4E] uppercase tracking-wider">
                        {booking.category}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold text-[#8C7A70]">ID: {booking.id}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full ${
                          booking.status === "Upcoming" 
                            ? "bg-[#FFF6F0] text-[#C56E4E] border border-[#EADBD2]" 
                            : "bg-[#EBF7EE] text-[#1E9E4A] border border-[#D1EED7]"
                        }`}>
                          {booking.status}
                        </span>
                      </div>

                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D2623] mb-2">{booking.serviceName}</h2>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#8C7A70]">
                        <span className="flex items-center gap-1"><CalendarDays size={14} className="text-[#C56E4E]" /> {booking.date} at {booking.time}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} className="text-[#C56E4E]" /> {booking.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-[#EADBD2]/60 gap-4">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-[#A39292] uppercase tracking-wider block mb-0.5">Total Amount</span>
                      <strong className="font-serif text-2xl font-bold text-[#2D2623]">₹{booking.price}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {booking.status === "Upcoming" ? (
                        <Link 
                          to={`/booking-details/${booking.id}`} 
                          className="flex items-center gap-2 rounded-full bg-[#2D2623] px-6 py-3 text-xs font-bold text-white hover:bg-[#C56E4E] transition-all shadow-md"
                        >
                          View Pass <QrCode size={16} />
                        </Link>
                      ) : (
                        <button 
                          onClick={() => handleOpenReviewModal(booking)}
                          className={`flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold transition-all shadow-md ${
                            booking.hasReviewed 
                              ? "bg-[#FCF9F6] border border-[#EADBD2] text-[#8C7A70] cursor-default" 
                              : "bg-[#C56E4E] text-white hover:bg-[#A35539]"
                          }`}
                        >
                          <Star size={15} className={booking.hasReviewed ? "text-[#E5A024] fill-current" : ""} />
                          {booking.hasReviewed ? "Reviewed ✓" : "Leave Review"}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="py-24 text-center bg-white rounded-[2.5rem] border border-[#EADBD2]"
              >
                <CalendarDays size={40} className="mx-auto text-[#C56E4E] mb-3 opacity-80" />
                <h3 className="font-serif text-xl font-bold text-[#2D2623] mb-1">No {activeTab.toLowerCase()} bookings</h3>
                <p className="text-xs text-[#8C7A70]">You haven't placed any bookings under this category yet.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.main>

      {/* ================= REVIEW & FEEDBACK MODAL ================= */}
      <AnimatePresence>
        {reviewBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewBooking(null)}
              className="fixed inset-0 z-50 bg-[#2D2623]/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 m-auto max-w-md w-full h-fit rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl border border-[#EADBD2]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#EADBD2] mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C56E4E]">Feedback</span>
                  <h3 className="font-serif text-xl font-bold text-[#2D2623]">Rate Your Experience</h3>
                </div>
                <button 
                  onClick={() => setReviewBooking(null)} 
                  className="grid h-9 w-9 place-items-center rounded-full bg-[#FFF6F0] text-[#8C7A70] hover:text-[#C56E4E] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-[#2D2623] mb-1">{reviewBooking.serviceName}</p>
                  <p className="text-[11px] text-[#8C7A70]">How satisfied were you with our expert doorstep service?</p>
                </div>

                {/* Emoji Selector */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A70] mb-3">Select Rating Reaction</label>
                  <div className="grid grid-cols-4 gap-3">
                    {emojis.map((item) => (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => setSelectedEmoji(item.symbol)}
                        className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition-all ${
                          selectedEmoji === item.symbol 
                            ? "bg-[#FFF6F0] border-[#C56E4E] scale-105 shadow-md" 
                            : "bg-[#FCF9F6] border-[#EADBD2] hover:border-[#C56E4E]/50 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <span className="text-2xl mb-1">{item.symbol}</span>
                        <span className="text-[10px] font-bold text-[#5C4841]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Comment */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A70] mb-2">Detailed Comments</label>
                  <textarea 
                    rows="3"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us what you loved about the ritual..."
                    className="w-full rounded-2xl border border-[#EADBD2] bg-[#FFF6F0] p-4 text-xs font-medium text-[#2D2623] outline-none focus:border-[#C56E4E] focus:bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#C56E4E] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#A35539] transition-colors flex items-center justify-center gap-2"
                >
                  <Star size={16} className="fill-current" /> Submit Feedback
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= THANK YOU POPUP WITH EMOJI ================= */}
      <AnimatePresence>
        {thankYouPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setThankYouPopup(null)}
              className="fixed inset-0 z-[100] bg-[#2D2623]/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="fixed inset-0 z-[101] m-auto max-w-sm w-full h-fit rounded-[2.5rem] bg-white p-8 shadow-2xl border border-[#EADBD2] text-center"
            >
              <div className="h-20 w-20 rounded-full bg-[#FFF6F0] border border-[#EADBD2] text-4xl flex items-center justify-center mx-auto mb-5 shadow-md">
                {thankYouPopup.emoji}
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#2D2623] mb-2">Thank You!</h3>
              <p className="text-xs sm:text-sm font-medium text-[#8C7A70] leading-relaxed mb-6">
                Your feedback has been successfully posted. Thank you for helping BeautyVibe maintain our luxury doorstep standards!
              </p>

              <button
                onClick={() => setThankYouPopup(null)}
                className="w-full py-3.5 rounded-full bg-[#C56E4E] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#A35539] transition-colors"
              >
                Close & Return
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
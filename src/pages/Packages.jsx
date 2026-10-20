import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  ArrowRight, 
  Scissors, 
  ShieldCheck, 
  Clock, 
  Plus, 
  Check, 
  Gift,
  Percent
} from "lucide-react";

// ==========================================
// MOCK AVAILABLE BUNDLE SERVICES
// ==========================================
const availableServices = [
  { id: "p1", name: "Korean Glow Facial", category: "Skincare", price: 899, duration: "75 min", image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400&q=80" },
  { id: "p2", name: "Deep Nourish Hair Spa", category: "Hair Spa", price: 499, duration: "60 min", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&q=80" },
  { id: "p3", name: "Full Body Polishing", category: "Body Care", price: 1899, duration: "120 min", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80" },
  { id: "p4", name: "Classic Mani-Pedi", category: "Nails & Hands", price: 499, duration: "45 min", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80" },
  { id: "p5", name: "Aromatherapy Massage", category: "Spa", price: 1299, duration: "90 min", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80" },
  { id: "p6", name: "Painless Rica Waxing", category: "Skincare", price: 699, duration: "45 min", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80" },
];

const availableCoupons = [
  { code: "BEAUTY20", discountPct: 20, label: "20% Off First Booking" },
  { code: "GLOW50", discountPct: 15, label: "15% Custom Bundle Discount" },
  { code: "FESTIVE100", flatOff: 200, label: "₹200 Off on Orders above ₹1,500" }
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

export default function Packages() {
  const [selectedIds, setSelectedIds] = useState(["p1", "p2"]); // Pre-select a couple for a nice initial state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [toast, setToast] = useState(null);

  const toggleService = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedServicesList = availableServices.filter(s => selectedIds.includes(s.id));
  
  const subtotal = selectedServicesList.reduce((acc, curr) => acc + curr.price, 0);
  
  // Bundle discount if 3 or more items selected
  const bundleDiscount = selectedIds.length >= 3 ? Math.round(subtotal * 0.15) : 0;
  
  // Coupon discount calculation
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPct) {
      couponDiscount = Math.round((subtotal - bundleDiscount) * (appliedCoupon.discountPct / 100));
    } else if (appliedCoupon.flatOff && subtotal >= 1500) {
      couponDiscount = appliedCoupon.flatOff;
    }
  }

  const finalTotal = Math.max(0, subtotal - bundleDiscount - couponDiscount);

  const handleApplyCoupon = (coupon) => {
    if (coupon.flatOff && subtotal < 1500) {
      setToast(`Minimum order of ₹1,500 required for ${coupon.code}`);
    } else {
      setAppliedCoupon(coupon);
      setToast(`🎉 Coupon ${coupon.code} applied successfully!`);
    }
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-28 text-[#2D2623] relative">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-6"
      >
        
        {/* ================= HERO BANNER ================= */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2.5rem] bg-[#2D2623] p-8 md:p-14 shadow-xl mb-12 flex items-center min-h-[260px]">
          <div className="absolute inset-0 z-0 opacity-25">
            <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80" alt="Spa Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2D2623] via-[#2D2623]/80 to-transparent" />
          </div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C56E4E] rounded-full blur-[140px] opacity-30 pointer-events-none" />

          <div className="relative z-10 max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 mb-4">
              <Sparkles size={14} className="text-[#E5A024]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F3E8E1]">Custom Bundle Creator</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[4rem] font-bold leading-[1.05] mb-3">
              Tailor Your <span className="text-[#D9A087] italic font-normal">Dream Package</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#D3C5BF] max-w-md">
              Select your favorite skincare, hair spa, and massage rituals. Unlock automatic bundle discounts and apply exclusive promo codes.
            </p>
          </div>
        </motion.div>

        {/* ================= MAIN BUILDER GRID ================= */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Service Selector (8 Cols) */}
          <motion.div variants={fadeUp} className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-[#2D2623]">1. Select Your Rituals</h2>
              <span className="text-xs font-bold text-[#C56E4E] bg-[#FFF6F0] px-3.5 py-1.5 rounded-full border border-[#EADBD2]">
                {selectedIds.length} Selected
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {availableServices.map((service) => {
                const isSelected = selectedIds.includes(service.id);

                return (
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`group relative flex items-center gap-4 rounded-[2rem] p-4 cursor-pointer transition-all duration-300 border bg-white ${
                      isSelected 
                        ? "border-[#C56E4E] shadow-lg ring-2 ring-[#C56E4E]/20 bg-[#FFF6F0]/40" 
                        : "border-[#EADBD2] hover:border-[#C56E4E]/50 shadow-sm"
                    }`}
                  >
                    <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0 bg-[#FFF6F0]">
                      <img src={service.image} alt={service.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#C56E4E]/20 backdrop-blur-[2px] flex items-center justify-center text-white">
                          <Check size={22} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C56E4E] block mb-0.5">{service.category}</span>
                      <h3 className="font-serif text-base font-bold text-[#2D2623] truncate">{service.name}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs font-medium text-[#8C7A70]">
                        <span className="flex items-center gap-1"><Clock size={12} /> {service.duration}</span>
                        <strong className="text-[#2D2623] font-serif text-sm">₹{service.price}</strong>
                      </div>
                    </div>

                    <div className={`h-7 w-7 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                      isSelected ? "bg-[#C56E4E] border-[#C56E4E] text-white" : "border-[#EADBD2] text-transparent"
                    }`}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* RIGHT: Live Price Summary & Coupons (4 Cols) */}
          <motion.div variants={fadeUp} className="lg:col-span-4 sticky top-6">
            <div className="bg-white rounded-[2.5rem] border border-[#EADBD2] p-6 sm:p-8 shadow-xl">
              <h3 className="font-serif text-2xl font-bold text-[#2D2623] mb-6 flex items-center justify-between">
                <span>Package Summary</span>
                <Gift size={22} className="text-[#C56E4E]" />
              </h3>

              {/* Selected List Summary */}
              <div className="max-h-56 overflow-y-auto space-y-3 mb-6 pr-1 scrollbar-hide">
                {selectedServicesList.length > 0 ? (
                  selectedServicesList.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs font-bold text-[#5C4841] bg-[#FCF9F6] p-3 rounded-2xl border border-[#EADBD2]/60">
                      <span className="truncate pr-2">{item.name}</span>
                      <span className="font-serif text-sm text-[#2D2623] shrink-0">₹{item.price}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#8C7A70] text-center py-6 bg-[#FCF9F6] rounded-2xl border border-dashed border-[#EADBD2]">
                    No rituals selected yet. Click any service on the left to start building your package!
                  </p>
                )}
              </div>

              {/* Promo Code Section */}
              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A70] mb-2.5">Available Offers & Coupons</p>
                <div className="space-y-2">
                  {availableCoupons.map((coupon) => (
                    <div 
                      key={coupon.code}
                      onClick={() => handleApplyCoupon(coupon)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        appliedCoupon?.code === coupon.code 
                          ? "bg-[#FFF6F0] border-[#C56E4E] text-[#C56E4E]" 
                          : "bg-[#FCF9F6] border-[#EADBD2] text-[#5C4841] hover:border-[#C56E4E]/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="shrink-0" />
                        <div>
                          <p className="text-xs font-bold">{coupon.code}</p>
                          <p className="text-[10px] text-[#8C7A70]">{coupon.label}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider underline">
                        {appliedCoupon?.code === coupon.code ? "Applied" : "Apply"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2.5 text-xs font-medium text-[#8C7A70] border-t border-[#EADBD2] pt-5 mb-6">
                <div className="flex justify-between"><span>Subtotal ({selectedIds.length} items):</span> <strong className="font-serif text-sm text-[#2D2623]">₹{subtotal}</strong></div>
                
                {bundleDiscount > 0 && (
                  <div className="flex justify-between text-[#1E9E4A]">
                    <span>Bundle Discount (15% Off):</span> 
                    <strong>-₹{bundleDiscount}</strong>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#1E9E4A]">
                    <span>Coupon ({appliedCoupon?.code}):</span> 
                    <strong>-₹{couponDiscount}</strong>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-bold text-[#2D2623] pt-3 border-t border-[#EADBD2]/60">
                  <span>Total Amount:</span>
                  <span className="font-serif text-2xl font-bold text-[#C56E4E]">₹{finalTotal}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                to={selectedIds.length > 0 ? `/checkout?package=${selectedIds.join(",")}&total=${finalTotal}` : "#"}
                onClick={(e) => {
                  if (selectedIds.length === 0) {
                    e.preventDefault();
                    alert("Please select at least one service to book your package.");
                  }
                }}
                className={`w-full py-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all ${
                  selectedIds.length > 0 
                    ? "bg-[#C56E4E] text-white hover:bg-[#A35539] hover:-translate-y-0.5" 
                    : "bg-[#EADBD2] text-[#8C7A70] cursor-not-allowed"
                }`}
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

            </div>
          </motion.div>

        </div>

      </motion.main>

      {/* ================= TOAST NOTIFICATION ================= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-full bg-[#2D2623]/95 px-6 py-3.5 text-white shadow-2xl backdrop-blur-xl border border-white/20 text-xs font-bold"
          >
            <CheckCircle2 size={16} className="text-[#E5A024]" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
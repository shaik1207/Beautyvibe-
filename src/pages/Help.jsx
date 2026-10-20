import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  Sparkles, 
  MessageCircle, 
  PhoneCall, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Tag,
  Scissors
} from "lucide-react";

// ==========================================
// FAQ DATA TAILORED FOR BEAUTYVIBE
// ==========================================
const faqCategories = [
  {
    title: "Bookings & Appointments",
    questions: [
      {
        q: "How do I book a doorstep salon service?",
        a: "You can easily book any service by browsing our Services or Dashboard page, selecting your preferred ritual, and choosing your date and time slot during checkout."
      },
      {
        q: "Can I reschedule or cancel my appointment?",
        a: "Yes! You can view and manage all your active appointments under 'My Bookings'. You can reschedule up to 2 hours before your scheduled time slot free of charge."
      },
      {
        q: "What happens after I receive my QR code / Salon Pass?",
        a: "Your QR pass serves as your appointment verification. When your assigned beauty expert arrives at your doorstep or room, they will scan your QR pass to accept and check-in your order."
      }
    ]
  },
  {
    title: "Packages & Discounts",
    questions: [
      {
        q: "How does the Custom Package Creator work?",
        a: "Our 'Packages' page lets you select multiple rituals (like skincare, hair spa, and massage) or manually type in your own custom service requirements. Selecting 3 or more items automatically unlocks our 15% bundle discount!"
      },
      {
        q: "How do I apply coupon codes?",
        a: "During checkout or on the Packages builder page, you can select or type promotional codes like BEAUTY20 or GLOW50 to instantly deduct discounts from your total amount."
      },
      {
        q: "Do you offer first-time booking discounts?",
        a: "Yes! Use coupon code BEAUTY20 during your first checkout to enjoy an flat 20% discount on your initial booking."
      }
    ]
  },
  {
    title: "Doorstep Safety & Hygiene",
    questions: [
      {
        q: "Are BeautyVibe professionals verified?",
        a: "All our beauty experts undergo rigorous background checks, professional skill verification, and certified hygiene training before taking on home or campus doorstep appointments."
      },
      {
        q: "What hygiene protocols do experts follow?",
        a: "Our experts carry single-use sanitized kits, wear protective masks/gloves upon request, and sterilize all equipment before and after every single service session."
      },
      {
        q: "What products are used during treatments?",
        a: "We exclusively partner with premium, dermatologically tested brands such as SOKORA (Korean Skincare), Rica, and organic botanical oils."
      }
    ]
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

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState("0-0"); // First item open by default

  const toggleAccordion = (catIdx, qIdx) => {
    const key = `${catIdx}-${qIdx}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  // Filter FAQs based on search input
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return faqCategories;
    return faqCategories.map(cat => ({
      ...cat,
      questions: cat.questions.filter(item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.questions.length > 0);
  }, [searchQuery]);

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-28 text-[#2D2623] relative">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-6"
      >
        
        {/* ================= HERO & SEARCH BANNER ================= */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2.5rem] bg-[#2D2623] p-8 md:p-14 shadow-xl mb-12 text-center">
          <div className="absolute inset-0 z-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80" alt="Support Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D2623] via-[#2D2623]/80 to-transparent" />
          </div>
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C56E4E] rounded-full blur-[140px] opacity-30 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 mb-4">
              <Sparkles size={14} className="text-[#E5A024]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F3E8E1]">24/7 Customer Assistance</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[3.5rem] font-bold leading-[1.05] mb-4">
              How Can We <span className="text-[#D9A087] italic font-normal">Help You Today?</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#D3C5BF] mb-8 max-w-md mx-auto">
              Find answers regarding bookings, custom packages, discounts, and doorstep safety protocols.
            </p>

            {/* Search Input */}
            <div className="relative max-w-xl mx-auto flex items-center bg-white/95 backdrop-blur-md rounded-full px-5 py-3.5 shadow-2xl border border-white">
              <Search size={18} className="text-[#8C7A70] mr-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. packages, QR code, cancellation)..."
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-medium text-[#2D2623] placeholder:text-[#A39292]"
              />
            </div>
          </div>
        </motion.div>

        {/* ================= QUICK SUPPORT CARDS ================= */}
        <motion.div variants={fadeUp} className="grid sm:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-[2rem] border border-[#EADBD2] p-6 shadow-sm flex items-center gap-4 hover:border-[#C56E4E]/50 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-[#FFF6F0] text-[#C56E4E] flex items-center justify-center border border-[#EADBD2] shrink-0">
              <PhoneCall size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A70]">Expert Hotline</p>
              <h3 className="font-serif text-base font-bold text-[#2D2623] mt-0.5">+91 (800) 555-GLOW</h3>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-[#EADBD2] p-6 shadow-sm flex items-center gap-4 hover:border-[#C56E4E]/50 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-[#FFF6F0] text-[#C56E4E] flex items-center justify-center border border-[#EADBD2] shrink-0">
              <MessageCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A70]">Live Concierge</p>
              <h3 className="font-serif text-base font-bold text-[#2D2623] mt-0.5">Available 24/7</h3>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-[#EADBD2] p-6 shadow-sm flex items-center gap-4 hover:border-[#C56E4E]/50 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-[#FFF6F0] text-[#C56E4E] flex items-center justify-center border border-[#EADBD2] shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A70]">Email Support</p>
              <h3 className="font-serif text-base font-bold text-[#2D2623] mt-0.5">support@beautyvibe.com</h3>
            </div>
          </div>
        </motion.div>

        {/* ================= FAQ SECTIONS ================= */}
        <motion.div variants={fadeUp} className="space-y-10">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, catIdx) => (
              <div key={category.title} className="bg-white rounded-[2.5rem] border border-[#EADBD2] p-6 sm:p-10 shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-[#2D2623] mb-6 pb-3 border-b border-[#EADBD2]/60 flex items-center gap-2">
                  <HelpCircle size={20} className="text-[#C56E4E]" /> {category.title}
                </h2>

                <div className="space-y-4">
                  {category.questions.map((item, qIdx) => {
                    const isOpen = openIndex === `${catIdx}-${qIdx}`;

                    return (
                      <div 
                        key={item.q}
                        className="rounded-2xl border border-[#EADBD2]/80 bg-[#FCF9F6] overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => toggleAccordion(catIdx, qIdx)}
                          className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-serif text-base sm:text-lg font-bold text-[#2D2623] hover:text-[#C56E4E] transition-colors"
                        >
                          <span>{item.q}</span>
                          <ChevronDown size={18} className={`text-[#8C7A70] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#C56E4E]" : ""}`} />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm font-medium text-[#5C4841] leading-relaxed border-t border-[#EADBD2]/40 pt-3">
                                {item.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white rounded-[2rem] border border-[#EADBD2]">
              <HelpCircle size={40} className="mx-auto text-[#C56E4E] mb-3 opacity-80" />
              <h3 className="font-serif text-xl font-bold text-[#2D2623] mb-1">No matching questions</h3>
              <p className="text-xs text-[#8C7A70]">Try searching for another keyword or reach out directly to our support team.</p>
            </div>
          )}
        </motion.div>

        {/* ================= BOTTOM CTA BANNER ================= */}
        <motion.div variants={fadeUp} className="mt-16 rounded-[2.5rem] bg-gradient-to-r from-[#FFF6F0] to-[#FCF9F6] border border-[#EADBD2] p-8 sm:p-12 text-center flex flex-col items-center shadow-sm">
          <div className="h-14 w-14 rounded-full bg-white text-[#C56E4E] flex items-center justify-center border border-[#EADBD2] shadow-sm mb-4">
            <ShieldCheck size={26} />
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2623] mb-2">Still have questions?</h3>
          <p className="text-xs sm:text-sm text-[#8C7A70] max-w-md mb-6 font-medium">
            Our customer concierge team is always here to assist you with your bookings and personalized package queries.
          </p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-full bg-[#C56E4E] px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-[#A35539] transition-transform hover:-translate-y-0.5"
          >
            Explore Services <ArrowRight size={16} />
          </Link>
        </motion.div>

      </motion.main>
    </div>
  );
}
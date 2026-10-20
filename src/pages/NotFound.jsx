import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Heart } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-[80vh] place-items-center px-5 py-16 bg-[#FCF9F6] font-sans text-[#2D2623] selection:bg-[#C56E4E] selection:text-white relative overflow-hidden">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C56E4E] rounded-full blur-[160px] opacity-10 pointer-events-none" />

      <div className="max-w-lg text-center relative z-10">
        
        {/* Animated Primary Logo Container (Larger & Prominent) */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="mx-auto relative flex h-36 w-36 sm:h-40 sm:w-40 items-center justify-center rounded-[3rem] bg-[#FFF6F0] border border-[#EADBD2] shadow-xl mb-8 overflow-hidden p-4"
        >
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-full h-full flex items-center justify-center"
          >
            <img 
              src="/primary.png" 
              alt="BeautyVibe Logo" 
              className="w-full h-full object-contain drop-shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/secondary.png";
              }}
            />
          </motion.div>

          {/* Floating Sparkles */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 text-[#E5A024]"
          >
            <Sparkles size={24} />
          </motion.div>
        </motion.div>

        {/* Error Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-white border border-[#EADBD2] px-4 py-1.5 mb-4 shadow-sm"
        >
          <Heart size={14} className="text-[#C56E4E]" fill="currentColor" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C7A70]">404 Error • Lost in Style</span>
        </motion.div>

        {/* Main Headings */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-serif text-4xl sm:text-5xl font-bold text-[#2D2623] leading-tight"
        >
          Oops! Wrong turn <br />
          <span className="text-[#C56E4E] italic font-normal">at the vanity.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-4 text-sm sm:text-base font-medium text-[#8C7A70] leading-relaxed max-w-md mx-auto"
        >
          We couldn't find the page you were looking for. Let's get you back to your glowing skincare rituals and relaxing spa experiences.
        </motion.p>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8"
        >
          <Link 
            to="/main" 
            className="inline-flex items-center gap-3 rounded-full bg-[#C56E4E] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#C56E4E]/30 transition-all hover:bg-[#A35539] hover:-translate-y-0.5"
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
        </motion.div>

      </div>
    </main>
  );
}
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  Share2, 
  Gift, 
  Bell, 
  Shield, 
  Smartphone, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Globe, 
  ExternalLink,
  Lock,
  UserCheck
} from "lucide-react";

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

export default function Settings() {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Settings Toggles
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  const websiteUrl = "https://beautyvibe.app/invite?ref=sameer22";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(websiteUrl);
    setCopied(true);
    setToast("📋 Referral link copied to clipboard!");
    setTimeout(() => {
      setCopied(false);
      setToast(null);
    }, 3000);
  };

  const handleShareSocial = (platform) => {
    const text = "Experience luxury doorstep salon & spa rituals with BeautyVibe! Book your first session with 20% off:";
    let url = "";
    if (platform === "whatsapp") {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}${websiteUrl}`)}`;
    } else if (platform === "twitter") {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(websiteUrl)}`;
    } else if (platform === "facebook") {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(websiteUrl)}`;
    }
    window.open(url, "_blank");
  };

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-28 text-[#2D2623] relative">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-6"
      >
        
        {/* ================= HERO BANNER ================= */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2.5rem] bg-[#2D2623] p-8 md:p-14 shadow-xl mb-12 text-center">
          <div className="absolute inset-0 z-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80" alt="Settings Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D2623] via-[#2D2623]/80 to-transparent" />
          </div>
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C56E4E] rounded-full blur-[140px] opacity-30 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 mb-4">
              <Sparkles size={14} className="text-[#E5A024]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F3E8E1]">Account & Sharing</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[3.5rem] font-bold leading-[1.05] mb-3">
              Preferences & <span className="text-[#D9A087] italic font-normal">Referrals</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#D3C5BF] max-w-md mx-auto">
              Manage your app settings, invite friends to BeautyVibe, and earn exclusive glow credits.
            </p>
          </div>
        </motion.div>

        {/* ================= GRID CONTENT ================= */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: SHARE & REFERRAL (7 Cols) */}
          <motion.div variants={fadeUp} className="lg:col-span-7 space-y-8">
            
            {/* Refer a Friend Card */}
            <div className="bg-white rounded-[2.5rem] border border-[#EADBD2] p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#FFF6F0] rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-[#FFF6F0] text-[#C56E4E] flex items-center justify-center border border-[#EADBD2]">
                  <Gift size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C56E4E]">Rewards Program</span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D2623]">Refer a Friend & Earn ₹250</h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm font-medium text-[#8C7A70] leading-relaxed mb-6">
                Share BeautyVibe with your friends. When they book their first luxury doorstep salon ritual, you both receive ₹250 in glowing rewards!
              </p>

              {/* Public URL Box */}
              <div className="flex items-center gap-2 bg-[#FCF9F6] border border-[#EADBD2] rounded-2xl p-2 sm:p-2.5 mb-6">
                <div className="flex items-center gap-2 px-3 py-1 text-xs font-bold text-[#5C4841] truncate flex-1">
                  <Globe size={16} className="text-[#C56E4E] shrink-0" />
                  <span className="truncate">{websiteUrl}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 bg-[#C56E4E] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#A35539] transition-all shrink-0"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy Link"}
                </button>
              </div>

              {/* Social Media Share Buttons */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A70] mb-3">Share Instantly Via</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleShareSocial("whatsapp")}
                    className="py-3 px-4 rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] text-xs font-bold text-[#5C4841] hover:border-[#C56E4E] hover:text-[#C56E4E] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>💬</span> WhatsApp
                  </button>
                  <button
                    onClick={() => handleShareSocial("twitter")}
                    className="py-3 px-4 rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] text-xs font-bold text-[#5C4841] hover:border-[#C56E4E] hover:text-[#C56E4E] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>🐦</span> Twitter
                  </button>
                  <button
                    onClick={() => handleShareSocial("facebook")}
                    className="py-3 px-4 rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] text-xs font-bold text-[#5C4841] hover:border-[#C56E4E] hover:text-[#C56E4E] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>📘</span> Facebook
                  </button>
                </div>
              </div>
            </div>

            {/* Public URL Badge Card */}
            <div className="bg-white rounded-[2.5rem] border border-[#EADBD2] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-[#FFF6F0] text-[#C56E4E] flex items-center justify-center border border-[#EADBD2]">
                  <Share2 size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C56E4E]">Public Profile</span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D2623]">Your Shareable Web Link</h2>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#8C7A70] mb-4">
                Anyone with this public URL can view your shared favourites or send you gift vouchers directly.
              </p>
              <div className="flex items-center justify-between bg-[#FCF9F6] p-4 rounded-2xl border border-[#EADBD2]">
                <span className="text-xs font-bold text-[#2D2623] truncate">https://beautyvibe.app/u/sameer</span>
                <a href="https://beautyvibe.app" target="_blank" rel="noreferrer" className="text-xs font-bold text-[#C56E4E] hover:underline flex items-center gap-1 shrink-0 ml-2">
                  Preview <ExternalLink size={13} />
                </a>
              </div>
            </div>

          </motion.div>

          {/* RIGHT COLUMN: APP PREFERENCES (5 Cols) */}
          <motion.div variants={fadeUp} className="lg:col-span-5 space-y-8">
            
            <div className="bg-white rounded-[2.5rem] border border-[#EADBD2] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[#FFF6F0] text-[#C56E4E] flex items-center justify-center border border-[#EADBD2]">
                  <SettingsIcon size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C56E4E]">Preferences</span>
                  <h2 className="font-serif text-xl font-bold text-[#2D2623]">App Controls</h2>
                </div>
              </div>

              <div className="space-y-6">
                
                {/* Toggle 1: Push Notifications */}
                <div className="flex items-center justify-between pb-4 border-b border-[#EADBD2]/60">
                  <div className="flex items-center gap-3">
                    <Bell size={18} className="text-[#8C7A70]" />
                    <div>
                      <p className="text-xs font-bold text-[#2D2623]">Push Notifications</p>
                      <p className="text-[10px] text-[#8C7A70]">Booking updates & expert arrival alerts</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPushNotifs(!pushNotifs)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${pushNotifs ? "bg-[#C56E4E]" : "bg-[#EADBD2]"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${pushNotifs ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                {/* Toggle 2: Email Alerts */}
                <div className="flex items-center justify-between pb-4 border-b border-[#EADBD2]/60">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-[#8C7A70]" />
                    <div>
                      <p className="text-xs font-bold text-[#2D2623]">Email Invoices</p>
                      <p className="text-[10px] text-[#8C7A70]">Receive digital bills and QR passes</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${emailAlerts ? "bg-[#C56E4E]" : "bg-[#EADBD2]"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emailAlerts ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                {/* Toggle 3: Location Sharing */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone size={18} className="text-[#8C7A70]" />
                    <div>
                      <p className="text-xs font-bold text-[#2D2623]">Live Geolocation</p>
                      <p className="text-[10px] text-[#8C7A70]">Auto-detect campus / home coordinates</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setLocationSharing(!locationSharing)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${locationSharing ? "bg-[#C56E4E]" : "bg-[#EADBD2]"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${locationSharing ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

              </div>
            </div>

            {/* Security Quick Link */}
            <div className="bg-white rounded-[2.5rem] border border-[#EADBD2] p-6 sm:p-8 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#FFF6F0] text-[#C56E4E] flex items-center justify-center border border-[#EADBD2]">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2D2623]">Privacy & Security</p>
                  <p className="text-[10px] text-[#8C7A70]">Manage password & active sessions</p>
                </div>
              </div>
              <Link to="/my-account" className="h-9 w-9 rounded-full bg-[#FFF6F0] flex items-center justify-center text-[#C56E4E] hover:bg-[#C56E4E] hover:text-white transition-colors">
                <ArrowRight size={16} />
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
            <Check size={16} className="text-[#E5A024]" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
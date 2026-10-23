import { useState, useEffect } from "react";
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
  AlertTriangle
} from "lucide-react";

// ==========================================
// REAL SOCIAL MEDIA SVG ICONS
// ==========================================
const WhatsAppIcon = () => (
  <svg className="w-4 h-4 fill-current text-[#25D366]" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4 fill-current text-[#1DA1F2]" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current text-[#1877F2]" viewBox="0 0 24 24">
    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.37 14.5 5 15.5 5H18V0h-3.808C10.59 0 9 1.581 9 4.615V8z"/>
  </svg>
);

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
  
  // Settings Toggles (stored locally to prevent backend 404 errors)
  const [pushNotifs, setPushNotifs] = useState(() => JSON.parse(localStorage.getItem("beautyvibe_push") ?? "true"));
  const [emailAlerts, setEmailAlerts] = useState(() => JSON.parse(localStorage.getItem("beautyvibe_email") ?? "true"));
  const [locationSharing, setLocationSharing] = useState(() => JSON.parse(localStorage.getItem("beautyvibe_loc") ?? "true"));
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState(null); // { key, title, message, nextVal }

  const referralCode = "sameer22";
  const websiteUrl = `https://beautyvibe.app/invite?ref=${referralCode}`;

  const requestToggleChange = (key, title, message, currentValue) => {
    const nextVal = !currentValue;
    setConfirmModal({ key, title, message, nextVal });
  };

  const handleConfirmToggle = () => {
    if (!confirmModal) return;
    const { key, nextVal } = confirmModal;

    if (key === "pushNotifs") {
      setPushNotifs(nextVal);
      localStorage.setItem("beautyvibe_push", JSON.stringify(nextVal));
    }
    if (key === "emailAlerts") {
      setEmailAlerts(nextVal);
      localStorage.setItem("beautyvibe_email", JSON.stringify(nextVal));
    }
    if (key === "locationSharing") {
      setLocationSharing(nextVal);
      localStorage.setItem("beautyvibe_loc", JSON.stringify(nextVal));
    }

    setToast(`✨ ${confirmModal.title} updated successfully!`);
    setConfirmModal(null);
    setTimeout(() => setToast(null), 2500);
  };

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
    } else if (platform === "native" && navigator.share) {
      navigator.share({ title: "BeautyVibe Referral", text: text, url: websiteUrl }).catch(() => {});
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-28 text-[#2D2623] relative">
      
      <motion.main 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="mx-auto max-w-[1240px] px-3 sm:px-6 lg:px-8 pt-6"
      >
        
        {/* ================= HERO BANNER (RESPONSIVE) ================= */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-[#2D2623] p-6 sm:p-10 md:p-14 shadow-xl mb-8 sm:mb-12 text-center">
          <div className="absolute inset-0 z-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80" alt="Settings Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D2623] via-[#2D2623]/80 to-transparent" />
          </div>
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-[#C56E4E] rounded-full blur-[140px] opacity-30 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 mb-3 shadow-lg">
              <Sparkles size={14} className="text-[#E5A024]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F3E8E1]">Account & Sharing</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-[3.5rem] font-bold leading-[1.05] mb-3">
              Preferences & <span className="text-[#D9A087] italic font-normal">Referrals</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#D3C5BF] max-w-md mx-auto">
              Manage your app settings, invite friends to BeautyVibe, and earn exclusive glow credits.
            </p>
          </div>
        </motion.div>

        {/* ================= GRID CONTENT (RESPONSIVE) ================= */}
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* LEFT COLUMN: SHARE & REFERRAL (7 Cols) */}
          <motion.div variants={fadeUp} className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Refer a Friend Card */}
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-[#EADBD2] p-5 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#FFF6F0] rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#FFF6F0] text-[#C56E4E] flex items-center justify-center border border-[#EADBD2] shrink-0">
                  <Gift size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C56E4E]">Rewards Program</span>
                  <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#2D2623]">Refer a Friend & Earn ₹250</h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm font-medium text-[#8C7A70] leading-relaxed mb-6">
                Share BeautyVibe with your friends. When they book their first luxury doorstep salon ritual, you both receive ₹250 in glowing rewards!
              </p>

              {/* Public URL Box */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#FCF9F6] border border-[#EADBD2] rounded-2xl p-2 sm:p-2.5 mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#5C4841] truncate flex-1">
                  <Globe size={16} className="text-[#C56E4E] shrink-0" />
                  <span className="truncate">{websiteUrl}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 bg-[#C56E4E] text-white px-4 py-3 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#A35539] transition-all shrink-0 cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy Link"}
                </button>
              </div>

              {/* Social Media Share Buttons with Real SVG Icons */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A70] mb-3">Share Instantly Via</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <button
                    onClick={() => handleShareSocial("whatsapp")}
                    className="py-3 px-3 rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] text-xs font-bold text-[#5C4841] hover:border-[#C56E4E] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <WhatsAppIcon /> WhatsApp
                  </button>
                  <button
                    onClick={() => handleShareSocial("twitter")}
                    className="py-3 px-3 rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] text-xs font-bold text-[#5C4841] hover:border-[#C56E4E] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <TwitterIcon /> Twitter / X
                  </button>
                  <button
                    onClick={() => handleShareSocial("facebook")}
                    className="py-3 px-3 rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] text-xs font-bold text-[#5C4841] hover:border-[#C56E4E] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <FacebookIcon /> Facebook
                  </button>
                  <button
                    onClick={() => handleShareSocial("native")}
                    className="py-3 px-3 rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] text-xs font-bold text-[#5C4841] hover:border-[#C56E4E] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>🔗</span> More
                  </button>
                </div>
              </div>
            </div>

            {/* Public URL Badge Card */}
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-[#EADBD2] p-5 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#FFF6F0] text-[#C56E4E] flex items-center justify-center border border-[#EADBD2] shrink-0">
                  <Share2 size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C56E4E]">Public Profile</span>
                  <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#2D2623]">Your Shareable Web Link</h2>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#8C7A70] mb-4">
                Anyone with this public URL can view your shared favourites or send you gift vouchers directly.
              </p>
              <div className="flex items-center justify-between bg-[#FCF9F6] p-3.5 sm:p-4 rounded-2xl border border-[#EADBD2] gap-2">
                <span className="text-xs font-bold text-[#2D2623] truncate">https://beautyvibe.app/u/{referralCode}</span>
                <a href={websiteUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#C56E4E] hover:underline flex items-center gap-1 shrink-0 ml-2">
                  Preview <ExternalLink size={13} />
                </a>
              </div>
            </div>

          </motion.div>

          {/* RIGHT COLUMN: APP PREFERENCES (5 Cols) */}
          <motion.div variants={fadeUp} className="lg:col-span-5 space-y-6 sm:space-y-8">
            
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-[#EADBD2] p-5 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#FFF6F0] text-[#C56E4E] flex items-center justify-center border border-[#EADBD2] shrink-0">
                  <SettingsIcon size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C56E4E]">Preferences</span>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2D2623]">App Controls</h2>
                </div>
              </div>

              <div className="space-y-5 sm:space-y-6">
                
                {/* Toggle 1: Push Notifications */}
                <div className="flex items-center justify-between pb-4 border-b border-[#EADBD2]/60 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Bell size={18} className="text-[#8C7A70] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2D2623] truncate">Push Notifications</p>
                      <p className="text-[10px] text-[#8C7A70] truncate">Booking updates & arrival alerts</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => requestToggleChange("pushNotifs", "Push Notifications", "Are you sure you want to toggle push notifications?", pushNotifs)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 cursor-pointer ${pushNotifs ? "bg-[#C56E4E]" : "bg-[#EADBD2]"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${pushNotifs ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                {/* Toggle 2: Email Alerts */}
                <div className="flex items-center justify-between pb-4 border-b border-[#EADBD2]/60 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Shield size={18} className="text-[#8C7A70] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2D2623] truncate">Email Invoices</p>
                      <p className="text-[10px] text-[#8C7A70] truncate">Receive digital bills and passes</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => requestToggleChange("emailAlerts", "Email Invoices", "Are you sure you want to change your email invoice preference?", emailAlerts)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 cursor-pointer ${emailAlerts ? "bg-[#C56E4E]" : "bg-[#EADBD2]"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emailAlerts ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                {/* Toggle 3: Location Sharing */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Smartphone size={18} className="text-[#8C7A70] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2D2623] truncate">Live Geolocation</p>
                      <p className="text-[10px] text-[#8C7A70] truncate">Auto-detect campus coordinates</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => requestToggleChange("locationSharing", "Live Geolocation", "Are you sure you want to update your location sharing preference?", locationSharing)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 cursor-pointer ${locationSharing ? "bg-[#C56E4E]" : "bg-[#EADBD2]"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${locationSharing ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

              </div>
            </div>

            {/* Security Quick Link */}
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-[#EADBD2] p-5 sm:p-8 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-[#FFF6F0] text-[#C56E4E] flex items-center justify-center border border-[#EADBD2] shrink-0">
                  <Lock size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2D2623] truncate">Privacy & Security</p>
                  <p className="text-[10px] text-[#8C7A70] truncate">Manage password & active sessions</p>
                </div>
              </div>
              <Link to="/my-account" className="h-9 w-9 rounded-full bg-[#FFF6F0] flex items-center justify-center text-[#C56E4E] hover:bg-[#C56E4E] hover:text-white transition-colors shrink-0 cursor-pointer">
                <ArrowRight size={16} />
              </Link>
            </div>

          </motion.div>

        </div>

      </motion.main>

      {/* ================= CONFIRMATION MODAL POPUP ================= */}
      <AnimatePresence>
        {confirmModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              className="fixed inset-0 z-50 bg-[#2D2623]/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 m-auto max-w-sm w-[90%] h-fit rounded-[2rem] sm:rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl border border-[#EADBD2] text-center"
            >
              <div className="h-14 w-14 rounded-full bg-[#FFF6F0] border border-[#EADBD2] text-[#C56E4E] flex items-center justify-center mx-auto mb-4 shadow-sm">
                <AlertTriangle size={24} />
              </div>

              <h3 className="font-serif text-xl font-bold text-[#2D2623] mb-2">Confirm Preference Change</h3>
              <p className="text-xs text-[#8C7A70] leading-relaxed mb-6">
                {confirmModal.message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-3 rounded-full bg-[#FCF9F6] border border-[#EADBD2] text-xs font-bold text-[#5C4841] hover:bg-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmToggle}
                  className="flex-1 py-3 rounded-full bg-[#C56E4E] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#A35539] transition-colors cursor-pointer"
                >
                  Yes, Confirm
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  CalendarDays,
  Flower2,
  Heart,
  Gift,
  MessageCircle,
  Settings,
  ChevronRight,
  User as UserIcon,
  LogOut
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

const SafeImage = ({ src, alt, className, style, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || "/primary.png");
  const [hasError, setHasError] = useState(false);

  return (
    <motion.img
      layout
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        if (!hasError) {
          setImgSrc("/secondary.png");
          setHasError(true);
        }
      }}
      {...props}
    />
  );
};

const menuItems = [
  { label: "Home", to: "/main", icon: Home },
  { label: "Appointments", to: "/my-bookings", icon: CalendarDays },
  { label: "Explore Services", to: "/services", icon: Flower2 },
  { label: "Favourites", to: "/favourites", icon: Heart },
  { label: "Packages", to: "/packages", icon: Gift },
  { label: "Help & Support", to: "/help", icon: MessageCircle },
  { label: "Settings", to: "/settings", icon: Settings },
];

function SidebarLink({ item, collapsed, onClick }) {
  const location = useLocation();
  const Icon = item.icon;
  const isActive = location.pathname === item.to;

  return (
    <Link
      to={item.to}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`group relative flex items-center gap-4 rounded-full py-3.5 text-[15px] font-medium transition-all duration-300 ease-out hover:z-10 ${
        isActive
          ? "bg-[#C56E4E] text-white shadow-md shadow-[#C56E4E]/30"
          : "text-[#5C4841] hover:bg-[#F3E8E1] hover:text-[#A35539]"
      } ${collapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "px-5 mx-4"}`}
    >
      <div className="flex w-full items-center gap-4 transition-transform duration-300 group-hover:scale-[1.02]">
        <Icon
          size={20}
          strokeWidth={isActive ? 2.5 : 2}
          className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${
            isActive ? "text-white" : "text-[#5C4841]"
          } ${collapsed ? "mx-auto" : ""}`}
        />

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex-1 truncate overflow-hidden whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!collapsed && item.badge && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[10px] font-bold shadow-sm transition-transform group-hover:scale-110 ${
                isActive ? "bg-white text-[#C56E4E]" : "bg-[#C56E4E] text-white"
              }`}
            >
              {item.badge}
            </motion.span>
          )}
        </AnimatePresence>

        {collapsed && item.badge && (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#C56E4E] ring-2 ring-[#FCF9F6]" />
        )}
      </div>
    </Link>
  );
}

export default function Sidebar() {
  const sidebarContext = useSidebar();
  const mobileOpen = sidebarContext?.mobileOpen || false;
  const setMobileOpen = sidebarContext?.setMobileOpen || (() => {});
  
  // Robust Auth Integration matching AuthContext
  const { currentUser, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const menuRef = useRef(null);

  // Real-time backend & Firebase user info normalization
  const userName = currentUser?.name || currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : "BeautyVibe Member");
  const userEmail = currentUser?.email || "beautyvibe.member@gmail.com";
  
  // Resolve Google/Firebase profile picture or fallback avatar
  const userAvatar = !avatarError 
    ? (currentUser?.avatar || currentUser?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userName)}&backgroundColor=FFF6F0`)
    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileOpen]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const SidebarContent = ({ isMobile }) => (
    <>
      <div className="flex shrink-0 flex-col items-center px-4 pt-10 pb-8 relative w-full">
        <button 
          onClick={() => {
            if (isMobile) {
              setMobileOpen(false);
            } else {
              setCollapsed(!collapsed);
            }
          }}
          className={`group flex flex-col items-center outline-none transition-transform duration-300 w-full ${!isMobile && "cursor-pointer"}`}
          title={collapsed ? "Expand Menu" : "Collapse Menu"}
        >
          <motion.div 
            layout 
            className="relative flex justify-center items-center transition-transform duration-500 group-hover:scale-105"
          >
            <SafeImage 
              src="/primary.png" 
              alt="BeautyVibe Logo" 
              className={`object-contain drop-shadow-sm transition-all duration-500 ease-out ${
                collapsed && !isMobile ? "w-12 h-12" : "w-24 h-24 lg:w-28 lg:h-28"
              }`} 
            />
          </motion.div>
          
          <AnimatePresence mode="wait">
            {(!collapsed || isMobile) && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-center overflow-hidden flex flex-col items-center"
              >
                <motion.h1 layout className="font-serif text-[26px] font-bold leading-tight text-[#2D2623] whitespace-nowrap">
                  BeautyVibe
                </motion.h1>
                <motion.p layout className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C56E4E] mt-1 whitespace-nowrap">
                  Salon & Spa
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto py-2 scrollbar-hide">
        {menuItems.map((item) => (
          <SidebarLink
            key={item.label}
            item={item}
            collapsed={collapsed && !isMobile}
            onClick={() => {
              if (isMobile) setMobileOpen(false);
            }}
          />
        ))}
      </nav>

      {/* BOTTOM PROFILE & LOGOUT POPUP SECTION */}
      <div className="shrink-0 p-4 pb-8 relative overflow-visible" ref={menuRef}>
        {/* Animated Popover Menu */}
        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`absolute bottom-full mb-3 left-4 right-4 rounded-3xl bg-white border border-[#EADBD2] shadow-2xl p-2.5 z-50 ${
                collapsed && !isMobile ? "w-52 left-14" : ""
              }`}
            >
              <div className="px-3 py-2 border-b border-[#EADBD2]/60 mb-1">
                <p className="text-xs font-bold text-[#2D2623] truncate">{userName}</p>
                <p className="text-[10px] text-[#8C7A70] truncate">{userEmail}</p>
              </div>

              <Link
                to="/my-account"
                onClick={() => {
                  setShowUserMenu(false);
                  if (isMobile) setMobileOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-[#5C4841] hover:bg-[#FFF6F0] hover:text-[#C56E4E] rounded-2xl transition-colors"
              >
                <UserIcon size={15} /> My Account
              </Link>

              <button
                onClick={async () => {
                  setShowUserMenu(false);
                  if (isMobile) setMobileOpen(false);
                  if (logout) await logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-colors text-left"
              >
                <LogOut size={15} /> Log Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card Button */}
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`w-full group flex items-center rounded-3xl p-3 transition-all duration-300 hover:bg-[#F3E8E1] border border-transparent hover:border-[#EADBD2] text-left outline-none ${
            collapsed && !isMobile ? "justify-center mx-auto w-14 h-14" : "gap-3 mx-2"
          }`}
        >
          <div className={`shrink-0 rounded-full overflow-hidden shadow-sm border-2 border-white flex items-center justify-center bg-[#FFF6F0] ${
            collapsed && !isMobile ? "w-12 h-12" : "w-11 h-11"
          }`}>
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="User Avatar"
                onError={() => setAvatarError(true)}
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <UserIcon size={20} className="text-[#C56E4E]" />
            )}
          </div>

          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="min-w-0 flex-1 overflow-hidden"
              >
                <p className="truncate text-sm font-bold text-[#2D2623]">
                  {userName}
                </p>
                <p className="truncate mt-0.5 text-[11px] font-semibold text-[#8C7A70] transition-colors group-hover:text-[#C56E4E]">
                  {userEmail}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!collapsed && !isMobile && (
            <ChevronRight 
              size={18} 
              className={`shrink-0 text-[#8C7A70] transition-transform duration-300 ${
                showUserMenu ? "rotate-90 text-[#C56E4E]" : "group-hover:translate-x-1"
              }`} 
            />
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] bg-[#2D2623]/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-[9999] flex w-[280px] flex-col bg-[#FCF9F6] shadow-2xl lg:hidden"
      >
        <SidebarContent isMobile={true} />
      </motion.aside>

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 96 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="sticky top-0 hidden h-screen shrink-0 flex-col bg-[#FCF9F6] lg:flex overflow-hidden z-40 border-r border-[#EADBD2]/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
      >
        <SidebarContent isMobile={false} />
      </motion.aside>
    </>
  );
}
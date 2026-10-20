import { Link } from "react-router-dom";
import { UserRound, CalendarDays, MapPin, Star, LogOut, Heart, SlidersHorizontal, Settings, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const SafeImage = ({ src, alt, className, ...props }) => {
  return <img src={src} alt={alt} className={className} {...props} />;
};

export default function MyAccount() {
  const { user, logout } = useAuth();

  const signOut = async () => {
    await logout();
    window.location.href = "/login";
  };

  const userAvatarUrl = user?.name 
    ? `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=FFF6F0`
    : "https://api.dicebear.com/7.x/notionists/svg?seed=Sameer&backgroundColor=FFF6F0";

  const items = [
    { title: "My Bookings", desc: "View upcoming and past doorstep salon appointments", href: "/my-bookings", icon: CalendarDays },
    { title: "My Favourites", desc: "Access your pinned rituals and saved treatments", href: "/favourites", icon: Heart },
    { title: "Custom Packages", desc: "Review and build your custom self-care bundles", href: "/packages", icon: SlidersHorizontal },
    { title: "Saved Addresses", desc: "Manage home and campus service locations", href: "/home-service", icon: MapPin },
    { title: "App Settings", desc: "Configure referrals, public links, and alerts", href: "/settings", icon: Settings },
    { title: "Reviews & Feedback", desc: "Share feedback about your recent experiences", href: "/my-bookings", icon: Star },
  ];

  return (
    <div className="flex-1 min-w-0 bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white pb-28 text-[#2D2623]">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Intro */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF6F0] border border-[#EADBD2] px-4 py-1.5 mb-3 shadow-sm">
            <Sparkles size={14} className="text-[#C56E4E]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70]">Personal Space</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2623]">My Account</h1>
        </div>

        {/* Profile Card */}
        <section className="flex flex-col items-start gap-6 rounded-[2.5rem] bg-white border border-[#EADBD2] p-6 sm:p-8 shadow-sm sm:flex-row sm:items-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#C56E4E] to-[#E5A024] p-[2px] shadow-md">
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <SafeImage src={userAvatarUrl} alt="User Avatar" className="h-full w-full object-cover" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 ring-4 ring-white" />
          </div>

          <div className="flex-1">
            <h2 className="font-serif text-2xl font-bold text-[#2D2623]">{user?.name || "Shaik Sameer"}</h2>
            <p className="mt-1 text-xs sm:text-sm font-medium text-[#8C7A70]">{user?.email || "sameer@beautyvibe.app"}</p>
            <span className="mt-3 inline-block rounded-full bg-[#FFF6F0] border border-[#EADBD2] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#C56E4E]">
              Verified Customer
            </span>
          </div>

          <button 
            onClick={signOut} 
            className="rounded-full border border-[#EADBD2] bg-[#FCF9F6] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#5C4841] hover:bg-[#C56E4E] hover:text-white transition-all shadow-sm flex items-center gap-2"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </section>

        {/* Dashboard Grid Options */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ title, desc, href, icon: Icon }) => (
            <Link 
              key={title} 
              to={href} 
              className="group rounded-[2rem] border border-[#EADBD2] bg-white p-6 transition-all duration-300 hover:border-[#C56E4E]/60 hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-2xl bg-[#FFF6F0] text-[#C56E4E] flex items-center justify-center border border-[#EADBD2] mb-4 group-hover:scale-105 transition-transform">
                  <Icon size={22} />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2D2623] group-hover:text-[#C56E4E] transition-colors">{title}</h3>
                <p className="mt-2 text-xs sm:text-sm font-medium text-[#8C7A70] leading-relaxed">{desc}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#C56E4E]">
                Open <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-[11px] font-medium text-[#8C7A70]">
          Account settings and session data sync securely across your BeautyVibe profile.
        </p>

      </main>
    </div>
  );
}
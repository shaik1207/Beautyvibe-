import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import API from "../services/axios";
import { useAuth } from "../context/AuthContext";
import { Mail, LockKeyhole, Eye, EyeOff, LoaderCircle, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function UserLogin() {
  const navigate = useNavigate();
  const { verifySession } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/api/auth/login", { email, password });
      const token = res.data?.token || res.data?.data?.token;

      if (!token) throw new Error("Token missing from server response.");

      localStorage.setItem("beautyvibe_user_token", token);
      await verifySession();
      navigate("/main", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to sign in. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken(true);

      const res = await API.post("/api/auth/google", {
        name: user.displayName,
        email: user.email,
        idToken,
      });

      const token = res.data?.token || res.data?.data?.token;
      if (!token) throw new Error("Google authentication token missing.");

      localStorage.setItem("beautyvibe_user_token", token);
      await verifySession();
      navigate("/main", { replace: true });
    } catch (err) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-[#FCF9F6] font-sans selection:bg-[#C56E4E] selection:text-white">
      {/* Left Column - Form */}
      <div className="flex w-full flex-col justify-center px-6 lg:w-1/2 xl:px-24 py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full max-w-md"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-10 text-center lg:text-left">
            <div className="mb-6 flex items-center justify-center gap-3 lg:justify-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF6F0] text-[#C56E4E] shadow-sm border border-[#EADBD2]">
                <Sparkles size={24} strokeWidth={1.5} />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#2D2623]">
                BeautyVibe
              </span>
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-[#2D2623]">
              Welcome back
            </h1>
            <p className="mt-3 text-sm text-[#8C7A70] font-medium">
              Enter your details to access your appointments, favorites, and premium packages.
            </p>
          </motion.div>

          {/* Google Login */}
          <motion.div variants={itemVariants}>
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-[#EADBD2] bg-white py-3.5 text-xs font-bold text-[#2D2623] shadow-sm transition-all hover:border-[#C56E4E] hover:bg-[#FFF6F0] hover:text-[#C56E4E] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
            >
              {googleLoading ? (
                <LoaderCircle size={18} className="animate-spin text-[#C56E4E]" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-4 w-4" />
              )}
              {googleLoading ? "Connecting to Google..." : "Continue with Google"}
            </motion.button>
          </motion.div>

          {/* Divider */}
          <motion.div variants={itemVariants} className="my-8 flex items-center gap-4">
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#EADBD2]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70]">Or continue with</span>
            <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#EADBD2]" />
          </motion.div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#5C4841]">
                Email Address
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A70] transition-colors group-focus-within:text-[#C56E4E]">
                  <Mail size={18} />
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full rounded-2xl border border-[#EADBD2] bg-white py-3.5 pl-12 pr-4 text-sm text-[#2D2623] font-medium shadow-sm outline-none transition-all placeholder:text-[#8C7A70]/50 focus:border-[#C56E4E] focus:ring-4 focus:ring-[#C56E4E]/10"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#5C4841]">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#C56E4E] hover:text-[#A35539] hover:underline underline-offset-4 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A70] transition-colors group-focus-within:text-[#C56E4E]">
                  <LockKeyhole size={18} />
                </span>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-[#EADBD2] bg-white py-3.5 pl-12 pr-12 text-sm text-[#2D2623] font-medium shadow-sm outline-none transition-all placeholder:text-[#8C7A70]/50 focus:border-[#C56E4E] focus:ring-4 focus:ring-[#C56E4E]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C7A70] transition-colors hover:text-[#C56E4E] focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {/* Error Message Animation */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3.5 text-xs font-bold text-red-600 border border-red-100 mt-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading || googleLoading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-full bg-[#C56E4E] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#C56E4E]/30 transition-all hover:bg-[#A35539] hover:shadow-[#C56E4E]/40 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.p variants={itemVariants} className="mt-8 text-center text-xs font-medium text-[#8C7A70]">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-[#C56E4E] hover:text-[#A35539] hover:underline underline-offset-4 transition-all">
              Create an account
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Right Column - Premium Aesthetic Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-[#EADBD2] p-4 pl-0">
        <motion.div 
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          {/* Matches the hero images used in main.jsx */}
          <img
            src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80"
            alt="Luxury Salon Interior"
            className="h-full w-full object-cover"
          />
          {/* Subtle gradient overlay to make text readable but keep the warm vibe */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D2623]/90 via-[#2D2623]/30 to-transparent mix-blend-multiply" />
          
          <div className="absolute bottom-14 left-14 right-14 text-white">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex items-center gap-2 mb-4"
            >
               <span className="h-px w-10 bg-[#C56E4E]" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFF6F0]">Your Moment of Glow</span>
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-serif text-5xl font-bold leading-tight text-white mb-4"
            >
              Elevate your <br />
              <span className="text-[#C56E4E] italic font-normal">beauty routine.</span>
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-sm text-white/80 font-medium leading-relaxed max-w-sm"
            >
              Book appointments, track your favorites, and manage your personalized spa experiences seamlessly.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
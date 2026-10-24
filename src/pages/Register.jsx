import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import { auth } from "../firebase";
import API from "../services/axios";
import { useAuth } from "../context/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const inputWrapperClass =
  "relative flex items-center overflow-hidden rounded-2xl border border-[#EADBD2] bg-white transition-all duration-300 focus-within:border-[#C56E4E] focus-within:ring-4 focus-within:ring-[#C56E4E]/10";

function getFirebaseErrorMessage(error) {
  if (error?.response) {
    return error.response.data?.message || "Server rejected registration.";
  }
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Your password is too weak. Please choose a stronger password.";

    case "auth/network-request-failed":
      return "Network error. Check your internet connection and try again.";

    case "auth/operation-not-allowed":
      return "Email registration is disabled in Firebase Console.";

    case "auth/too-many-requests":
      return "Too many attempts. Please wait a while and try again.";

    default:
      return error?.message || "We couldn't create your account. Please try again.";
  }
}

export default function Register() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { verifySession } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });

  const phoneDigits = form.phone.replace(/\D/g, "");

  const passwordRules = [
    {
      label: "At least 8 characters",
      valid: form.password.length >= 8,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(form.password),
    },
    {
      label: "One number",
      valid: /\d/.test(form.password),
    },
  ];

  const passwordScore = passwordRules.filter((rule) => rule.valid).length;

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "phone"
          ? value.replace(/[^\d\s()-]/g, "")
          : type === "checkbox"
            ? checked
            : value,
    }));

    if (error) setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      setError("Please enter your full name.");
      return;
    }

    if (name.length < 2) {
      setError("Your name must contain at least 2 characters.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (form.phone.trim() && phoneDigits.length !== 10) {
      setError("Enter a valid 10-digit mobile number, or leave it blank.");
      return;
    }

    if (passwordRules.some((rule) => !rule.valid)) {
      setError("Use at least 8 characters, one uppercase letter, and one number.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (!form.acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Firebase Authentication account
      const credential = await createUserWithEmailAndPassword(auth, email, form.password);
      await updateProfile(credential.user, { displayName: name });

      // 2. Retrieve secure Firebase ID Token
      const idToken = await credential.user.getIdToken(true);

      // 3. Synchronize with backend database & receive backend JWT token
      const res = await API.post("/api/auth/register", {
        name,
        email,
        phone: form.phone.trim() ? `+91 ${form.phone.trim()}` : "+91 98765 43210",
        idToken,
      });

      const responseData = res.data?.data || res.data;
      const token = responseData?.token || res.data?.token;

      if (!token) {
        throw new Error("Authentication token missing from server response.");
      }

      // 4. Save token under all recognized keys to prevent 401 mismatch
      localStorage.setItem("beautyvibe_user_token", token);
      localStorage.setItem("token", token);

      // 5. Verify session and redirect to main dashboard
      await verifySession();
      navigate("/main", { replace: true });
    } catch (err) {
      console.error("Registration failed:", err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const motionProps = prefersReducedMotion ? {} : { variants: fadeUp };

  return (
    <main className="flex min-h-screen w-full bg-[#FCF9F6] selection:bg-[#C56E4E] selection:text-white">
      {/* LEFT: PREMIUM BEAUTY VISUAL */}
      <section className="relative hidden min-h-screen w-1/2 max-w-[800px] flex-col justify-between overflow-hidden bg-[#2D2623] p-12 lg:flex xl:p-16">
        <motion.img
          src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1400&q=80"
          alt="Premium beauty and salon experience"
          initial={false}
          animate={prefersReducedMotion ? {} : { scale: [1, 1.045, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-[#2D2623]/95 via-[#2D2623]/65 to-[#C56E4E]/30" />

        {!prefersReducedMotion && (
          <>
            <motion.div
              animate={{ x: [0, 35, 0], y: [0, -25, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-[#C56E4E]/20 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-0 h-64 w-64 rounded-full bg-[#FFD0B8]/10 blur-3xl"
            />
          </>
        )}

        <Link to="/" className="relative z-10 flex w-fit items-center gap-4 text-white transition-opacity hover:opacity-90">
          <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md overflow-hidden p-2">
            <img src="/primary.png" alt="BeautyVibe Logo" className="h-full w-full object-contain" />
          </span>
          <span>
            <strong className="block font-serif text-4xl leading-none tracking-tight">BeautyVibe</strong>
            <small className="mt-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-[#FFD0B8]">Salon & Spa</small>
          </span>
        </Link>

        <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 mb-8 max-w-lg">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
            <Sparkles size={14} className="text-[#FFD0B8]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Your Beauty Journey Begins</span>
          </div>
          <h1 className="font-serif text-5xl font-medium leading-[1.08] text-white xl:text-[4rem]">
            Make time for the <span className="italic text-[#FFD0B8]">best version of you.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/80">
            Your personal beauty experience, thoughtfully designed around you. Discover services, manage appointments, and enjoy self-care on your terms.
          </p>

          <div className="mt-9 space-y-4">
            {[
              "Book your favourite beauty services",
              "Manage your appointments in one place",
              "Enjoy personalised beauty care",
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={prefersReducedMotion ? false : { opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.35 + index * 0.12 }}
                className="flex items-center gap-4 text-sm font-medium text-white"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#C56E4E] shadow-lg shadow-[#C56E4E]/20">
                  <Check size={15} strokeWidth={3} />
                </span>
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-white/60">
          <ShieldCheck size={15} /> A more personal way to experience beauty.
        </div>
      </section>

      {/* RIGHT: REGISTRATION FORM */}
      <section className="relative flex min-h-screen flex-1 flex-col justify-center overflow-y-auto px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(197,110,78,0.09),transparent_40%)]" />

        <div className="relative z-10 mx-auto w-full max-w-[440px]">
          <Link to="/" className="mb-10 flex w-fit items-center gap-3 lg:hidden">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#C56E4E] text-white shadow-lg shadow-[#C56E4E]/20 overflow-hidden p-2">
              <img src="/primary.png" alt="BeautyVibe Logo" className="h-full w-full object-contain" />
            </span>
            <span className="font-serif text-3xl font-bold text-[#2D2623]">BeautyVibe</span>
          </Link>

          <motion.div variants={staggerContainer} initial="hidden" animate="show">
            <motion.div {...motionProps}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C56E4E]">Welcome to BeautyVibe</p>
              <h2 className="mb-4 font-serif text-4xl font-bold leading-tight text-[#2D2623] sm:text-[2.75rem]">Create your account.</h2>
              <p className="mb-8 text-sm leading-relaxed text-[#8C7A70]">A beautiful experience starts with a few simple details.</p>
            </motion.div>

            <motion.form variants={fadeUp} onSubmit={submit} className="space-y-5" noValidate>
              {/* FULL NAME */}
              <div>
                <label htmlFor="register-name" className="mb-2 ml-1 block text-xs font-bold text-[#5C4841]">Full Name</label>
                <div className={inputWrapperClass}>
                  <span className="pl-5 pr-2 text-[#C56E4E]"><UserRound size={18} /></span>
                  <input
                    id="register-name"
                    required
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={updateField}
                    placeholder="Your full name"
                    className="w-full bg-transparent py-4 pr-5 text-sm font-semibold text-[#2D2623] outline-none placeholder:font-medium placeholder:text-[#8C7A70]"
                  />
                </div>
              </div>

              {/* MOBILE NUMBER */}
              <div>
                <label htmlFor="register-phone" className="mb-2 ml-1 block text-xs font-bold text-[#5C4841]">
                  Mobile Number <span className="font-medium text-[#A39389]">(Optional)</span>
                </label>
                <div className={inputWrapperClass}>
                  <span className="flex items-center gap-2 border-r border-[#EADBD2] bg-[#FCF9F6] px-4 py-4 text-[#C56E4E]">
                    <Phone size={16} />
                    <span className="text-sm font-bold text-[#2D2623]">+91</span>
                  </span>
                  <input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={form.phone}
                    onChange={updateField}
                    maxLength={14}
                    placeholder="10-digit number"
                    className="w-full bg-transparent px-4 py-4 text-sm font-semibold text-[#2D2623] outline-none placeholder:font-medium placeholder:text-[#8C7A70]"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label htmlFor="register-email" className="mb-2 ml-1 block text-xs font-bold text-[#5C4841]">Email Address</label>
                <div className={inputWrapperClass}>
                  <span className="pl-5 pr-2 text-[#C56E4E]"><Mail size={18} /></span>
                  <input
                    id="register-email"
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="you@example.com"
                    className="w-full bg-transparent py-4 pr-5 text-sm font-semibold text-[#2D2623] outline-none placeholder:font-medium placeholder:text-[#8C7A70]"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label htmlFor="register-password" className="mb-2 ml-1 block text-xs font-bold text-[#5C4841]">Create Password</label>
                <div className={inputWrapperClass}>
                  <span className="pl-5 pr-2 text-[#C56E4E]"><LockKeyhole size={18} /></span>
                  <input
                    id="register-password"
                    required
                    minLength={8}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={updateField}
                    placeholder="Create a secure password"
                    className="w-full bg-transparent py-4 pr-12 text-sm font-semibold text-[#2D2623] outline-none placeholder:font-medium placeholder:text-[#8C7A70]"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C7A70] transition-colors hover:text-[#C56E4E]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <AnimatePresence>
                  {form.password && (
                    <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 rounded-2xl border border-[#EADBD2] bg-[#FFF6F0] p-4">
                      <div className="flex gap-2">
                        {[1, 2, 3].map((level) => (
                          <span
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              passwordScore >= level
                                ? passwordScore === 1
                                  ? "bg-red-400"
                                  : passwordScore === 2
                                    ? "bg-amber-400"
                                    : "bg-emerald-500"
                                : "bg-[#EADBD2]"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {passwordRules.map((rule) => (
                          <p key={rule.label} className={`flex items-center gap-1 text-[10px] font-semibold ${rule.valid ? "text-emerald-600" : "text-[#8C7A70]"}`}>
                            <Check size={13} /> {rule.label}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label htmlFor="register-confirm-password" className="mb-2 ml-1 block text-xs font-bold text-[#5C4841]">Confirm Password</label>
                <div className={inputWrapperClass}>
                  <span className="pl-5 pr-2 text-[#C56E4E]"><LockKeyhole size={18} /></span>
                  <input
                    id="register-confirm-password"
                    required
                    minLength={8}
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={updateField}
                    placeholder="Re-enter your password"
                    className="w-full bg-transparent py-4 pr-12 text-sm font-semibold text-[#2D2623] outline-none placeholder:font-medium placeholder:text-[#8C7A70]"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C7A70] transition-colors hover:text-[#C56E4E]"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* TERMS */}
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#EADBD2] bg-white/70 p-4 text-xs leading-relaxed text-[#5C4841] transition-colors hover:border-[#C56E4E]/50">
                <input
                  required
                  name="acceptedTerms"
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={updateField}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#C56E4E]"
                />
                <span>
                  I agree to BeautyVibe's{" "}
                  <Link to="/terms" className="font-bold text-[#C56E4E] hover:underline">Terms of Service</Link>{" "}
                  and{" "}
                  <Link to="/privacy-policy" className="font-bold text-[#C56E4E] hover:underline">Privacy Policy</Link>.
                </span>
              </label>

              {/* ERROR MESSAGE */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold leading-relaxed text-red-600">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-3 flex w-full items-center justify-center gap-3 rounded-full bg-[#2D2623] py-4 text-sm font-bold text-white shadow-xl shadow-[#2D2623]/20 transition-all duration-300 hover:scale-[1.01] hover:bg-[#1A1513] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" /> Creating your account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </motion.form>

            {/* SIGN IN LINK */}
            <motion.p variants={fadeUp} className="mt-8 text-center text-xs font-semibold text-[#8C7A70]">
              Already have a BeautyVibe account?{" "}
              <Link to="/login" className="font-bold text-[#C56E4E] transition-colors hover:text-[#A35539]">Sign in</Link>
            </motion.p>

            <motion.p variants={fadeUp} className="mt-7 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-[#8C7A70]">
              <ShieldCheck size={15} className="text-[#C56E4E]" /> Your account is protected by Firebase Authentication.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  motion,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Scissors,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { auth, googleProvider } from "../firebase";

// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

function getAuthErrorMessage(error) {
  switch (error?.code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password. Please try again.";

    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";

    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using another sign-in method.";

    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase Console.";

    case "auth/unauthorized-domain":
      return "This website domain is not authorized in Firebase Authentication.";

    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completing.";

    case "auth/popup-blocked":
      return "Popup was blocked by your browser. Please allow popups for this site.";

    default:
      return "Unable to sign in. Please try again.";
  }
}

// --------------------------------------------------
// INPUT STYLES
// --------------------------------------------------

const inputWrapperClass =
  "relative flex items-center overflow-hidden rounded-2xl border border-[#EADBD2] bg-white transition-all duration-300 focus-within:border-[#C56E4E] focus-within:ring-4 focus-within:ring-[#C56E4E]/10";

// --------------------------------------------------
// LOGIN COMPONENT
// --------------------------------------------------

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const prefersReducedMotion = useReducedMotion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // REDIRECT DESTINATION
  // --------------------------------------------------

  const getRedirectPath = () => {
    const requestedPath = location.state?.from?.pathname;

    if (
      requestedPath &&
      requestedPath.startsWith("/") &&
      !["/login", "/register"].includes(requestedPath)
    ) {
      return requestedPath;
    }

    return "/main";
  };

  // --------------------------------------------------
  // EMAIL AND PASSWORD LOGIN
  // --------------------------------------------------

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);

      navigate(getRedirectPath(), {
        replace: true,
      });
    } catch (err) {
      console.error("Email login failed:", err);
      setError(getAuthErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // GOOGLE LOGIN USING POPUP (Permanent Fix)
  // --------------------------------------------------

  const handleGoogleLogin = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      // Popup handles authentication securely in-place without refreshing or losing state
      await signInWithPopup(auth, googleProvider);

      navigate(getRedirectPath(), {
        replace: true,
      });
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setError(getAuthErrorMessage(err));
      setIsGoogleLoading(false);
    }
  };

  // --------------------------------------------------
  // FORGOT PASSWORD
  // --------------------------------------------------

  const handleForgotPassword = async () => {
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Enter your email address first to reset your password.");
      return;
    }

    setIsResetting(true);

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      window.alert(
        "If an account exists for this email, a password reset email will be sent."
      );
    } catch (err) {
      console.error("Password reset failed:", err);
      setError(getAuthErrorMessage(err));
    } finally {
      setIsResetting(false);
    }
  };

  // --------------------------------------------------
  // ANIMATION SETTINGS
  // --------------------------------------------------

  const heroAnimation = prefersReducedMotion
    ? {}
    : {
        scale: [1, 1.035, 1],
      };

  const floatingAnimation = prefersReducedMotion
    ? {}
    : {
        x: [0, 25, 0],
        y: [0, -20, 0],
      };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <main className="flex min-h-screen w-full bg-[#FCF9F6] selection:bg-[#C56E4E] selection:text-white">
      {/* LEFT SIDE: BEAUTY IMAGE AND BRANDING */}
      <section className="relative hidden min-h-screen w-1/2 max-w-[800px] flex-col justify-between overflow-hidden bg-[#2D2623] p-12 lg:flex xl:p-16">
        <motion.img
          src="/beautyvibe-login.png"
          alt="BeautyVibe luxury beauty salon experience"
          initial={false}
          animate={heroAnimation}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-[#2D2623]/85 via-[#2D2623]/55 to-[#C56E4E]/45" />

        {!prefersReducedMotion && (
          <>
            <motion.div
              animate={floatingAnimation}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-[#C56E4E]/25 blur-3xl"
            />

            <motion.div
              animate={{
                x: [0, -20, 0],
                y: [0, 25, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-1/4 right-0 h-64 w-64 rounded-full bg-[#FFD0B8]/15 blur-3xl"
            />
          </>
        )}

        <Link
          to="/"
          className="relative z-10 flex w-fit items-center gap-4 text-white transition-opacity hover:opacity-90"
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
            <Scissors size={26} />
          </span>

          <span>
            <strong className="block font-serif text-4xl leading-none tracking-tight">
              BeautyVibe
            </strong>

            <small className="mt-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-[#FFD0B8]">
              Salon & Spa
            </small>
          </span>
        </Link>

        <motion.div
          initial={
            prefersReducedMotion
              ? false
              : {
                  opacity: 0,
                  y: 25,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="relative z-10 mb-8 max-w-lg"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
            <Sparkles size={14} className="text-[#FFD0B8]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">
              Your Beauty Journey
            </span>
          </div>

          <h1 className="font-serif text-5xl font-medium leading-[1.08] text-white xl:text-[4rem]">
            Your beauty.
            <br />
            <span className="italic text-[#FFD0B8]">
              Your confidence.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-white/80">
            Welcome back to your personal beauty destination.
            Discover your favourite services and enjoy self-care
            designed around you.
          </p>

          <div className="mt-9 space-y-4">
            {[
              "Premium beauty services",
              "Easy appointment management",
              "Personalised salon experiences",
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={
                  prefersReducedMotion
                    ? false
                    : {
                        opacity: 0,
                        x: -15,
                      }
                }
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: prefersReducedMotion
                    ? 0
                    : 0.3 + index * 0.12,
                }}
                className="flex items-center gap-4 text-sm font-medium text-white"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#C56E4E] text-white shadow-lg">
                  <Sparkles size={14} />
                </span>

                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-white/70">
          <ShieldCheck size={15} />
          A more personal way to experience beauty.
        </div>
      </section>

      {/* RIGHT SIDE: LOGIN FORM */}
      <section className="relative flex min-h-screen flex-1 flex-col justify-center overflow-y-auto px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(197,110,78,0.09),transparent_40%)]" />

        <div className="relative z-10 mx-auto w-full max-w-[440px]">
          <Link
            to="/"
            className="mb-10 flex w-fit items-center gap-3 lg:hidden"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#C56E4E] text-white shadow-lg">
              <Scissors size={22} />
            </span>

            <span className="font-serif text-3xl font-bold text-[#2D2623]">
              BeautyVibe
            </span>
          </Link>

          <motion.div
            initial={
              prefersReducedMotion
                ? false
                : {
                    opacity: 0,
                    y: 18,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C56E4E]">
              Welcome Back
            </p>

            <h2 className="mb-4 font-serif text-4xl font-bold leading-tight text-[#2D2623] sm:text-[2.75rem]">
              Sign in to BeautyVibe.
            </h2>

            <p className="mb-8 text-sm leading-relaxed text-[#8C7A70]">
              Your next beauty experience is just a few clicks away.
            </p>

            {/* GOOGLE LOGIN BUTTON */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-[#EADBD2] bg-white py-4 text-sm font-bold text-[#2D2623] transition-all duration-300 hover:border-[#C56E4E] hover:bg-[#FFF9F5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="h-5 w-5"
                />
              )}

              {isGoogleLoading
                ? "Connecting to Google..."
                : "Continue with Google"}
            </button>

            <div className="my-7 flex items-center gap-4">
              <span className="h-px flex-1 bg-[#EADBD2]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#A39389]">
                Or continue with email
              </span>
              <span className="h-px flex-1 bg-[#EADBD2]" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 ml-1 block text-xs font-bold text-[#5C4841]"
                >
                  Email Address
                </label>

                <div className={inputWrapperClass}>
                  <span className="pl-5 pr-2 text-[#C56E4E]">
                    <Mail size={18} />
                  </span>

                  <input
                    id="login-email"
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    className="w-full bg-transparent py-4 pr-5 text-sm font-semibold text-[#2D2623] outline-none placeholder:font-medium placeholder:text-[#8C7A70]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 ml-1 flex items-center justify-between gap-3">
                  <label
                    htmlFor="login-password"
                    className="text-xs font-bold text-[#5C4841]"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isResetting}
                    className="text-xs font-bold text-[#C56E4E] transition-colors hover:text-[#A35539] disabled:opacity-60"
                  >
                    {isResetting ? "Sending..." : "Forgot password?"}
                  </button>
                </div>

                <div className={inputWrapperClass}>
                  <span className="pl-5 pr-2 text-[#C56E4E]">
                    <LockKeyhole size={18} />
                  </span>

                  <input
                    id="login-password"
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    className="w-full bg-transparent py-4 pr-12 text-sm font-semibold text-[#2D2623] outline-none placeholder:font-medium placeholder:text-[#8C7A70]"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C7A70] transition-colors hover:text-[#C56E4E]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={
                      prefersReducedMotion
                        ? false
                        : {
                            opacity: 0,
                            y: -5,
                          }
                    }
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold leading-relaxed text-red-600"
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isSubmitting || isGoogleLoading}
                className="group mt-3 flex w-full items-center justify-center gap-3 rounded-full bg-[#2D2623] py-4 text-sm font-bold text-white shadow-xl shadow-[#2D2623]/20 transition-all duration-300 hover:scale-[1.01] hover:bg-[#1A1513] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs font-semibold text-[#8C7A70]">
              Don't have a BeautyVibe account?{" "}
              <Link
                to="/register"
                className="font-bold text-[#C56E4E] transition-colors hover:text-[#A35539]"
              >
                Create account
              </Link>
            </p>

            <p className="mt-7 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-[#8C7A70]">
              <ShieldCheck size={15} className="text-[#C56E4E]" />
              Secure authentication powered by Firebase.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
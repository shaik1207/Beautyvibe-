import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  CalendarDays,
  Clock,
  House,
  AlertCircle,
  RefreshCw,
  MapPin,
  Layers,
  User,
  Phone,
  Mail,
} from "lucide-react";

import API from "../services/axios";

// ======================================================
// CONFIGURATION
// ======================================================

const DRAFT_KEY = "beautyvibe_booking_draft";
const REQUEST_KEY = "beautyvibe_booking_request_id";
const CONFIRMED_KEY = "beautyvibe_last_confirmed";

const DEFAULT_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=85";

// ======================================================
// ANIMATIONS
// ======================================================

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 20,
    },
  },
};

// ======================================================
// HELPERS & SANITIZATION
// ======================================================

const cleanDraftString = (val) => {
  if (val === undefined || val === null) return "";
  const str = String(val).trim();
  if (!str || /^(undefined|null|n\/a|na|undefined undefined|null null|sonic solutions)$/i.test(str)) {
    return "";
  }
  return str;
};

// Safely pull real logged-in user profile from local/session storage
const getActiveUserProfile = () => {
  try {
    const rawUser =
      localStorage.getItem("user") ||
      localStorage.getItem("userInfo") ||
      sessionStorage.getItem("user");

    if (rawUser) {
      const u = JSON.parse(rawUser);
      const name = cleanDraftString(
        u.name || `${u.firstName || ""} ${u.lastName || ""}`
      );
      const phone = cleanDraftString(
        u.phone || u.mobile || u.mobileNumber || u.contact
      );
      const email = cleanDraftString(u.email);

      return { name, phone, email };
    }
  } catch (err) {
    console.error("[BeautyVibe] Profile extraction error:", err);
  }
  return { name: "", phone: "", email: "" };
};

// Extract and normalize all services from draft (supports single or multiple items)
const getNormalizedServices = (draft) => {
  if (!draft) return [];

  const rawList =
    draft.services ||
    draft.selectedServices ||
    draft.items ||
    (draft.serviceId || draft.serviceName ? [draft] : []);

  if (!Array.isArray(rawList)) return [];

  return rawList
    .map((item, index) => {
      const sId = Number(item?.serviceId || item?.id || item?._id || item?.service?.id);
      const validId = Number.isSafeInteger(sId) && sId > 0 ? sId : index + 1;

      return {
        id: validId,
        serviceId: validId,
        name: cleanDraftString(item?.serviceName || item?.name || item?.title) || "Beauty Ritual",
        category: cleanDraftString(item?.category || item?.serviceCategory) || "Beauty Service",
        price: Number(item?.price || item?.amount || 0),
        image: item?.image || item?.serviceImage || DEFAULT_SERVICE_IMAGE,
      };
    })
    .filter((item) => item.name);
};

const getRequestId = () => {
  let requestId = sessionStorage.getItem(REQUEST_KEY);

  if (!requestId) {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      requestId = crypto.randomUUID();
    } else {
      requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    sessionStorage.setItem(REQUEST_KEY, requestId);
  }

  return requestId;
};

const getErrorMessage = (error) => {
  const responseData = error?.response?.data;

  if (typeof responseData?.message === "string") {
    return responseData.message;
  }

  if (typeof responseData?.error === "string") {
    return responseData.error;
  }

  if (error?.code === "ERR_NETWORK" || !error?.response) {
    return "We could not confirm the server response. Please retry safely. Your booking request ID has been preserved.";
  }

  return error?.message || "Unable to complete your booking. Please try again.";
};

// ======================================================
// CHECKOUT COMPONENT
// ======================================================

export default function Checkout() {
  const navigate = useNavigate();

  const [bookingDraft, setBookingDraft] = useState(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const submittingRef = useRef(false);
  const toastTimerRef = useRef(null);
  const navigationTimerRef = useRef(null);

  useEffect(() => {
    try {
      const rawDraft = sessionStorage.getItem(DRAFT_KEY);

      if (rawDraft) {
        const parsedDraft = JSON.parse(rawDraft);

        if (
          parsedDraft &&
          typeof parsedDraft === "object" &&
          !Array.isArray(parsedDraft)
        ) {
          setBookingDraft(parsedDraft);
        } else {
          setErrorMessage(
            "Your booking details are invalid. Please select your service again."
          );
        }
      }
    } catch (error) {
      console.error("[BeautyVibe] Unable to load booking draft:", error);
      setErrorMessage(
        "Your booking details could not be loaded. Please select your service again."
      );
    } finally {
      setDraftLoaded(true);
    }

    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (navigationTimerRef.current) clearTimeout(navigationTimerRef.current);
    };
  }, []);

  function showToast(message) {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast("");
    }, 3500);
  }

  // Derived Multi-Service & Profile Data
  const servicesList = getNormalizedServices(bookingDraft);
  const primaryService = servicesList[0] || {};
  const profile = getActiveUserProfile();

  const customerName =
    cleanDraftString(bookingDraft?.customerName) ||
    cleanDraftString(bookingDraft?.name) ||
    cleanDraftString(bookingDraft?.userName) ||
    cleanDraftString(
      `${bookingDraft?.firstName || ""} ${bookingDraft?.lastName || ""}`
    ) ||
    profile.name ||
    "Valued Client";

  const mobileNumber =
    cleanDraftString(bookingDraft?.mobileNumber) ||
    cleanDraftString(bookingDraft?.phone) ||
    cleanDraftString(bookingDraft?.mobile) ||
    cleanDraftString(bookingDraft?.contact) ||
    cleanDraftString(bookingDraft?.customerPhone) ||
    profile.phone ||
    "";

  const email =
    cleanDraftString(bookingDraft?.email) ||
    cleanDraftString(bookingDraft?.customerEmail) ||
    profile.email ||
    "";

  const totalPrice =
    servicesList.reduce((sum, item) => sum + (Number(item.price) || 0), 0) ||
    Number(bookingDraft?.price || bookingDraft?.amount || 0);

  const address = cleanDraftString(bookingDraft?.address);

  async function handleConfirmBooking(event) {
    event.preventDefault();

    if (!bookingDraft || submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);
    setErrorMessage("");

    try {
      const appointmentDate = cleanDraftString(bookingDraft.date);
      const appointmentTime = cleanDraftString(bookingDraft.time);
      const paymentMethod = cleanDraftString(bookingDraft.paymentMethod) || "upi";

      if (servicesList.length === 0) {
        throw new Error("Please select at least one service before checkout.");
      }

      if (!appointmentDate) {
        throw new Error("Please select an appointment date.");
      }
      if (!appointmentTime) {
        throw new Error("Please select an appointment time.");
      }
      if (!address) {
        throw new Error("Your doorstep service address is required.");
      }

      const requestId = getRequestId();

      // Payload supporting multi-service cart and real user details
      const payload = {
        serviceId: primaryService.serviceId || 1,
        serviceName:
          servicesList.length > 1
            ? `${primaryService.name} + ${servicesList.length - 1} more service(s)`
            : primaryService.name,
        category: primaryService.category || "Beauty Ritual",
        services: servicesList,
        amount: totalPrice,
        type: "HOME",
        date: appointmentDate,
        time: appointmentTime,
        address: address,
        paymentMethod: paymentMethod,
        requestId: requestId,
        customerName: customerName,
        mobileNumber: mobileNumber,
        phone: mobileNumber,
        customerPhone: mobileNumber,
        customerEmail: email,
        email: email,
      };

      const response = await API.post("/api/appointments", payload, {
        headers: {
          "Idempotency-Key": requestId,
        },
      });

      const result = response.data;

      if (!result?.success || !result?.data) {
        throw new Error(
          result?.message || "The server could not confirm your appointment."
        );
      }

      // Merge verified API output with complete real customer details for session storage
      const confirmedBooking = {
        ...result.data,
        customerName: customerName,
        mobileNumber: mobileNumber,
        phone: mobileNumber,
        customerPhone: mobileNumber,
        customerEmail: email,
        email: email,
        services: servicesList,
        address: address,
        date: appointmentDate,
        time: appointmentTime,
        amount: totalPrice,
      };

      sessionStorage.setItem(CONFIRMED_KEY, JSON.stringify(confirmedBooking));
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(REQUEST_KEY);

      setBookingDraft(null);

      showToast(
        result.duplicateRequest
          ? "Your existing booking was recovered successfully."
          : "Your appointment has been booked successfully."
      );

      navigationTimerRef.current = setTimeout(() => {
        navigate("/booking-confirmation", {
          replace: true,
        });
      }, 700);
    } catch (error) {
      console.error("[BeautyVibe] Booking request failed:", error.response?.data || error);
      const message = getErrorMessage(error);
      setErrorMessage(message);
      showToast("Booking was not confirmed. Please review the message.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  if (!draftLoaded) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#FCF9F6]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#EADBD2] border-t-[#C56E4E]" />
          <p className="text-xs font-semibold tracking-wide text-[#8C7A70]">
            Preparing your checkout...
          </p>
        </div>
      </div>
    );
  }

  if (!bookingDraft || servicesList.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-1 flex-col items-center justify-center bg-[#FCF9F6] px-6 py-12 text-center text-[#2D2623]">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#EADBD2] bg-white shadow-sm">
          <CalendarDays size={30} className="text-[#C56E4E]" />
        </div>
        <h2 className="mb-3 font-serif text-2xl font-bold sm:text-3xl">
          No Active Booking
        </h2>
        <p className="mb-8 max-w-sm text-sm leading-6 text-[#8C7A70]">
          Your checkout does not contain any active service selections. Please choose your services to continue.
        </p>
        {errorMessage && (
          <p className="mb-5 max-w-md text-sm text-red-600">{errorMessage}</p>
        )}
        <button
          type="button"
          onClick={() => navigate("/services")}
          className="cursor-pointer rounded-full bg-[#C56E4E] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#A35539]"
        >
          Explore Services
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 flex-1 bg-[#FCF9F6] pb-32 font-sans text-[#2D2623] selection:bg-[#C56E4E] selection:text-white">
      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-3xl space-y-6 px-4 pt-6 sm:px-6 sm:pt-8"
      >
        <motion.button
          variants={fadeUp}
          type="button"
          onClick={() => navigate(-1)}
          disabled={loading}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#EADBD2] bg-white px-4 py-2.5 text-xs font-bold text-[#8C7A70] shadow-sm transition hover:text-[#C56E4E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={14} />
          Back to Details
        </motion.button>

        <motion.section
          variants={fadeUp}
          className="overflow-hidden rounded-[2rem] border border-[#EADBD2] bg-white shadow-[0_18px_60px_rgba(80,47,31,0.08)] sm:rounded-[2.5rem]"
        >
          <div className="border-b border-[#EADBD2]/70 px-6 pb-6 pt-7 sm:px-10 sm:pb-8 sm:pt-10">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0E7]">
                <Sparkles size={17} className="text-[#C56E4E]" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C56E4E] sm:text-xs">
                BeautyVibe · Secure Doorstep Checkout
              </span>
            </div>

            <h1 className="font-serif text-2xl font-bold leading-tight sm:text-3xl">
              Review & Confirm
              <span className="mt-1 block text-[#C56E4E]">
                {servicesList.length > 1
                  ? `Your ${servicesList.length} Selected Rituals`
                  : "Your Home Appointment"}
              </span>
            </h1>

            <p className="mt-3 max-w-lg text-xs leading-6 text-[#8C7A70] sm:text-sm">
              Review your client information, selected services, schedule, and doorstep address before confirming your booking.
            </p>
          </div>

          <div className="p-5 sm:p-10">
            {/* Real Customer Information Card */}
            <div className="mb-8 rounded-[1.5rem] border border-[#EADBD2] bg-[#FFF8F3] p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C56E4E]">
                <User size={14} />
                Client Profile Details
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-1 text-xs">
                <div className="flex items-center gap-2 text-[#2D2623] font-semibold">
                  <User size={13} className="text-[#8C7A70]" />
                  <span>{customerName}</span>
                </div>

                {mobileNumber && (
                  <div className="flex items-center gap-2 text-[#2D2623] font-mono">
                    <Phone size={13} className="text-[#8C7A70]" />
                    <span>{mobileNumber}</span>
                  </div>
                )}

                {email && (
                  <div className="flex items-center gap-2 text-[#2D2623] sm:col-span-2">
                    <Mail size={13} className="text-[#8C7A70]" />
                    <span className="truncate">{email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Multi-Service Itemized List */}
            <div className="mb-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C7A70]">
                <Layers size={14} className="text-[#C56E4E]" />
                Selected Services ({servicesList.length})
              </div>

              {servicesList.map((srv, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-[#EADBD2] bg-[#FFF8F3] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                      <img
                        src={srv.image || DEFAULT_SERVICE_IMAGE}
                        alt={srv.name}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = DEFAULT_SERVICE_IMAGE;
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="inline-block rounded bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#C56E4E] border border-[#EADBD2]/60 mb-1">
                        {srv.category}
                      </span>
                      <h3 className="font-serif text-base font-bold truncate text-[#2D2623]">
                        {srv.name}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right shrink-0 sm:pl-4">
                    <span className="font-serif text-base font-bold text-[#C56E4E]">
                      ₹{srv.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Schedule & Location Summary Box */}
            <div className="mb-8 rounded-[1.5rem] border border-[#EADBD2] bg-[#FCF9F6] p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-[#8C7A70]">
                <CalendarDays size={14} className="shrink-0 text-[#C56E4E]" />
                <strong className="text-[#2D2623]">
                  {cleanDraftString(bookingDraft.date) || "Not Selected"}
                </strong>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-[#8C7A70]">
                <Clock size={14} className="shrink-0 text-[#C56E4E]" />
                <strong className="text-[#2D2623]">
                  {cleanDraftString(bookingDraft.time) || "Not Selected"}
                </strong>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-[#8C7A70] pt-2 border-t border-[#EADBD2]/60">
                <MapPin size={14} className="mt-0.5 shrink-0 text-[#C56E4E]" />
                <span className="leading-relaxed text-[#2D2623]">
                  {address || "No address provided"}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-[#8C7A70]">
                <House size={14} className="shrink-0 text-[#C56E4E]" />
                <span className="font-semibold text-[#2D2623]">
                  Doorstep Home Service
                </span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="mb-8 space-y-4 rounded-2xl border border-[#EADBD2]/80 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                <span className="text-[#8C7A70]">Services Total ({servicesList.length} items)</span>
                <strong className="text-[#2D2623]">₹{totalPrice.toLocaleString("en-IN")}</strong>
              </div>

              <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                <span className="text-[#8C7A70]">Doorstep Travel & Equipment Kit</span>
                <span className="font-bold text-[#1E9E4A]">FREE</span>
              </div>

              <div className="border-t border-dashed border-[#EADBD2] pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-serif text-base font-bold sm:text-lg">Total Payable</span>
                  <strong className="font-serif text-2xl font-bold text-[#C56E4E] sm:text-3xl">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </strong>
                </div>

                <p className="mt-2 text-[10px] leading-5 text-[#8C7A70]">
                  Payment method selected:{" "}
                  <strong className="uppercase">
                    {cleanDraftString(bookingDraft.paymentMethod) || "UPI"}
                  </strong>
                </p>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">Booking confirmation unsuccessful</p>
                    <p className="mt-1 break-words text-xs leading-5">{errorMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirm button */}
            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={loading || servicesList.length === 0}
              className={`group flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_30px_rgba(197,110,78,0.25)] transition-all duration-300 sm:py-5 ${
                loading || servicesList.length === 0
                  ? "cursor-not-allowed bg-[#B8A49A]"
                  : "cursor-pointer bg-[#C56E4E] hover:-translate-y-0.5 hover:bg-[#A35539] hover:shadow-[0_16px_35px_rgba(197,110,78,0.32)]"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Confirming Appointment...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Confirm Home Appointment ({servicesList.length} {servicesList.length === 1 ? 'Service' : 'Services'})
                  <CheckCircle2 size={16} className="transition-transform group-hover:scale-110" />
                </>
              )}
            </button>
          </div>
        </motion.section>
      </motion.main>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-6 left-1/2 z-[100] flex max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/15 bg-[#2D2623]/95 px-5 py-4 text-xs font-semibold text-white shadow-2xl backdrop-blur-xl sm:bottom-8 sm:px-6"
          >
            <CheckCircle2 size={18} className="shrink-0 text-[#E5A024]" />
            <span className="leading-5">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
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
  Store,
  House,
  AlertCircle,
  RefreshCw,
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

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80";

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
// REQUEST ID
// ======================================================

function getOrCreateRequestId() {
  let requestId = sessionStorage.getItem(REQUEST_KEY);

  if (!requestId) {
    if (typeof crypto.randomUUID === "function") {
      requestId = crypto.randomUUID();
    } else {
      requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    sessionStorage.setItem(REQUEST_KEY, requestId);
  }

  return requestId;
}

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

  // ====================================================
  // LOAD BOOKING DRAFT
  // ====================================================

  useEffect(() => {
    try {
      const rawDraft = sessionStorage.getItem(DRAFT_KEY);

      if (rawDraft) {
        const parsedDraft = JSON.parse(rawDraft);

        if (parsedDraft && typeof parsedDraft === "object") {
          setBookingDraft(parsedDraft);
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
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  // ====================================================
  // TOAST
  // ====================================================

  function showToast(message) {
    setToast(message);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToast("");
    }, 3500);
  }

  // ====================================================
  // CONFIRM BOOKING
  // ====================================================

  async function handleConfirmBooking(event) {
    event.preventDefault();

    if (!bookingDraft || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    setErrorMessage("");

    try {
      const requestId = getOrCreateRequestId();

      const serviceName =
        bookingDraft.serviceName ||
        bookingDraft.name ||
        "";

      const amount = Number(bookingDraft.price);
      const appointmentDate = bookingDraft.date;
      const appointmentTime = bookingDraft.time;

      if (!serviceName.trim()) {
        throw new Error("Please select a valid service.");
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("The service price is invalid.");
      }

      if (typeof appointmentDate !== "string" || !appointmentDate.trim()) {
        throw new Error("Please select an appointment date.");
      }

      if (typeof appointmentTime !== "string" || !appointmentTime.trim()) {
        throw new Error("Please select an appointment time.");
      }

      const serviceType =
        String(bookingDraft.type || "SALON").toUpperCase() === "HOME"
          ? "HOME"
          : "SALON";

      const payload = {
        serviceId: bookingDraft.serviceId || 1,
        serviceName: serviceName.trim(),
        category: bookingDraft.category || "General",
        amount,
        type: serviceType,
        date: appointmentDate,
        time: appointmentTime,
        requestId,
      };

      const response = await API.post(
        "/api/appointments",
        payload,
        {
          headers: {
            "Idempotency-Key": requestId,
          },
        }
      );

      const result = response.data;

      if (!result?.success || !result?.data) {
        throw new Error(
          result?.message || "The server could not confirm your appointment."
        );
      }

      const confirmedBooking = result.data;

      sessionStorage.setItem(
        CONFIRMED_KEY,
        JSON.stringify(confirmedBooking)
      );

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
      console.error(
        "[BeautyVibe] Booking request failed:",
        error.response?.data || error
      );

      const serverMessage = error.response?.data?.message;
      let message =
        serverMessage ||
        error.message ||
        "Unable to complete your booking. Please try again.";

      if (!error.response) {
        message =
          "We could not confirm the server response. Please retry safely. Your request ID has been preserved.";
      }

      setErrorMessage(message);
      showToast("Booking was not confirmed. Please review the message.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  // ====================================================
  // LOADING SCREEN
  // ====================================================

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

  // ====================================================
  // NO BOOKING DRAFT
  // ====================================================

  if (!bookingDraft) {
    return (
      <div className="flex min-h-[70vh] flex-1 flex-col items-center justify-center bg-[#FCF9F6] px-6 py-12 text-center text-[#2D2623]">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#EADBD2] bg-white shadow-sm">
          <CalendarDays size={30} className="text-[#C56E4E]" />
        </div>

        <h2 className="mb-3 font-serif text-2xl font-bold sm:text-3xl">
          No Active Booking
        </h2>

        <p className="mb-8 max-w-sm text-sm leading-6 text-[#8C7A70]">
          Your checkout does not contain an active service selection.
          Please choose a service to continue.
        </p>

        {errorMessage && (
          <p className="mb-5 max-w-md text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={() => navigate("/services")}
          className="rounded-full bg-[#C56E4E] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#A35539] cursor-pointer"
        >
          Explore Services
        </button>
      </div>
    );
  }

  const serviceName =
    bookingDraft.serviceName ||
    bookingDraft.name ||
    "Beauty Service";

  const category = bookingDraft.category || "Beauty Ritual";
  const price = Number(bookingDraft.price) || 0;

  const isHomeService =
    String(bookingDraft.type || "SALON").toUpperCase() === "HOME";

  // ====================================================
  // CHECKOUT UI
  // ====================================================

  return (
    <div className="relative min-w-0 flex-1 bg-[#FCF9F6] pb-32 font-sans text-[#2D2623] selection:bg-[#C56E4E] selection:text-white">
      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-3xl space-y-6 px-4 pt-6 sm:px-6 sm:pt-8"
      >
        {/* Back button */}
        <motion.button
          variants={fadeUp}
          type="button"
          onClick={() => navigate(-1)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-[#EADBD2] bg-white px-4 py-2.5 text-xs font-bold text-[#8C7A70] shadow-sm transition hover:text-[#C56E4E] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Details
        </motion.button>

        {/* Main checkout card */}
        <motion.section
          variants={fadeUp}
          className="overflow-hidden rounded-[2rem] border border-[#EADBD2] bg-white shadow-[0_18px_60px_rgba(80,47,31,0.08)] sm:rounded-[2.5rem]"
        >
          {/* Header */}
          <div className="border-b border-[#EADBD2]/70 px-6 pb-6 pt-7 sm:px-10 sm:pb-8 sm:pt-10">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0E7]">
                <Sparkles size={17} className="text-[#C56E4E]" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C56E4E] sm:text-xs">
                BeautyVibe · Secure Checkout
              </span>
            </div>

            <h1 className="font-serif text-2xl font-bold leading-tight sm:text-3xl">
              Review & Confirm
              <span className="mt-1 block text-[#C56E4E]">
                Your Appointment
              </span>
            </h1>

            <p className="mt-3 max-w-lg text-xs leading-6 text-[#8C7A70] sm:text-sm">
              Review your selected service, appointment schedule, and total
              before confirming your booking.
            </p>
          </div>

          <div className="p-5 sm:p-10">
            {/* Selected service */}
            <div className="mb-8 flex flex-col gap-5 rounded-[1.75rem] border border-[#EADBD2] bg-[#FFF8F3] p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="h-48 w-full shrink-0 overflow-hidden rounded-2xl bg-white sm:h-36 sm:w-36">
                <img
                  src={bookingDraft.image || DEFAULT_SERVICE_IMAGE}
                  alt={serviceName}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = DEFAULT_SERVICE_IMAGE;
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <span className="inline-flex rounded-md border border-[#EADBD2] bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#C56E4E]">
                  {category}
                </span>

                <h2 className="mt-3 break-words font-serif text-xl font-bold sm:text-2xl">
                  {serviceName}
                </h2>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-[#8C7A70]">
                    <CalendarDays
                      size={14}
                      className="shrink-0 text-[#C56E4E]"
                    />
                    <span>
                      <strong className="text-[#2D2623]">
                        {bookingDraft.date}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#8C7A70]">
                    <Clock
                      size={14}
                      className="shrink-0 text-[#C56E4E]"
                    />
                    <span>
                      <strong className="text-[#2D2623]">
                        {bookingDraft.time}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#8C7A70]">
                    {isHomeService ? (
                      <House
                        size={14}
                        className="shrink-0 text-[#C56E4E]"
                      />
                    ) : (
                      <Store
                        size={14}
                        className="shrink-0 text-[#C56E4E]"
                      />
                    )}

                    <span className="font-semibold text-[#2D2623]">
                      {isHomeService
                        ? "Home Service"
                        : "Salon Service"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="mb-8 space-y-4 rounded-2xl border border-[#EADBD2]/80 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                <span className="text-[#8C7A70]">
                  Service Price
                </span>
                <strong className="text-[#2D2623]">
                  ₹{price.toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                <span className="text-[#8C7A70]">
                  Convenience & Hygiene Kit
                </span>
                <span className="font-bold text-[#1E9E4A]">
                  FREE
                </span>
              </div>

              <div className="border-t border-dashed border-[#EADBD2] pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-serif text-base font-bold sm:text-lg">
                    Total Payable
                  </span>
                  <strong className="font-serif text-2xl font-bold text-[#C56E4E] sm:text-3xl">
                    ₹{price.toLocaleString("en-IN")}
                  </strong>
                </div>

                <p className="mt-2 text-[10px] leading-5 text-[#8C7A70]">
                  The amount shown is based on your selected service.
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
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="font-bold">
                      Booking confirmation unsuccessful
                    </p>
                    <p className="mt-1 break-words text-xs leading-5">
                      {errorMessage}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirm button */}
            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={loading}
              className={`group flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_30px_rgba(197,110,78,0.25)] transition-all duration-300 sm:py-5 ${
                loading
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
                  Confirm Appointment
                  <CheckCircle2
                    size={16}
                    className="transition-transform group-hover:scale-110"
                  />
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
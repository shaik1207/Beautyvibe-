
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import {
  APIProvider,
  Map,
  Marker,
} from "@vis.gl/react-google-maps";

import {
  CalendarDays,
  RefreshCw,
  AlertCircle,
  LogIn,
  Phone,
  Star,
  Navigation,
  Check,
  X,
  QrCode,
  Sparkles,
  Compass,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { io } from "socket.io-client";

import API from "../services/axios";

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const DEFAULT_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=400&q=80";

const DEFAULT_EXPERT_IMAGE =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80";

const DEFAULT_MAP_LOCATION = {
  lat: 17.385,
  lng: 78.4867,
};

const BOOKING_TABS = [
  "All",
  "Upcoming",
  "In Progress",
  "Completed",
  "Cancelled",
];

// --------------------------------------------------
// UTILITY FUNCTIONS
// --------------------------------------------------

const getSocketUrl = () => {
  const configuredUrl =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_BASE_URL;

  if (
    typeof configuredUrl === "string" &&
    configuredUrl.trim()
  ) {
    try {
      return new URL(configuredUrl.trim()).origin;
    } catch (error) {
      console.warn("Invalid socket URL:", configuredUrl);
    }
  }

  return "http://localhost:5000";
};

const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return String(dateString);
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "—";

  const value = String(timeString);

  const match = value.match(/^(\d{1,2}):(\d{2})/);

  if (!match) return value;

  const date = new Date();

  date.setHours(
    Number(match[1]),
    Number(match[2]),
    0,
    0
  );

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const parseStaff = (staffValue) => {
  if (!staffValue) {
    return {
      name: "Expert not assigned",
      role: "Beauty Specialist",
    };
  }

  if (typeof staffValue === "object") {
    return {
      name:
        staffValue.name ||
        staffValue.fullName ||
        "Beauty Expert",
      role:
        staffValue.role ||
        staffValue.specialization ||
        "Beauty Specialist",
      phone:
        staffValue.phone ||
        staffValue.mobile ||
        "",
      image:
        staffValue.image ||
        staffValue.profileImage ||
        DEFAULT_EXPERT_IMAGE,
    };
  }

  const staffString = String(staffValue).trim();

  const match = staffString.match(/^(.+?)\s*\((.+?)\)$/);

  if (match) {
    return {
      name: match[1].trim(),
      role: match[2].trim(),
      phone: "",
      image: DEFAULT_EXPERT_IMAGE,
    };
  }

  return {
    name: staffString,
    role: "Beauty Expert",
    phone: "",
    image: DEFAULT_EXPERT_IMAGE,
  };
};

const parseAddress = (addressValue) => {
  if (!addressValue) return "Doorstep Service";

  if (typeof addressValue === "string") {
    return addressValue;
  }

  if (typeof addressValue === "object") {
    return (
      addressValue.fullAddress ||
      addressValue.address ||
      addressValue.street ||
      addressValue.location ||
      "Doorstep Service"
    );
  }

  return String(addressValue);
};

const parseServiceDetails = (item) => {
  const service =
    item.service ||
    item.Service ||
    {};

  const name =
    item.serviceName ||
    service.title ||
    service.name ||
    item.title ||
    "Beauty Ritual";

  let image =
    item.image ||
    item.serviceImage ||
    service.image ||
    service.imageUrl ||
    service.photo ||
    "";

  if (
    typeof image === "string" &&
    image.startsWith("/")
  ) {
    const apiBase =
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:5000";

    image = `${apiBase.replace(/\/+$/, "")}${image}`;
  }

  return {
    name,
    image: image || DEFAULT_SERVICE_IMAGE,
  };
};

const normalizeAppointments = (responseData) => {
  let list =
    responseData?.data ??
    responseData?.appointments ??
    responseData;

  // Handle nested API response structures.
  if (!Array.isArray(list)) {
    list =
      list?.appointments ??
      list?.rows ??
      list?.items ??
      [];
  }

  if (!Array.isArray(list)) {
    return [];
  }

  return list.map((item, index) => {
    const { name, image } = parseServiceDetails(item);

    const address = parseAddress(
      item.address ||
      item.shippingAddress ||
      item.location ||
      item.userAddress
    );

    return {
      ...item,
      uid: String(
        item.id ??
        item._id ??
        item.appointmentId ??
        `booking-${index}`
      ),
      serviceName: name,
      image,
      address,
      status: item.status || "Pending",
    };
  });
};

// --------------------------------------------------
// ANIMATION VARIANTS
// --------------------------------------------------

const staggerContainer = {
  hidden: {
    opacity: 0,
  },
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
    y: 15,
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

// --------------------------------------------------
// MAIN MY BOOKINGS COMPONENT
// --------------------------------------------------

export default function MyBookings() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const [socketConnected, setSocketConnected] = useState(false);

  const [activeTab, setActiveTab] = useState("All");

  const [passModalOpen, setPassModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [trackingBooking, setTrackingBooking] = useState(null);

  // ------------------------------------------------
  // FETCH APPOINTMENTS
  // ------------------------------------------------

  const fetchAppointments = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    setError("");
    setIsUnauthorized(false);

    try {
      const response = await API.get("/api/appointments");

      const normalized = normalizeAppointments(response.data);

      setAppointments(normalized);
    } catch (err) {
      console.error(
        "[BeautyVibe] Appointment fetch failed:",
        err.response?.data || err.message
      );

      if (err.response?.status === 401) {
        setIsUnauthorized(true);
        setError(
          "Your session has expired or is invalid. Please sign in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view these bookings."
        );
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to load your appointment history. Please check your connection."
        );
      }

      setAppointments([]);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  // ------------------------------------------------
  // INITIAL FETCH AND SOCKET CONNECTION
  // ------------------------------------------------

  useEffect(() => {
    fetchAppointments();

    const socket = io(getSocketUrl(), {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("connect_error", (socketError) => {
      console.warn(
        "[BeautyVibe] Socket connection error:",
        socketError.message
      );
    });

    socket.on("appointmentUpdated", () => {
      fetchAppointments(false);
    });

    socket.on("appointmentCreated", () => {
      fetchAppointments(false);
    });

    return () => {
      socket.off("appointmentUpdated");
      socket.off("appointmentCreated");
      socket.disconnect();
    };
  }, [fetchAppointments]);

  // ------------------------------------------------
  // DIGITAL PASS
  // ------------------------------------------------

  const openPassModal = (booking) => {
    setActiveBooking(booking);
    setPassModalOpen(true);
  };

  // ------------------------------------------------
  // FILTER APPOINTMENTS
  // ------------------------------------------------

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const status = String(
        appointment.status || "Pending"
      ).toLowerCase();

      const hasStaff = Boolean(
        appointment.staff ||
        appointment.assignedStaff
      );

      switch (activeTab) {
        case "Upcoming":
          return (
            status === "pending" ||
            (status === "accepted" && !hasStaff)
          );

        case "In Progress":
          return (
            status === "accepted" && hasStaff
          );

        case "Completed":
          return status === "completed";

        case "Cancelled":
          return (
            status === "cancelled" ||
            status === "rejected"
          );

        default:
          return true;
      }
    });
  }, [appointments, activeTab]);

  // ------------------------------------------------
  // MAIN UI
  // ------------------------------------------------

  return (
    <div className="relative min-h-screen min-w-0 flex-1 bg-[#FCF9F6] pb-32 font-sans text-[#2D2623] selection:bg-[#C56E4E] selection:text-white">

      <div className="mx-auto max-w-3xl space-y-6 px-4 pt-6 sm:px-6 sm:pt-8">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#EADBD2] bg-[#FFF6F0] px-3.5 py-1 shadow-sm">

              <Sparkles
                size={13}
                className="text-[#C56E4E]"
              />

              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70]">
                Client Dashboard
              </span>

            </div>

            <h1 className="font-serif text-3xl font-bold text-[#2D2623] sm:text-4xl">
              My Bookings
            </h1>

            <p className="mt-1 text-xs text-[#8C7A70] sm:text-sm">
              Track your beauty rituals and live expert arrivals in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-1.5 rounded-full border border-[#EADBD2] bg-white px-3.5 py-2 text-[10px] font-bold shadow-sm sm:flex">

              <span
                className={`h-2 w-2 rounded-full ${
                  socketConnected
                    ? "animate-pulse bg-emerald-500"
                    : "bg-amber-400"
                }`}
              />

              <span className="text-[#5C4841]">
                {socketConnected
                  ? "Live Sync Active"
                  : "Connecting..."}
              </span>

            </div>

            <button
              type="button"
              onClick={() => fetchAppointments()}
              disabled={loading}
              aria-label="Refresh bookings"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EADBD2] bg-white text-[#5C4841] shadow-sm transition hover:bg-[#FFF6F0] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin text-[#C56E4E]"
                    : ""
                }
              />
            </button>

          </div>
        </div>

        {/* FILTER TABS */}

        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">

          {BOOKING_TABS.map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-full px-6 py-2.5 text-xs font-bold shadow-sm transition-all ${
                activeTab === tab
                  ? "bg-[#C56E4E] text-white shadow-md shadow-[#C56E4E]/20"
                  : "border border-[#EADBD2] bg-white text-[#8C7A70] hover:border-[#C56E4E] hover:text-[#C56E4E]"
              }`}
            >
              {tab}
            </button>
          ))}

        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm sm:flex-row sm:items-center">

            <div className="flex items-center gap-3">

              <AlertCircle
                size={20}
                className="shrink-0 text-red-500"
              />

              <p className="text-xs font-medium sm:text-sm">
                {error}
              </p>

            </div>

            {isUnauthorized && (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow transition hover:bg-red-700"
              >
                <LogIn size={14} />
                Sign In
              </button>
            )}

          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="flex min-h-[40vh] items-center justify-center">

            <div className="flex flex-col items-center gap-3">

              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#EADBD2] border-t-[#C56E4E]" />

              <p className="text-xs font-bold uppercase tracking-widest text-[#8C7A70]">
                Loading your beauty rituals...
              </p>

            </div>

          </div>
        )}

        {/* EMPTY STATE */}

        {!loading &&
          filteredAppointments.length === 0 &&
          !error && (
            <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-[2.5rem] border border-[#EADBD2] bg-white p-10 text-center shadow-sm">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF6F0]">
                <CalendarDays
                  size={28}
                  className="text-[#C56E4E]"
                />
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#2D2623]">
                No Bookings Found
              </h3>

              <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#8C7A70]">
                No appointments match this category. Explore our catalog and book your next luxury session today!
              </p>

              <button
                type="button"
                onClick={() => navigate("/services")}
                className="mt-6 rounded-full bg-[#C56E4E] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#A35539]"
              >
                Explore Services
              </button>

            </div>
          )}

        {/* BOOKING LIST */}

        {!loading && filteredAppointments.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {filteredAppointments.map((booking) => (
              <BookingCard
                key={booking.uid}
                booking={booking}
                onShowPass={() => openPassModal(booking)}
                onTrack={() => setTrackingBooking(booking)}
              />
            ))}
          </motion.div>
        )}

      </div>

      {/* DIGITAL PASS MODAL */}

      <AnimatePresence>
        {passModalOpen && activeBooking && (
          <BookingPassModal
            booking={activeBooking}
            onClose={() => setPassModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* LIVE TRACKING MODAL */}

      <AnimatePresence>
        {trackingBooking && (
          <LiveTrackingModal
            booking={trackingBooking}
            onClose={() => setTrackingBooking(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

// --------------------------------------------------
// BOOKING CARD
// --------------------------------------------------

function BookingCard({
  booking,
  onShowPass,
  onTrack,
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const status = String(
    booking.status || "Pending"
  ).toLowerCase();

  const isCompleted = status === "completed";

  const isCancelled =
    status === "cancelled" ||
    status === "rejected";

  const staffValue =
    booking.staff ||
    booking.assignedStaff;

  const hasStaff = Boolean(staffValue);

  const staff = parseStaff(staffValue);

  let badgeBg =
    "border-amber-200 bg-amber-50 text-amber-700";

  let statusText = "WAITING FOR CONFIRMATION";

  if (isCancelled) {
    badgeBg = "border-red-200 bg-red-50 text-red-700";
    statusText = "CANCELLED";
  } else if (isCompleted) {
    badgeBg = "border-emerald-200 bg-emerald-50 text-emerald-700";
    statusText = "COMPLETED";
  } else if (hasStaff) {
    badgeBg = "border-blue-200 bg-blue-50 text-blue-700";
    statusText = "EXPERT ASSIGNED";
  } else if (status === "accepted") {
    badgeBg = "border-emerald-200 bg-emerald-50 text-emerald-700";
    statusText = "CONFIRMED";
  }

  let activeStep = 0;

  if (status === "accepted") activeStep = 1;
  if (hasStaff) activeStep = 2;
  if (isCompleted) activeStep = 4;

  const amount = Number(
    booking.amount ??
    booking.price ??
    0
  );

  return (
    <motion.div
      variants={fadeUp}
      className="space-y-5 rounded-[2rem] border border-[#EADBD2] bg-white p-6 shadow-sm sm:p-7"
    >

      {/* BOOKING HEADER */}

      <div className="flex flex-col items-start justify-between gap-4 border-b border-[#EADBD2]/60 pb-5 sm:flex-row sm:items-center">

        <div className="flex min-w-0 items-center gap-4">

          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[#EADBD2] bg-[#FFF6F0] sm:h-20 sm:w-20">
            <img
              src={booking.image || DEFAULT_SERVICE_IMAGE}
              alt={booking.serviceName}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = DEFAULT_SERVICE_IMAGE;
              }}
            />
          </div>

          <div className="min-w-0 space-y-1">

            <span
              className={`inline-block rounded-full border px-3 py-0.5 text-[9px] font-bold tracking-wider ${badgeBg}`}
            >
              {statusText}
            </span>

            <h3 className="truncate font-serif text-lg font-bold text-[#2D2623] sm:text-xl">
              {booking.serviceName}
            </h3>

            <p className="text-xs font-medium text-[#8C7A70]">
              {formatDate(booking.date)} • {formatTime(booking.time)}
            </p>

            <p className="max-w-xs truncate text-[11px] text-[#8C7A70] sm:max-w-sm">
              {booking.address}
            </p>

          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">

          <span className="font-serif text-xl font-bold text-[#2D2623]">
            ₹{amount.toLocaleString("en-IN")}
          </span>

          <button
            type="button"
            onClick={onShowPass}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#2D2623] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#433632]"
          >
            <QrCode size={13} />
            Show Pass
          </button>

        </div>

      </div>

      {/* STAFF DETAILS */}

      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] p-4 sm:flex-row">

        <div className="flex w-full items-center gap-3 sm:w-auto">

          <img
            src={staff.image}
            alt={staff.name}
            className="h-12 w-12 shrink-0 rounded-full border border-[#EADBD2] object-cover"
            onError={(event) => {
              event.currentTarget.src = DEFAULT_EXPERT_IMAGE;
            }}
          />

          <div className="min-w-0">

            <p className="flex items-center gap-2 text-sm font-bold text-[#2D2623]">
              {staff.name}

              {hasStaff && (
                <span className="flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600">
                  <Star
                    size={10}
                    className="mr-0.5 fill-amber-500"
                  />
                  4.8
                </span>
              )}
            </p>

            <p className="text-xs font-medium text-[#8C7A70]">
              {staff.role}
            </p>

          </div>

        </div>

        <div className="flex w-full items-center gap-2.5 sm:w-auto">

          {staff.phone && (
            <a
              href={`tel:${staff.phone}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 sm:flex-none"
            >
              <Phone size={13} />
              Call
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsDrawerOpen((previous) => !previous)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#C56E4E]/30 bg-[#FFF6F0] px-5 py-2.5 text-xs font-bold text-[#C56E4E] shadow-sm transition hover:bg-[#FFEBDD] sm:flex-none"
          >
            Track Expert

            {isDrawerOpen ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>

        </div>

      </div>

      {/* TRACKING DRAWER */}

      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-5 overflow-hidden border-t border-[#EADBD2]/60 pt-2"
          >

            <div className="py-3">

              <div className="relative mx-auto flex w-full max-w-md items-start justify-between">

                <div className="absolute left-4 right-4 top-3 h-[2px] bg-[#EADBD2]" />

                <motion.div
                  className="absolute left-4 top-3 h-[2px] bg-[#C56E4E]"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(activeStep / 4) * 88}%`,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                  }}
                />

                {[
                  "Booking Confirmed",
                  "Expert Assigned",
                  "Expert On the Way",
                  "Arriving Soon",
                  "Service Completed",
                ].map((label, index) => {
                  const isDone = index <= activeStep;

                  return (
                    <div
                      key={label}
                      className="relative z-10 flex flex-col items-center"
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shadow-sm transition-all ${
                          isDone
                            ? "bg-[#C56E4E] text-white ring-4 ring-[#FFF6F0]"
                            : "border-2 border-[#EADBD2] bg-white text-[#8C7A70]"
                        }`}
                      >
                        {isDone ? (
                          <Check
                            size={12}
                            strokeWidth={3}
                          />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <span
                        className={`mt-1.5 max-w-[60px] text-center text-[9px] font-bold leading-tight ${
                          isDone
                            ? "text-[#2D2623]"
                            : "text-[#A39292]"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}

              </div>

            </div>

            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#EADBD2] bg-[#FFF6F0] px-4 py-3.5 sm:flex-row sm:items-center">

              <div className="flex items-center gap-3">

                <span className="text-xl">📅</span>

                <div className="text-xs leading-relaxed text-[#5C4841]">

                  <strong className="block font-bold text-[#2D2623]">
                    {hasStaff
                      ? "Your expert has been assigned!"
                      : isCancelled
                        ? "This booking has been cancelled."
                        : isCompleted
                          ? "Your service is completed."
                          : "Your booking is being processed."}
                  </strong>

                  {hasStaff
                    ? `${staff.name} is preparing for your appointment.`
                    : "We will update you when your booking status changes."}

                </div>

              </div>

              {!isCancelled && hasStaff && (
                <button
                  type="button"
                  onClick={onTrack}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#C56E4E] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#A35539] sm:w-auto"
                >
                  <Navigation size={13} />
                  Open Live Map
                </button>
              )}

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

// --------------------------------------------------
// BOOKING DIGITAL PASS MODAL
// --------------------------------------------------

function BookingPassModal({
  booking,
  onClose,
}) {
  const passCode =
    booking.passCode ||
    booking.uid ||
    "BV-8492026";

  const qrCodeUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(passCode)}&margin=10`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2D2623]/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.9,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.9,
          y: 20,
        }}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-[#4A3F39] bg-gradient-to-b from-[#2D2623] to-[#1A1513] text-white shadow-2xl"
      >

        <button
          type="button"
          onClick={onClose}
          aria-label="Close digital pass"
          className="absolute right-5 top-5 z-20 rounded-full bg-white/10 p-2 text-white/60 backdrop-blur-md transition-colors hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="border-b border-white/10 p-7 pt-10 text-center">

          <h2 className="font-serif text-2xl font-bold tracking-wide text-white">
            BeautyVibe
          </h2>

          <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#E5A024]">

            <span>VIP Client</span>

            <span className="h-1 w-1 rounded-full bg-[#8C7A70]" />

            <span>Digital Pass</span>

          </div>

        </div>

        <div className="relative flex flex-col items-center justify-center py-8">

          <div className="rounded-3xl bg-gradient-to-br from-[#C56E4E] to-[#E5A024] p-1.5 shadow-[0_0_30px_rgba(197,110,78,0.3)]">

            <div className="rounded-[20px] bg-white p-3">

              <img
                src={qrCodeUrl}
                alt="Booking QR Code"
                className="h-44 w-44 rounded-xl object-contain"
              />

            </div>

          </div>

          <p className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-[#EADBD2]/80">
            {passCode}
          </p>

        </div>

        <div className="relative z-0 px-7">

          <div className="w-full border-t-[1.5px] border-dashed border-white/20" />

        </div>

        <div className="space-y-4 p-7">

          <div className="flex items-start justify-between gap-4">

            <div className="flex-1 space-y-1">

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A70]">
                Service Ritual
              </span>

              <p className="font-serif text-sm font-semibold leading-tight text-white">
                {booking.serviceName}
              </p>

            </div>

            <div className="shrink-0 text-right">

              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#8C7A70]">
                Total
              </span>

              <span className="font-serif text-lg font-bold text-[#C56E4E]">
                ₹
                {Number(
                  booking.amount ?? booking.price ?? 0
                ).toLocaleString("en-IN")}
              </span>

            </div>

          </div>

          <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-white/90">

            <CalendarDays
              size={15}
              className="text-[#C56E4E]"
            />

            <span>
              {formatDate(booking.date)} • {formatTime(booking.time)}
            </span>

          </div>

        </div>

      </motion.div>

    </motion.div>
  );
}

// --------------------------------------------------
// LIVE GOOGLE MAPS TRACKING MODAL
// --------------------------------------------------

function LiveTrackingModal({
  booking,
  onClose,
}) {
  const staff = parseStaff(
    booking.staff ||
    booking.assignedStaff
  );

  const initialLocation = {
    lat:
      Number(booking.expertLocation?.lat) ||
      DEFAULT_MAP_LOCATION.lat,
    lng:
      Number(booking.expertLocation?.lng) ||
      DEFAULT_MAP_LOCATION.lng,
  };

  const [expertLocation, setExpertLocation] = useState(
    initialLocation
  );

  const [eta, setEta] = useState("Waiting for location");

  const googleMapsApiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  // ------------------------------------------------
  // SOCKET LOCATION UPDATES
  // ------------------------------------------------

  useEffect(() => {
    if (!booking.uid) return undefined;

    const socket = io(getSocketUrl(), {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("connect", () => {
      socket.emit("join-booking", booking.uid);
    });

    socket.on("expert:location-update", (data) => {
      if (
        String(data?.bookingId) !== String(booking.uid)
      ) {
        return;
      }

      const latitude = Number(data.lat);
      const longitude = Number(data.lng);

      if (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
      ) {
        setExpertLocation({
          lat: latitude,
          lng: longitude,
        });
      }

      if (data.eta !== undefined && data.eta !== null) {
        setEta(String(data.eta));
      }
    });

    return () => {
      socket.off("expert:location-update");
      socket.disconnect();
    };
  }, [booking.uid]);

  // ------------------------------------------------
  // MAP UI
  // ------------------------------------------------

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#2D2623]/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200,
        }}
        onClick={(event) => event.stopPropagation()}
        className="relative flex h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2.5rem] border border-[#EADBD2] bg-white shadow-2xl sm:h-[680px] sm:rounded-[2.5rem]"
      >

        {/* TOP BAR */}

        <div className="z-20 flex items-center justify-between border-b border-[#EADBD2] bg-[#FCF9F6] p-5">

          <div>

            <span className="block text-[9px] font-bold uppercase tracking-widest text-[#C56E4E]">
              Google Maps Live Tracking
            </span>

            <h3 className="font-serif text-lg font-bold text-[#2D2623]">
              {staff.name} is on the way
            </h3>

          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close live tracking"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EADBD2] bg-white text-[#8C7A70] shadow-sm transition-colors hover:text-[#C56E4E]"
          >
            <X size={18} />
          </button>

        </div>

        {/* GOOGLE MAP */}

        <div className="relative min-h-[300px] flex-1 overflow-hidden bg-gray-100">

          {googleMapsApiKey ? (

            <APIProvider apiKey={googleMapsApiKey}>

              <Map
                defaultCenter={expertLocation}
                center={expertLocation}
                defaultZoom={14}
                gestureHandling="greedy"
                disableDefaultUI={false}
                className="h-full w-full"
              >

                <Marker
                  position={expertLocation}
                  title={staff.name}
                />

              </Map>

            </APIProvider>

          ) : (

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFF6F0] p-6 text-center">

              <AlertCircle
                size={32}
                className="mb-2 text-[#C56E4E]"
              />

              <p className="text-xs font-bold text-[#2D2623]">
                Google Maps API Key Missing
              </p>

              <p className="mt-1 max-w-xs text-[11px] text-[#8C7A70]">
                Add VITE_GOOGLE_MAPS_API_KEY to your frontend .env file.
              </p>

            </div>

          )}

          {/* ETA BADGE */}

          <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#EADBD2] bg-white/95 px-5 py-2.5 text-center shadow-xl backdrop-blur-md">

            <Compass
              size={16}
              className="text-[#C56E4E]"
            />

            <span className="text-xs font-bold text-[#2D2623]">
              Estimated arrival:

              <span className="ml-1 text-[#C56E4E]">
                {eta}
              </span>
            </span>

          </div>

        </div>

        {/* BOTTOM EXPERT INFORMATION */}

        <div className="relative z-20 -mt-6 space-y-5 rounded-t-[2.5rem] bg-white p-6 shadow-[0_-10px_20px_rgba(0,0,0,0.06)]">

          <div className="mb-1 flex justify-center">

            <div className="h-1.5 w-12 rounded-full bg-[#EADBD2]" />

          </div>

          <div className="flex items-center justify-between">

            <div className="flex min-w-0 items-center gap-3">

              <img
                src={staff.image}
                alt={staff.name}
                className="h-12 w-12 shrink-0 rounded-full border border-[#EADBD2] object-cover"
                onError={(event) => {
                  event.currentTarget.src = DEFAULT_EXPERT_IMAGE;
                }}
              />

              <div className="min-w-0">

                <p className="flex items-center gap-2 text-sm font-bold text-[#2D2623]">

                  {staff.name}

                  <span className="flex items-center rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-xs font-bold text-amber-600">

                    <Star
                      size={10}
                      className="mr-0.5 fill-amber-500"
                    />

                    4.8

                  </span>

                </p>

                <p className="truncate text-xs text-[#8C7A70]">
                  Heading to: {booking.address}
                </p>

              </div>

            </div>

          </div>

          {staff.phone && (
            <a
              href={`tel:${staff.phone}`}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 py-3.5 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-100"
            >
              <Phone size={15} />
              Call Expert
            </a>
          )}

        </div>

      </motion.div>

    </motion.div>
  );
}

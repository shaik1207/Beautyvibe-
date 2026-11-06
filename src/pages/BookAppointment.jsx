import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Sparkles,
  CreditCard,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Plus,
  RefreshCw,
  AlertCircle,
  MapPin,
  LocateFixed,
  CheckCircle2,
  CalendarClock,
  Smartphone,
  MapPinned,
  Home,
  Briefcase,
  Check,
  Trash2,
  Info,
  User,
  Phone,
} from "lucide-react";
import { io } from "socket.io-client";
import API from "../services/axios";

const availableTimeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 70, damping: 20 },
  },
};

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateString) => {
  if (!dateString) return "Choose a date";
  const [year, month, day] = dateString.split("-").map(Number);
  const parsedDate = new Date(year, month - 1, day);
  if (Number.isNaN(parsedDate.getTime())) return dateString;
  return parsedDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatLiveDate = (date) =>
  date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatLiveTime = (date) =>
  date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

const parseSlotToMinutes = (slot) => {
  const match = String(slot).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return -1;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();
  if (hours < 1 || hours > 12 || minutes > 59) return -1;
  if (period === "AM" && hours === 12) hours = 0;
  if (period === "PM" && hours !== 12) hours += 12;
  return hours * 60 + minutes;
};

export default function BookAppointment() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialServiceId = params.get("service") || "";

  const [allServices, setAllServices] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  // Customer Details State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [liveNow, setLiveNow] = useState(() => new Date());
  const today = formatLocalDate(liveNow);
  const [date, setDate] = useState(() => today);
  const [time, setTime] = useState("");

  // Generate real-time next 5 days including today
  const nextFiveDays = useMemo(() => {
    const list = [];
    const baseDate = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateString = formatLocalDate(d);
      let label = d.toLocaleDateString("en-IN", { weekday: "short" });
      if (i === 0) label = "Today";
      else if (i === 1) label = "Tomorrow";

      list.push({
        dateString,
        label,
        dayNum: d.getDate(),
        month: d.toLocaleDateString("en-IN", { month: "short" }),
      });
    }
    return list;
  }, [today]);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const local = localStorage.getItem("beautyvibe_addresses");
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  const [address, setAddress] = useState("");
  const [locationCoordinates, setLocationCoordinates] = useState(null);
  const [locating, setLocating] = useState(false);

  const [error, setError] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState(null);

  /* =========================================
     LIVE CLOCK
  ========================================= */
  useEffect(() => {
    const timer = setInterval(() => setLiveNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* =========================================
     FETCH SAVED ADDRESSES & USER PROFILE
  ========================================= */
  useEffect(() => {
    let cancelled = false;

    const fetchUserSettings = async () => {
      try {
        const [profileRes, addressRes] = await Promise.allSettled([
          API.get("/api/users/profile"),
          API.get("/api/users/addresses"),
        ]);

        if (cancelled) return;

        if (addressRes.status === "fulfilled") {
          const list = addressRes.value.data?.data || addressRes.value.data?.addresses || addressRes.value.data;
          if (Array.isArray(list) && list.length > 0) {
            setSavedAddresses(list);
            localStorage.setItem("beautyvibe_addresses", JSON.stringify(list));
          }
        }

        if (profileRes.status === "fulfilled") {
          const userData = profileRes.value.data?.data || profileRes.value.data?.user || profileRes.value.data;
          if (userData) {
            if (userData.firstName) setFirstName(userData.firstName);
            if (userData.lastName) setLastName(userData.lastName);
            if (!userData.firstName && userData.name) {
              const parts = userData.name.trim().split(" ");
              setFirstName(parts[0] || "");
              setLastName(parts.slice(1).join(" ") || "");
            }
            if (userData.phone || userData.mobile || userData.phoneNumber) {
              setMobileNumber(userData.phone || userData.mobile || userData.phoneNumber);
            }
          }
        }
      } catch (err) {
        console.warn("Could not sync remote user settings:", err);
      }
    };

    fetchUserSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================
     FETCH SERVICES WITH ROBUST IMAGE RESOLUTION
  ========================================= */
  useEffect(() => {
    let cancelled = false;

    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await API.get("/api/services");
        const rawServices =
          response.data?.data ||
          response.data?.services ||
          response.data ||
          [];

        if (cancelled) return;

        if (Array.isArray(rawServices)) {
          const formatted = rawServices.map((service) => {
            const rawImg =
              service.image ||
              service.imageUrl ||
              service.img ||
              service.photo ||
              "";

            let resolvedImage =
              "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80";

            if (typeof rawImg === "string" && rawImg.trim()) {
              if (
                rawImg.startsWith("http://") ||
                rawImg.startsWith("https://") ||
                rawImg.startsWith("data:")
              ) {
                resolvedImage = rawImg;
              } else {
                const apiBase =
                  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
                resolvedImage = `${apiBase.replace(/\/$/, "")}/${rawImg.replace(/^\//, "")}`;
              }
            }

            return {
              id: String(service._id || service.id),
              name: service.title || service.name || "Beauty Ritual",
              price: Number(service.price) || 0,
              duration: service.duration || "45 min",
              image: resolvedImage,
            };
          });

          setAllServices(formatted);

          setSelectedServiceIds((previous) => {
            if (previous.length > 0) {
              const stillValid = previous.filter((id) =>
                formatted.some((service) => service.id === id)
              );
              if (stillValid.length > 0) return stillValid;
            }

            const target =
              formatted.find(
                (service) => service.id === String(initialServiceId)
              ) || formatted[0];

            return target ? [target.id] : [];
          });
        }
      } catch (err) {
        console.error("Failed to load services:", err);
        if (!cancelled) {
          setError("Unable to load services. Please refresh the page.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchServices();
    return () => {
      cancelled = true;
    };
  }, [initialServiceId]);

  /* =========================================
     FETCH BOOKED SLOTS
  ========================================= */
  const fetchBookedSlots = useCallback(async () => {
    if (!date) {
      setBookedSlots([]);
      return;
    }

    try {
      const response = await API.get(
        `/api/appointments/booked-slots?date=${encodeURIComponent(date)}`
      );
      const data = response.data?.data || response.data?.bookedSlots || [];
      setBookedSlots(
        Array.isArray(data)
          ? data.map((slot) => (typeof slot === "string" ? slot : slot.time)).filter(Boolean)
          : []
      );
    } catch (err) {
      console.error("Failed to fetch booked slots:", err);
      setBookedSlots([]);
    }
  }, [date]);

  useEffect(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);

  /* =========================================
     SOCKET.IO LIVE SLOT UPDATES
  ========================================= */
  useEffect(() => {
    const configuredUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_BASE_URL;

    let socketUrl = "http://localhost:5000";
    if (typeof configuredUrl === "string" && configuredUrl.trim()) {
      socketUrl = configuredUrl.trim().replace(/\/$/, "");
    } else if (
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      socketUrl = window.location.origin;
    }

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      secure: socketUrl.startsWith("https://"),
    });

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));

    socket.on("appointmentBooked", (booking) => {
      const bookingDate =
        booking.date || booking.appointmentDate || booking.appointment_date;

      if (bookingDate === date) {
        const newSlot = booking.time || booking.appointment_time;
        if (newSlot) {
          setBookedSlots((previous) =>
            previous.includes(newSlot) ? previous : [...previous, newSlot]
          );
          setTime((previous) => (previous === newSlot ? "" : previous));
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [date]);

  /* =========================================
     GEOLOCATION & ADDRESS HANDLERS
  ========================================= */
  const handleAddressChange = (event) => {
    setAddress(event.target.value);
    setLocationCoordinates(null);
  };

  const handleSelectSavedAddress = (savedAddr) => {
    const full = savedAddr.fullAddress || savedAddr.address || "";
    if (full) {
      setAddress(full);
      setError("");
    }
  };

  const handleDetectLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Your browser does not support location detection. Please enter your address manually.");
      return;
    }

    if (!window.isSecureContext) {
      setError("Location detection requires HTTPS or localhost.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocationCoordinates({ latitude, longitude, accuracy });

        try {
          const url = new URL("https://nominatim.openstreetmap.org/reverse");
          url.searchParams.set("format", "jsonv2");
          url.searchParams.set("lat", String(latitude));
          url.searchParams.set("lon", String(longitude));
          url.searchParams.set("zoom", "18");
          url.searchParams.set("addressdetails", "1");

          const response = await fetch(url.toString(), {
            headers: { Accept: "application/json" },
          });

          if (!response.ok) throw new Error("Address lookup failed");
          const result = await response.json();

          if (result.display_name) {
            setAddress(result.display_name);
          } else {
            setAddress(`Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`);
          }
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          setAddress(`Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`);
          setError("Coordinates detected, but street address could not be resolved automatically.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        const message =
          err.code === 1
            ? "Location permission denied. Please allow access or select a saved address."
            : "Location detection timed out. Try again or select a saved address.";
        setError(message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  };

  /* =========================================
     SERVICE & RECOMMENDATION SELECTION
  ========================================= */
  const primarySelectedId = selectedServiceIds[0] || allServices[0]?.id || "";

  const primaryService = useMemo(
    () =>
      allServices.find((service) => service.id === String(primarySelectedId)) || {
        id: "",
        name: "Select Ritual",
        price: 0,
        duration: "45 min",
        image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80",
      },
    [allServices, primarySelectedId]
  );

  const additionalSelectedIds = selectedServiceIds.slice(1);
  const additionalSelectedServices = allServices.filter((service) =>
    additionalSelectedIds.includes(service.id)
  );

  const recommendedServices = allServices.filter(
    (service) => service.id !== primaryService.id
  );

  const totalCalculatedPrice =
    (Number(primaryService.price) || 0) +
    additionalSelectedServices.reduce(
      (sum, service) => sum + (Number(service.price) || 0),
      0
    );

  const toggleRecommendedService = (id) => {
    const stringId = String(id);
    setSelectedServiceIds((previous) => {
      if (previous.includes(stringId)) {
        return previous.filter((item) => item !== stringId);
      }
      return [...previous, stringId];
    });
  };

  const removeAdditionalService = (id, event) => {
    event.stopPropagation();
    setSelectedServiceIds((previous) => previous.filter((item) => item !== String(id)));
  };

  /* =========================================
     CHECKOUT HANDLER
  ========================================= */
  const handleProceedToCheckout = async (event) => {
    event.preventDefault();
    setError("");

    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }

    if (!lastName.trim()) {
      setError("Please enter your last name.");
      return;
    }

    if (!mobileNumber.trim() || !/^\d{10}$/.test(mobileNumber.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!primaryService.id || totalCalculatedPrice <= 0) {
      setError("Please select a valid service with a valid price.");
      return;
    }

    if (!date || date < today) {
      setError("Please select today or a future appointment date.");
      return;
    }

    if (!time) {
      setError("Please select your preferred time slot.");
      return;
    }

    if (bookedSlots.includes(time)) {
      setError("This time slot is already booked. Please choose another.");
      return;
    }

    if (!address.trim()) {
      setError("Please enter or select your doorstep service address.");
      return;
    }

    setSubmitting(true);

    try {
      const fullCustomerName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const bookingDraft = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        customerName: fullCustomerName,
        name: fullCustomerName,
        mobileNumber: mobileNumber.trim(),
        phone: mobileNumber.trim(),
        serviceId: primaryService.id,
        serviceName: primaryService.name,
        additionalServices: additionalSelectedServices.map((service) => service.name),
        additionalServiceIds: additionalSelectedServices.map((service) => service.id),
        price: totalCalculatedPrice,
        amount: totalCalculatedPrice,
        date,
        time,
        type: "HOME",
        address: address.trim(),
        doorstepAddress: address.trim(),
        paymentMethod: "cod", // Enforced COD
        location: locationCoordinates,
        image: primaryService.image,
      };

      sessionStorage.setItem("beautyvibe_booking_draft", JSON.stringify(bookingDraft));
      navigate("/checkout");
    } catch (err) {
      console.error("Unable to prepare checkout:", err);
      setError("Unable to continue to checkout. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#FCF9F6] p-6 text-center text-[#2D2623]">
        <RefreshCw size={32} className="mb-3 animate-spin text-[#C56E4E]" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">
          Loading services and live appointment slots...
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1 bg-[#FCF9F6] pb-28 font-sans text-[#2D2623] selection:bg-[#C56E4E] selection:text-white">
      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div
          variants={fadeUp}
          className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#EADBD2] bg-[#FFF6F0] px-4 py-1.5 shadow-sm">
              <Sparkles size={14} className="text-[#C56E4E]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70]">
                Doorstep Luxury Experience
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#2D2623] sm:text-4xl">
              Book Doorstep Service
            </h1>
            <p className="mt-2 text-xs font-medium text-[#8C7A70] sm:text-sm">
              Certified experts deliver salon rituals directly to your home.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-[#EADBD2] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#C56E4E]">
                <CalendarClock size={17} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Current Date & Time
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-[#2D2623]">
                {formatLiveDate(liveNow)}
              </p>
              <p className="mt-1 font-mono text-lg font-bold tabular-nums text-[#C56E4E]">
                {formatLiveTime(liveNow)}
              </p>
              <p className="mt-1 text-[10px] text-[#8C7A70]">
                India Standard Time · IST
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#EADBD2] bg-white px-4 py-3 text-xs font-bold text-[#5C4841] shadow-sm">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  socketConnected ? "bg-[#1E9E4A]" : "bg-[#E5A024]"
                }`}
              />
              {socketConnected ? "Live Connection Active" : "Connecting to live updates..."}
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleProceedToCheckout} className="grid items-start gap-8 lg:grid-cols-12">
          {/* LEFT PANEL */}
          <motion.div
            variants={fadeUp}
            className="space-y-8 rounded-[2.5rem] border border-[#EADBD2] bg-white p-6 shadow-sm sm:p-8 lg:col-span-7"
          >
            {/* Customer Information */}
            <section>
              <h2 className="mb-4 font-serif text-lg font-bold flex items-center justify-between">
                <span>1. Customer Details</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C56E4E] bg-[#FFF6F0] px-3 py-1 rounded-full border border-[#EADBD2]">
                  Required
                </span>
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8C7A70]">
                    First Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-3.5 text-[#8C7A70]" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g., Aarav"
                      className="w-full rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] p-3 pl-11 text-sm font-medium text-[#2D2623] outline-none transition focus:border-[#C56E4E] focus:ring-2 focus:ring-[#C56E4E]/10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8C7A70]">
                    Last Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-3.5 text-[#8C7A70]" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g., Sharma"
                      className="w-full rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] p-3 pl-11 text-sm font-medium text-[#2D2623] outline-none transition focus:border-[#C56E4E] focus:ring-2 focus:ring-[#C56E4E]/10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8C7A70]">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-3.5 text-[#8C7A70]" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] p-3 pl-11 text-sm font-medium text-[#2D2623] outline-none transition focus:border-[#C56E4E] focus:ring-2 focus:ring-[#C56E4E]/10"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Selected service */}
            <section>
              <h2 className="mb-4 flex items-center justify-between font-serif text-lg font-bold">
                <span>2. Selected Ritual</span>
                <span className="rounded-full border border-[#EADBD2] bg-[#FFF6F0] px-3 py-1 text-xs font-bold text-[#C56E4E]">
                  Primary Service
                </span>
              </h2>

              <div className="flex items-center gap-4 rounded-[2rem] border-2 border-[#C56E4E] bg-[#FFF6F0]/50 p-4 shadow-md">
                <img
                  src={primaryService.image}
                  alt={primaryService.name}
                  className="h-16 w-16 rounded-2xl object-cover bg-white shadow-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-base font-bold truncate">
                    {primaryService.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#8C7A70]">
                    <Clock size={12} className="mr-1 inline" />
                    {primaryService.duration}
                  </p>
                </div>
                <strong className="font-serif text-lg font-bold text-[#C56E4E] shrink-0">
                  ₹{primaryService.price}
                </strong>
              </div>

              {additionalSelectedServices.length > 0 && (
                <div className="mt-3 space-y-2">
                  {additionalSelectedServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] p-3 text-xs font-bold text-[#5C4841]"
                    >
                      <span className="truncate pr-2">+ {service.name}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-serif text-sm text-[#2D2623]">
                          ₹{service.price}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => removeAdditionalService(service.id, e)}
                          className="rounded-lg p-1 text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recommended Add-on Rituals */}
            {recommendedServices.length > 0 && (
              <section>
                <h2 className="mb-3 font-serif text-sm font-bold uppercase tracking-wider text-[#8C7A70]">
                  Recommended Add-on Rituals
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recommendedServices.map((service) => {
                    const isAdded = selectedServiceIds.includes(service.id);
                    return (
                      <motion.button
                        key={service.id}
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleRecommendedService(service.id)}
                        className={`group flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left shadow-sm transition-all ${
                          isAdded
                            ? "border-[#C56E4E] bg-[#FFF6F0] ring-2 ring-[#C56E4E]/20"
                            : "border-[#EADBD2] bg-[#FCF9F6] hover:border-[#C56E4E]"
                        }`}
                      >
                        <img
                          src={service.image}
                          alt={service.name}
                          className="h-12 w-12 rounded-xl object-cover bg-white shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80";
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-serif text-xs font-bold">
                            {service.name}
                          </h4>
                          <span className="font-serif text-xs font-bold text-[#C56E4E]">
                            ₹{service.price}
                          </span>
                        </div>
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                            isAdded
                              ? "border-[#C56E4E] bg-[#C56E4E] text-white"
                              : "border-[#EADBD2] text-[#8C7A70] group-hover:border-[#C56E4E] group-hover:text-[#C56E4E]"
                          }`}
                        >
                          {isAdded ? <Check size={14} /> : <Plus size={14} />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Doorstep Address */}
            <section>
              <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <h2 className="font-serif text-lg font-bold">
                  3. Doorstep Address
                </h2>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#C56E4E]/40 bg-[#FFF6F0] px-3.5 py-2 text-xs font-bold text-[#C56E4E] shadow-sm transition hover:bg-[#FFF0E7] disabled:cursor-wait disabled:opacity-60"
                >
                  {locating ? <RefreshCw size={14} className="animate-spin" /> : <LocateFixed size={14} />}
                  {locating ? "Detecting location..." : "Detect my location"}
                </button>
              </div>

              {savedAddresses.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#8C7A70]">
                    Select from Saved Addresses
                  </p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {savedAddresses.map((saved) => {
                      const savedId = saved._id || saved.id || saved.fullAddress;
                      const fullAddr = saved.fullAddress || saved.address || "";
                      const isSelected = address === fullAddr;
                      const label = saved.label || "Home";

                      return (
                        <button
                          key={savedId}
                          type="button"
                          onClick={() => handleSelectSavedAddress(saved)}
                          className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition ${
                            isSelected
                              ? "border-[#C56E4E] bg-[#FFF6F0] ring-2 ring-[#C56E4E]/15"
                              : "border-[#EADBD2] bg-[#FCF9F6] hover:border-[#C56E4E]/50"
                          }`}
                        >
                          <div className="mt-0.5 rounded-xl bg-white p-2 text-[#C56E4E] shadow-sm">
                            {label === "Office" ? <Briefcase size={16} /> : <Home size={16} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-[#C56E4E] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                                {label}
                              </span>
                              {isSelected && <span className="text-[10px] font-bold text-[#C56E4E]">Active</span>}
                            </div>
                            <p className="mt-1 line-clamp-2 text-[11px] text-[#8C7A70]">
                              {fullAddr}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-4 text-[#8C7A70]" />
                <textarea
                  rows={4}
                  value={address}
                  onChange={handleAddressChange}
                  placeholder="Enter house / flat number, street, area, city, state and nearby landmark..."
                  className="w-full resize-y rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] p-4 pl-11 text-sm font-medium text-[#2D2623] outline-none transition focus:border-[#C56E4E] focus:ring-2 focus:ring-[#C56E4E]/10"
                  required
                />
              </div>

              {locationCoordinates && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-800">
                  <MapPinned size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">GPS Coordinates detected</p>
                    <p className="mt-1 break-all">
                      {locationCoordinates.latitude.toFixed(6)}, {locationCoordinates.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Date and time */}
            <section>
              <h2 className="mb-4 font-serif text-lg font-bold">
                4. Preferred Schedule
              </h2>

              <div className="space-y-5 rounded-3xl border border-[#EADBD2] bg-[#FCF9F6] p-5">
                {/* Realtime Next 5 Days Selector */}
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A70]">
                      Select Date (Next 5 Days)
                    </label>
                    <input
                      type="date"
                      value={date}
                      min={today}
                      onChange={(event) => {
                        setDate(event.target.value);
                        setTime("");
                        setError("");
                      }}
                      className="cursor-pointer text-[11px] font-bold text-[#C56E4E] bg-transparent outline-none hover:underline"
                      title="Pick custom date"
                    />
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {nextFiveDays.map((item) => {
                      const isSelected = date === item.dateString;
                      return (
                        <button
                          key={item.dateString}
                          type="button"
                          onClick={() => {
                            setDate(item.dateString);
                            setTime("");
                            setError("");
                          }}
                          className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 text-center transition-all ${
                            isSelected
                              ? "border-[#C56E4E] bg-[#C56E4E] text-white shadow-md ring-2 ring-[#C56E4E]/20"
                              : "border-[#EADBD2] bg-white text-[#5C4841] hover:border-[#C56E4E]"
                          }`}
                        >
                          <span className={`text-[10px] font-bold uppercase ${isSelected ? "text-white/90" : "text-[#8C7A70]"}`}>
                            {item.label}
                          </span>
                          <span className="my-0.5 font-serif text-base font-bold">
                            {item.dayNum}
                          </span>
                          <span className={`text-[10px] font-semibold ${isSelected ? "text-white/80" : "text-[#8C7A70]"}`}>
                            {item.month}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-[#8C7A70]">
                    <CheckCircle2 size={14} className="text-[#1E9E4A]" />
                    Selected: <strong className="text-[#2D2623]">{formatDisplayDate(date)}</strong>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A70]">
                      Available Time Slots
                    </label>
                    <span className="text-[10px] text-[#8C7A70]">
                      Strikethrough indicates booked or past slots
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {availableTimeSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = time === slot;
                      const isPast =
                        date === today &&
                        parseSlotToMinutes(slot) >= 0 &&
                        parseSlotToMinutes(slot) <=
                          liveNow.getHours() * 60 + liveNow.getMinutes();

                      const unavailable = isBooked || isPast;

                      return (
                        <div key={slot} className="relative">
                          <button
                            type="button"
                            disabled={unavailable}
                            onClick={() => {
                              if (unavailable) return;
                              setTime(slot);
                              setError("");
                            }}
                            onMouseEnter={() => unavailable && setHoveredSlot(slot)}
                            onMouseLeave={() => setHoveredSlot(null)}
                            className={`w-full rounded-xl border px-3 py-3 text-xs font-bold transition-all ${
                              unavailable
                                ? "cursor-not-allowed border-[#EADBD2] bg-[#EADBD2]/40 text-[#A39292] line-through opacity-70"
                                : isSelected
                                ? "cursor-pointer border-[#C56E4E] bg-[#C56E4E] text-white shadow-md"
                                : "cursor-pointer border-[#EADBD2] bg-white text-[#5C4841] hover:border-[#C56E4E]"
                            }`}
                          >
                            {slot}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="mb-4 font-serif text-lg font-bold">
                5. Payment Method
              </h2>

              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                  <div className="flex items-start gap-2.5">
                    <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
                    <div>
                      <p className="font-bold">Online Payments Notice</p>
                      <p className="mt-0.5 leading-relaxed">
                        UPI & card (online payments) are temporarily unavailable.
                        Please proceed with <strong>Cash on Delivery (COD)</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 opacity-60">
                  <div className="flex items-center gap-3 rounded-2xl border border-[#EADBD2] bg-white p-4 text-left cursor-not-allowed">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#C56E4E] shadow-sm">
                      <Smartphone size={23} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#2D2623]">UPI Payment</p>
                      <p className="mt-1 text-xs text-[#8C7A70]">Temporarily Unavailable</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#EADBD2] bg-white p-4 text-left cursor-not-allowed">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
                      <CreditCard size={23} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#2D2623]">Credit / Debit Card</p>
                      <p className="mt-1 text-xs text-[#8C7A70]">Temporarily Unavailable</p>
                    </div>
                  </div>
                </div>

                {/* Active COD Option */}
                <div className="flex items-center gap-3 rounded-2xl border-2 border-[#C56E4E] bg-[#FFF6F0] p-4 text-left shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C56E4E] text-white shadow-sm">
                    <Check size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#2D2623]">Cash on Delivery (COD)</p>
                    <p className="mt-1 text-xs text-[#8C7A70]">Pay directly after service completion</p>
                  </div>
                  <span className="rounded-full bg-[#C56E4E] px-3 py-1 text-[10px] font-bold text-white uppercase">
                    Active
                  </span>
                </div>
              </div>
            </section>
          </motion.div>

          {/* RIGHT PREVIEW PANEL */}
          <motion.aside
            variants={fadeUp}
            className="space-y-6 lg:sticky lg:top-6 lg:col-span-5"
          >
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#2D2623] to-[#433632] p-6 text-white shadow-2xl sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#C56E4E] opacity-30 blur-3xl" />

              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <QrCode size={20} className="text-[#E5A024]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D3C5BF]">
                    VIP Pass Preview
                  </span>
                </div>
                <span className="rounded-full border border-[#C56E4E]/30 bg-[#C56E4E]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E5A024]">
                  Home Service
                </span>
              </div>

              <div className="mb-6 space-y-5">
                <div>
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-[#A39292]">
                    Customer Details
                  </span>
                  <p className="text-sm font-bold text-white">
                    {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Guest User"}
                  </p>
                  <p className="text-xs text-[#D3C5BF]">
                    {mobileNumber ? `+91 ${mobileNumber}` : "No mobile provided"}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-[#A39292]">
                    Primary Ritual
                  </span>
                  <h3 className="font-serif text-xl font-bold">
                    {primaryService.name}
                  </h3>
                  {additionalSelectedServices.length > 0 && (
                    <p className="mt-1 text-[11px] text-[#E5A024]">
                      + {additionalSelectedServices.length} add-on ritual(s) added
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-[#D3C5BF]">
                  <div>
                    <span className="mb-1 block text-[9px] uppercase tracking-wider text-[#A39292]">
                      Appointment Date
                    </span>
                    <strong className="text-white">{formatDisplayDate(date)}</strong>
                  </div>
                  <div>
                    <span className="mb-1 block text-[9px] uppercase tracking-wider text-[#A39292]">
                      Time Slot
                    </span>
                    <strong className="text-white">{time || "Select time"}</strong>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <span className="mb-1 block text-[9px] uppercase tracking-wider text-[#A39292]">
                    Home Address
                  </span>
                  <p className="line-clamp-3 break-words text-xs text-white/90">
                    {address || "Enter your address or detect your location."}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <span className="mb-1 block text-[9px] uppercase tracking-wider text-[#A39292]">
                    Payment Preference
                  </span>
                  <p className="text-xs font-semibold text-white">
                    Cash on Delivery (COD)
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs text-[#D3C5BF]">Estimated Total</span>
                  <span className="font-serif text-2xl font-bold text-[#E5A024]">
                    ₹{totalCalculatedPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#A39292]">
                <ShieldCheck size={14} className="text-[#E5A024]" />
                Secure checkout · Booking confirmation follows server validation
              </div>
            </div>

            {/* Error & Submit */}
            <div className="rounded-[2.5rem] border border-[#EADBD2] bg-white p-6 shadow-sm">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 flex items-start gap-2 rounded-2xl border border-[#F8D7DA] bg-[#FDF2F2] p-3 text-xs font-semibold text-[#B33A3A]"
                  >
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={submitting || !primaryService.id}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#C56E4E] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-xl transition-all hover:-translate-y-0.5 hover:bg-[#A35539] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Preparing checkout...
                  </>
                ) : (
                  <>
                    Continue to Checkout
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-[11px] font-medium text-[#8C7A70]">
                Need help?{" "}
                <Link to="/help" className="font-bold text-[#C56E4E] underline">
                  Visit our support center
                </Link>
              </p>
            </div>
          </motion.aside>
        </form>
      </motion.main>
    </div>
  );
}
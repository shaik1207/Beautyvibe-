import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Gift,
  HelpCircle,
  FileText,
  MessageSquare,
  LogOut,
  ChevronRight,
  Check,
  X,
  Plus,
  Trash2,
  CreditCard,
  Smartphone,
  LocateFixed,
  RefreshCw,
  Mail,
  Phone,
  ShieldCheck,
  Navigation,
  Home,
  Briefcase,
  MapPinned,
  Lock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import API from "../services/axios";
import { useAuth } from "../context/AuthContext";

/* =========================================
   HELPERS & ROBUST STORAGE HYDRATION
========================================= */

const parseJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
  } catch {
    return {};
  }
};

const getFreshUserData = (authUser) => {
  let userObj = {};

  // Check all possible local storage keys used across authentication flows
  const storageKeys = ["userInfo", "user", "beautyvibe_user", "firebase_user"];
  for (const key of storageKeys) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          userObj = { ...userObj, ...parsed };
        }
      }
    } catch (e) {
      console.warn(`Error reading ${key} from storage:`, e);
    }
  }

  // Check stored JWT tokens
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("beautyvibe_token") ||
    localStorage.getItem("beautyvibe_user_token");

  if (token) {
    userObj = { ...userObj, ...parseJwt(token) };
  }

  // Merge with AuthContext user if available
  if (authUser) {
    userObj = { ...userObj, ...authUser };
  }

  const fullName =
    userObj.name ||
    userObj.fullName ||
    userObj.displayName ||
    `${userObj.firstName || userObj.first_name || ""} ${userObj.lastName || userObj.last_name || ""}`.trim();

  const nameParts = fullName.split(/\s+/).filter(Boolean);

  return {
    firstName: userObj.firstName || userObj.first_name || nameParts[0] || "",
    lastName: userObj.lastName || userObj.last_name || nameParts.slice(1).join(" ") || "",
    email: userObj.email || userObj.emailAddress || userObj.sub || "",
    phone: userObj.phone || userObj.phoneNumber || userObj.mobile || userObj.contact || "",
  };
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 75, damping: 18 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const inputClass =
  "w-full rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] px-4 py-3.5 text-sm font-medium text-[#2D2623] outline-none transition-all placeholder:text-[#B5A69D] focus:border-[#C56E4E] focus:ring-4 focus:ring-[#C56E4E]/10";

const labelClass =
  "mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#8C7A70]";

/* =========================================
   SOCIAL ICONS
========================================= */

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-[#E1306C]">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-red-600">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-[#0A66C2]">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

/* =========================================
   PREMIUM 3D CARD
========================================= */

function AnimatedPaymentCard({ card, flipped }) {
  const formattedNumber =
    card.number.replace(/\D/g, "").match(/.{1,4}/g)?.join(" ") ||
    "•••• •••• •••• ••••";

  return (
    <div className="mx-auto w-full max-w-[390px] [perspective:1200px]">
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.75, type: "spring", stiffness: 100, damping: 16 }}
        className="relative aspect-[1.65/1] w-full [transform-style:preserve-3d]"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[26px] border border-white/20 bg-gradient-to-br from-[#38251F] via-[#8F4935] to-[#C56E4E] p-6 text-white shadow-2xl [backface-visibility:hidden]">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -right-8 -top-16 h-48 w-48 rounded-full border border-white/10" />
          <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-[#E5A17B]/20 blur-3xl" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/65">
                BeautyVibe
              </p>
              <p className="mt-1 font-serif text-xl tracking-wide">Premium</p>
            </div>
            <CreditCard size={29} className="text-white/85" />
          </div>

          <div className="relative mt-7 flex items-center gap-3">
            <div className="h-9 w-12 rounded-lg border border-white/30 bg-gradient-to-br from-[#F4D9A4] to-[#B58B50] shadow-inner" />
            <span className="text-[10px] tracking-[0.2em] text-white/60">
              {card.number ? "CARD MEMBER" : "PREMIUM MEMBER"}
            </span>
          </div>

          <p className="relative mt-5 font-mono text-lg tracking-[0.13em] sm:text-xl">
            {formattedNumber}
          </p>

          <div className="relative mt-5 flex items-end justify-between">
            <div className="min-w-0">
              <p className="text-[8px] uppercase tracking-[0.2em] text-white/55">
                Cardholder
              </p>
              <p className="mt-1 truncate text-xs font-semibold uppercase tracking-wider">
                {card.holder || "YOUR NAME"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[8px] uppercase tracking-[0.2em] text-white/55">
                Expires
              </p>
              <p className="mt-1 font-mono text-xs">
                {card.expiry || "MM/YY"}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden rounded-[26px] border border-white/20 bg-gradient-to-br from-[#38251F] via-[#71402F] to-[#A65B42] p-6 text-white shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-right text-[9px] uppercase tracking-[0.2em] text-white/60">
            Secure payment
          </p>

          <div className="absolute left-0 right-0 top-14 h-12 bg-[#171311]" />

          <div className="relative mt-20 flex items-center justify-end gap-3">
            <span className="text-[9px] uppercase tracking-widest text-white/60">
              CVV
            </span>
            <div className="flex h-9 min-w-16 items-center justify-center rounded-lg bg-white px-3 font-mono text-sm tracking-[0.25em] text-[#2D2623]">
              {card.cvv ? "•••" : "•••"}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================
   MAIN SETTINGS COMPONENT
========================================= */

export default function Settings() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  // Profile State
  const [profile, setProfile] = useState(() => getFreshUserData(authUser));
  const [profileSaving, setProfileSaving] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState(() => {
    try {
      const local = localStorage.getItem("beautyvibe_addresses");
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  const [addressLoading, setAddressLoading] = useState(false);
  const [addressMode, setAddressMode] = useState("manual");
  const [locating, setLocating] = useState(false);

  const [newAddress, setNewAddress] = useState({
    label: "Home",
    houseNo: "",
    street: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    fullAddress: "",
    latitude: null,
    longitude: null,
  });

  // Payments State
  const [payments, setPayments] = useState(() => {
    try {
      const local = localStorage.getItem("beautyvibe_payments");
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  const [paymentType, setPaymentType] = useState("upi");
  const [upiIdInput, setUpiIdInput] = useState("");

  const [cardInput, setCardInput] = useState({
    number: "",
    holder: "",
    expiry: "",
    cvv: "",
  });

  const [cardFlipped, setCardFlipped] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Preferences State
  const [pushNotifs, setPushNotifs] = useState(
    () => JSON.parse(localStorage.getItem("beautyvibe_push") ?? "true")
  );

  const [emailAlerts, setEmailAlerts] = useState(
    () => JSON.parse(localStorage.getItem("beautyvibe_email") ?? "true")
  );

  const [locationSharing, setLocationSharing] = useState(
    () => JSON.parse(localStorage.getItem("beautyvibe_loc") ?? "true")
  );

  const websiteUrl = "https://beautyvibe.app/invite?ref=sameer22";

  /* =========================================
     TOAST NOTIFICATIONS
  ========================================= */
  const notify = useCallback((message, type = "success") => {
    setToast({ message, type });
    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, []);

  /* =========================================
     GUARANTEED PROFILE SYNC WHEN MODAL OPENS
  ========================================= */
  useEffect(() => {
    if (activeModal === "profile") {
      const freshData = getFreshUserData(authUser);
      setProfile(freshData);
    }
  }, [activeModal, authUser]);

  /* =========================================
     INITIAL API HYDRATION
  ========================================= */
  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      setLoading(true);

      const fetchWithFallback = async (endpoints) => {
        for (const ep of endpoints) {
          try {
            const res = await API.get(ep);
            return res;
          } catch (err) {
            if (err?.response?.status && err.response.status !== 404) {
              throw err;
            }
          }
        }
        throw new Error("All endpoints returned 404");
      };

      const [profileResult, addressResult, paymentResult] =
        await Promise.allSettled([
          fetchWithFallback(["/api/users/profile", "/api/users/me", "/api/user/profile", "/profile"]),
          fetchWithFallback(["/api/users/addresses", "/api/user/addresses", "/addresses"]),
          fetchWithFallback(["/api/users/payments", "/api/user/payments", "/payments"]),
        ]);

      if (cancelled) return;

      if (profileResult.status === "fulfilled") {
        const data = profileResult.value.data;
        const user = data?.user || data?.data || data;

        if (user && typeof user === "object") {
          const fullName = user.name || user.fullName || `${user.firstName || user.first_name || ""} ${user.lastName || user.last_name || ""}`.trim();
          const nameParts = fullName.split(/\s+/).filter(Boolean);

          const fetchedProfile = {
            firstName: user.firstName || user.first_name || nameParts[0] || "",
            lastName: user.lastName || user.last_name || nameParts.slice(1).join(" ") || "",
            email: user.email || user.emailAddress || user.sub || "",
            phone: user.phone || user.phoneNumber || user.mobile || "",
          };

          setProfile(fetchedProfile);

          try {
            localStorage.setItem("userInfo", JSON.stringify({ ...user, ...fetchedProfile }));
          } catch (e) {
            console.warn("Storage error:", e);
          }
        }
      }

      if (addressResult.status === "fulfilled") {
        const data = addressResult.value.data;
        const list = data?.data || data?.addresses || data;
        if (Array.isArray(list) && list.length > 0) {
          setAddresses(list);
          localStorage.setItem("beautyvibe_addresses", JSON.stringify(list));
        }
      }

      if (paymentResult.status === "fulfilled") {
        const data = paymentResult.value.data;
        const list = data?.data || data?.payments || data;
        if (Array.isArray(list) && list.length > 0) {
          setPayments(list);
          localStorage.setItem("beautyvibe_payments", JSON.stringify(list));
        }
      }

      setLoading(false);
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================
     PROFILE HANDLERS
  ========================================= */

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((previous) => ({ ...previous, [name]: value }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setProfileSaving(true);

    const payload = {
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      name: `${profile.firstName} ${profile.lastName}`.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
    };

    const endpoints = ["/api/users/profile", "/api/users/me", "/api/user/profile", "/profile"];

    let success = false;
    for (const ep of endpoints) {
      try {
        await API.put(ep, payload);
        success = true;
        break;
      } catch (err) {
        if (err?.response?.status && err.response.status !== 404) break;
      }
    }

    setProfileSaving(false);

    // Save locally to ensure instant persistence
    localStorage.setItem("userInfo", JSON.stringify(payload));
    setProfile(payload);
    notify("Profile updated successfully.", "success");
    setActiveModal(null);
  };

  /* =========================================
     ADDRESS HANDLERS WITH OPTIMISTIC FALLBACK
  ========================================= */

  const updateAddressField = (event) => {
    const { name, value } = event.target;
    setNewAddress((previous) => ({ ...previous, [name]: value }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      notify("Your browser does not support GPS location.", "error");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: "application/json" } }
          );
          if (!response.ok) throw new Error("Lookup failed");
          const data = await response.json();
          const address = data.address || {};

          setNewAddress((previous) => ({
            ...previous,
            fullAddress: data.display_name || "",
            area: address.suburb || address.neighbourhood || address.town || "",
            city: address.city || address.town || address.county || "",
            state: address.state || "",
            pincode: address.postcode || "",
            latitude,
            longitude,
          }));

          setAddressMode("manual");
          notify("Location detected. Please verify your address.", "success");
        } catch {
          setNewAddress((previous) => ({
            ...previous,
            latitude,
            longitude,
            fullAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }));
          setAddressMode("manual");
          notify("GPS coordinates captured.", "success");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        notify("Unable to detect your location.", "error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSaveAddress = async (event) => {
    event.preventDefault();

    const parts = [
      newAddress.houseNo,
      newAddress.street,
      newAddress.area,
      newAddress.city,
      newAddress.state,
      newAddress.pincode,
      newAddress.landmark ? `Landmark: ${newAddress.landmark}` : "",
    ].filter(Boolean);

    const fullAddress = newAddress.fullAddress || parts.join(", ");

    if (!fullAddress.trim()) {
      notify("Please enter an address or detect your location.", "error");
      return;
    }

    const payload = {
      label: newAddress.label,
      houseNo: newAddress.houseNo,
      street: newAddress.street,
      area: newAddress.area,
      city: newAddress.city,
      state: newAddress.state,
      pincode: newAddress.pincode,
      landmark: newAddress.landmark,
      fullAddress,
      coordinates:
        newAddress.latitude && newAddress.longitude
          ? { latitude: newAddress.latitude, longitude: newAddress.longitude }
          : null,
    };

    setAddressLoading(true);

    const endpoints = ["/api/users/addresses", "/api/user/addresses", "/addresses"];
    let responseData = null;

    for (const ep of endpoints) {
      try {
        const response = await API.post(ep, payload);
        responseData = response.data?.data || response.data?.addresses || response.data;
        break;
      } catch (err) {
        if (err?.response?.status && err.response.status !== 404) {
          console.warn("Address save warning:", err.message);
        }
      }
    }

    setAddressLoading(false);

    const savedAddress = Array.isArray(responseData)
      ? responseData[responseData.length - 1]
      : responseData && typeof responseData === "object"
      ? responseData
      : { id: Date.now().toString(), ...payload };

    const updatedList = [...addresses, savedAddress];
    setAddresses(updatedList);
    localStorage.setItem("beautyvibe_addresses", JSON.stringify(updatedList));

    setNewAddress({
      label: "Home",
      houseNo: "",
      street: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      fullAddress: "",
      latitude: null,
      longitude: null,
    });

    setActiveModal("addresses");
    notify("Address saved successfully.", "success");
  };

  const handleDeleteAddress = async (id) => {
    const endpoints = [`/api/users/addresses/${id}`, `/api/user/addresses/${id}`, `/addresses/${id}`];
    for (const ep of endpoints) {
      try {
        await API.delete(ep);
        break;
      } catch (err) {
        if (err?.response?.status && err.response.status !== 404) break;
      }
    }

    const updated = addresses.filter((address) => (address._id || address.id) !== id);
    setAddresses(updated);
    localStorage.setItem("beautyvibe_addresses", JSON.stringify(updated));
    notify("Address deleted successfully.", "success");
  };

  /* =========================================
     PAYMENT HANDLERS WITH OPTIMISTIC FALLBACK
  ========================================= */

  const handleCardChange = (event) => {
    const { name, value } = event.target;

    if (name === "number") {
      const digits = value.replace(/\D/g, "").slice(0, 19);
      const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
      setCardInput((previous) => ({ ...previous, number: formatted }));
      return;
    }

    if (name === "expiry") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
      setCardInput((previous) => ({ ...previous, expiry: formatted }));
      return;
    }

    if (name === "cvv") {
      setCardInput((previous) => ({ ...previous, cvv: value.replace(/\D/g, "").slice(0, 4) }));
      return;
    }

    setCardInput((previous) => ({ ...previous, [name]: value }));
  };

  const handleAddPayment = async (event) => {
    event.preventDefault();
    setPaymentLoading(true);

    let payload;

    if (paymentType === "upi") {
      if (!upiIdInput.trim()) {
        notify("Please enter your UPI ID.", "error");
        setPaymentLoading(false);
        return;
      }
      payload = { type: "UPI", identifier: upiIdInput.trim() };
    } else {
      const digits = cardInput.number.replace(/\D/g, "");

      if (digits.length < 12 || !cardInput.holder.trim()) {
        notify("Please enter valid card details.", "error");
        setPaymentLoading(false);
        return;
      }

      payload = {
        type: "CARD",
        identifier: `**** **** **** ${digits.slice(-4)}`,
        last4: digits.slice(-4),
        holder: cardInput.holder.trim(),
        expiry: cardInput.expiry,
      };
    }

    const endpoints = ["/api/users/payments", "/api/user/payments", "/payments"];
    let responseData = null;

    for (const ep of endpoints) {
      try {
        const response = await API.post(ep, payload);
        responseData = response.data?.data || response.data?.payments || response.data;
        break;
      } catch (err) {
        if (err?.response?.status && err.response.status !== 404) {
          console.warn("Payment warning:", err.message);
        }
      }
    }

    setPaymentLoading(false);

    const savedPayment = Array.isArray(responseData)
      ? responseData[responseData.length - 1]
      : responseData && typeof responseData === "object"
      ? responseData
      : { id: Date.now().toString(), ...payload };

    const updatedPayments = [...payments, savedPayment];
    setPayments(updatedPayments);
    localStorage.setItem("beautyvibe_payments", JSON.stringify(updatedPayments));

    setUpiIdInput("");
    setCardInput({ number: "", holder: "", expiry: "", cvv: "" });
    setCardFlipped(false);
    notify("Payment method saved.", "success");
  };

  const handleDeletePayment = async (id) => {
    const endpoints = [`/api/users/payments/${id}`, `/api/user/payments/${id}`, `/payments/${id}`];
    for (const ep of endpoints) {
      try {
        await API.delete(ep);
        break;
      } catch (err) {
        if (err?.response?.status && err.response.status !== 404) break;
      }
    }

    const updated = payments.filter((payment) => (payment._id || payment.id) !== id);
    setPayments(updated);
    localStorage.setItem("beautyvibe_payments", JSON.stringify(updated));
    notify("Payment method removed.", "success");
  };

  /* =========================================
     PREFERENCES & LOGOUT
  ========================================= */

  const togglePreference = (key, value) => {
    const next = !value;
    if (key === "push") {
      setPushNotifs(next);
      localStorage.setItem("beautyvibe_push", JSON.stringify(next));
    }
    if (key === "email") {
      setEmailAlerts(next);
      localStorage.setItem("beautyvibe_email", JSON.stringify(next));
    }
    if (key === "location") {
      setLocationSharing(next);
      localStorage.setItem("beautyvibe_loc", JSON.stringify(next));
    }
    notify("Preference updated.", "success");
  };

  const handleLogout = async () => {
    try {
      await API.post("/api/users/logout");
    } catch {
      // Proceed with local cleanup regardless
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    }
  };

  const handleSocialClick = (platform) => {
    const urls = {
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      linkedin: "https://linkedin.com",
    };
    if (urls[platform]) window.open(urls[platform], "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#FCF9F6]">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 animate-spin text-[#C56E4E]" size={30} />
          <p className="text-xs font-bold uppercase tracking-widest text-[#8C7A70]">
            Loading your settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FCF9F6] pb-28 font-sans text-[#2D2623]">
      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-2xl space-y-5 px-4 pb-10 pt-6 sm:px-6"
      >
        {/* ACCOUNT */}
        <motion.section
          variants={fadeUp}
          className="overflow-hidden rounded-3xl border border-[#EADBD2] bg-white shadow-sm"
        >
          <div className="px-6 pb-3 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8C7A70]">
              Account Settings
            </h3>
          </div>

          <div className="divide-y divide-[#EADBD2]/60">
            <button
              onClick={() => setActiveModal("profile")}
              className="group flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-[#FFF6F0]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EADBD2] bg-[#FFF6F0] text-[#C56E4E] transition group-hover:scale-105">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold">Edit Profile</p>
                  <p className="mt-1 text-[10px] text-[#8C7A70]">
                    {`${profile.firstName} ${profile.lastName}`.trim() || "Your profile"}
                    {" · "}
                    {profile.email || "Email not available"}
                  </p>
                </div>
              </div>
              <ChevronRight size={17} className="text-[#8C7A70]" />
            </button>

            <button
              onClick={() => setActiveModal("addresses")}
              className="group flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-[#FFF6F0]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EADBD2] bg-[#FFF6F0] text-[#C56E4E] transition group-hover:scale-105">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold">Saved Addresses</p>
                  <p className="mt-1 text-[10px] text-[#8C7A70]">
                    {addresses.length} saved location(s)
                  </p>
                </div>
              </div>
              <ChevronRight size={17} className="text-[#8C7A70]" />
            </button>

            <button
              onClick={() => setActiveModal("payments")}
              className="group flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-[#FFF6F0]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EADBD2] bg-[#FFF6F0] text-[#C56E4E] transition group-hover:scale-105">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold">Payments</p>
                  <p className="mt-1 text-[10px] text-[#8C7A70]">
                    {payments.length} saved payment method(s)
                  </p>
                </div>
              </div>
              <ChevronRight size={17} className="text-[#8C7A70]" />
            </button>
          </div>
        </motion.section>

        {/* EARN */}
        <motion.section
          variants={fadeUp}
          className="overflow-hidden rounded-3xl border border-[#EADBD2] bg-white shadow-sm"
        >
          <div className="px-6 pb-3 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8C7A70]">
              Earn with BeautyVibe
            </h3>
          </div>

          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(websiteUrl);
                notify("Referral link copied.", "success");
              } catch {
                notify("Unable to copy referral link.", "error");
              }
            }}
            className="flex w-full items-center justify-between border-t border-[#EADBD2]/60 px-6 py-5 text-left transition hover:bg-[#FFF6F0]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EADBD2] bg-[#FFF6F0] text-[#C56E4E]">
                <Gift size={18} />
              </div>
              <div>
                <p className="text-xs font-bold">BeautyVibe Affiliate Program</p>
                <p className="mt-1 text-[10px] text-[#8C7A70]">Refer friends and earn rewards</p>
              </div>
            </div>
            <ChevronRight size={17} className="text-[#8C7A70]" />
          </button>
        </motion.section>

        {/* HELP */}
        <motion.section
          variants={fadeUp}
          className="overflow-hidden rounded-3xl border border-[#EADBD2] bg-white shadow-sm"
        >
          <div className="px-6 pb-3 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8C7A70]">
              Help & Information
            </h3>
          </div>

          {[
            { id: "faq", title: "Frequently Asked Questions", icon: HelpCircle },
            { id: "terms", title: "Terms, Policies & Licences", icon: FileText },
            { id: "qa", title: "Questions & Answers", icon: MessageSquare },
          ].map(({ id, title, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveModal(id)}
              className="flex w-full items-center justify-between border-t border-[#EADBD2]/60 px-6 py-5 text-left transition hover:bg-[#FFF6F0]"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EADBD2] bg-[#FFF6F0] text-[#C56E4E]">
                  <Icon size={18} />
                </span>
                <span className="text-xs font-bold">{title}</span>
              </span>
              <ChevronRight size={17} className="text-[#8C7A70]" />
            </button>
          ))}
        </motion.section>

        {/* PREFERENCES */}
        <motion.section
          variants={fadeUp}
          className="space-y-5 rounded-3xl border border-[#EADBD2] bg-white p-6 shadow-sm"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#8C7A70]">
            App Preferences
          </h3>

          {[
            { key: "push", title: "Push Notifications", description: "Booking updates and arrival alerts", value: pushNotifs },
            { key: "email", title: "Email Invoices", description: "Receive digital bills and updates", value: emailAlerts },
            { key: "location", title: "Location Sharing", description: "Allow automatic location detection", value: locationSharing },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold">{item.title}</p>
                <p className="mt-1 text-[10px] text-[#8C7A70]">{item.description}</p>
              </div>

              <button
                type="button"
                aria-label={`Toggle ${item.title}`}
                aria-pressed={item.value}
                onClick={() => togglePreference(item.key, item.value)}
                className={`relative h-6 w-12 shrink-0 rounded-full p-1 transition-colors ${
                  item.value ? "bg-[#C56E4E]" : "bg-[#EADBD2]"
                }`}
              >
                <motion.span
                  animate={{ x: item.value ? 24 : 0 }}
                  className="block h-4 w-4 rounded-full bg-white shadow"
                />
              </button>
            </div>
          ))}
        </motion.section>

        {/* SOCIAL */}
        <motion.section
          variants={fadeUp}
          className="rounded-3xl border border-[#EADBD2] bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#8C7A70]">
            Follow BeautyVibe
          </h3>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSocialClick("instagram")}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] px-2 py-3 text-[10px] font-bold transition hover:border-[#E1306C]"
            >
              <InstagramIcon />
              Instagram
            </button>
            <button
              onClick={() => handleSocialClick("youtube")}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] px-2 py-3 text-[10px] font-bold transition hover:border-red-500"
            >
              <YouTubeIcon />
              YouTube
            </button>
            <button
              onClick={() => handleSocialClick("linkedin")}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] px-2 py-3 text-[10px] font-bold transition hover:border-blue-500"
            >
              <LinkedInIcon />
              LinkedIn
            </button>
          </div>
        </motion.section>

        {/* LOGOUT */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 pt-5">
          <button
            onClick={() => setLogoutConfirm(true)}
            className="flex w-full max-w-xs items-center justify-center gap-2 rounded-full border-2 border-[#C56E4E] bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-[#C56E4E] shadow-sm transition hover:-translate-y-1 hover:bg-[#C56E4E] hover:text-white"
          >
            <LogOut size={16} />
            Log out
          </button>
          <p className="text-[10px] font-medium tracking-widest text-[#A89489]">
            BEAUTYVIBE · VERSION 12.0
          </p>
        </motion.div>
      </motion.main>

      {/* MODALS */}
      <AnimatePresence>
        {activeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 z-50 bg-[#2D2623]/55 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 25 }}
              transition={{ type: "spring", stiffness: 110, damping: 18 }}
              className="fixed inset-0 z-50 m-auto h-[88vh] max-h-[850px] w-[92%] max-w-xl overflow-y-auto rounded-[2rem] border border-[#EADBD2] bg-white p-5 shadow-2xl sm:p-8"
            >
              <div className="sticky top-0 z-20 mb-6 flex items-center justify-between border-b border-[#EADBD2] bg-white pb-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C56E4E]">
                    BeautyVibe Account
                  </p>
                  <h2 className="mt-1 font-serif text-xl font-bold text-[#2D2623]">
                    {activeModal === "profile" && "Edit Profile"}
                    {activeModal === "addresses" && "Saved Addresses"}
                    {activeModal === "addAddress" && "Add New Address"}
                    {activeModal === "payments" && "Payment Methods"}
                    {activeModal === "faq" && "Frequently Asked Questions"}
                    {activeModal === "terms" && "Terms & Policies"}
                    {activeModal === "qa" && "Questions & Answers"}
                  </h2>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="rounded-full bg-[#FFF6F0] p-2.5 text-[#8C7A70] transition hover:text-[#C56E4E]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* PROFILE MODAL */}
              {activeModal === "profile" && (
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="rounded-2xl border border-[#EADBD2] bg-gradient-to-r from-[#FFF6F0] to-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C56E4E] text-white">
                        <User size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold">
                          {`${profile.firstName} ${profile.lastName}`.trim() || "Your account"}
                        </p>
                        <p className="truncate text-[10px] text-[#8C7A70]">
                          {profile.email || "Email not available"}
                        </p>
                      </div>
                      <ShieldCheck className="ml-auto shrink-0 text-[#C56E4E]" size={20} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleProfileChange}
                        placeholder="First name"
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleProfileChange}
                        placeholder="Last name"
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A89489]" size={17} />
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        placeholder="your@email.com"
                        className={`${inputClass} pl-11`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A89489]" size={17} />
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        placeholder="Enter mobile number"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full rounded-full bg-[#C56E4E] py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition hover:bg-[#A35539] disabled:opacity-50"
                  >
                    {profileSaving ? "Saving Profile..." : "Save Profile Changes"}
                  </button>
                </form>
              )}

              {/* ADDRESS LIST */}
              {activeModal === "addresses" && (
                <div className="space-y-5">
                  <button
                    onClick={() => setActiveModal("addAddress")}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C56E4E] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#A35539]"
                  >
                    <Plus size={16} />
                    Add New Address
                  </button>

                  {addresses.length ? (
                    <div className="space-y-3">
                      {addresses.map((address) => {
                        const id = address._id || address.id;
                        return (
                          <div
                            key={id}
                            className="flex items-start justify-between gap-3 rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] p-4"
                          >
                            <div className="flex min-w-0 gap-3">
                              <div className="rounded-xl bg-white p-2.5 text-[#C56E4E]">
                                <MapPin size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wider">
                                  {address.label || "Address"}
                                </p>
                                <p className="mt-1 break-words text-xs leading-relaxed text-[#8C7A70]">
                                  {address.fullAddress || address.address || "Address details"}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteAddress(id)}
                              className="shrink-0 rounded-xl bg-white p-2.5 text-rose-500 transition hover:bg-rose-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-[#DCC8BD] py-12 text-center">
                      <MapPin className="mx-auto mb-3 text-[#C56E4E]" size={28} />
                      <p className="text-xs font-bold">No saved addresses</p>
                      <p className="mt-1 text-[10px] text-[#8C7A70]">
                        Add your first doorstep service address.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ADD ADDRESS */}
              {activeModal === "addAddress" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#FCF9F6] p-1">
                    <button
                      onClick={() => setAddressMode("manual")}
                      className={`rounded-xl py-3 text-xs font-bold transition ${
                        addressMode === "manual" ? "bg-white text-[#C56E4E] shadow" : "text-[#8C7A70]"
                      }`}
                    >
                      <Home size={15} className="mr-1 inline" />
                      Manual Entry
                    </button>
                    <button
                      onClick={detectLocation}
                      disabled={locating}
                      className="rounded-xl py-3 text-xs font-bold text-[#C56E4E] transition hover:bg-white disabled:opacity-50"
                    >
                      {locating ? <RefreshCw size={14} className="mr-1 inline animate-spin" /> : <LocateFixed size={14} className="mr-1 inline" />}
                      {locating ? "Detecting..." : "Auto Detect"}
                    </button>
                  </div>

                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div>
                      <label className={labelClass}>Address Label</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Home", "Office", "Other"].map((label) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => setNewAddress((p) => ({ ...p, label }))}
                            className={`rounded-xl border py-3 text-xs font-bold transition ${
                              newAddress.label === label
                                ? "border-[#C56E4E] bg-[#FFF6F0] text-[#C56E4E]"
                                : "border-[#EADBD2] bg-white text-[#8C7A70]"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>House / Flat / Building</label>
                      <input
                        name="houseNo"
                        value={newAddress.houseNo}
                        onChange={updateAddressField}
                        placeholder="Flat 402, Block B"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Street / Road</label>
                      <input
                        name="street"
                        value={newAddress.street}
                        onChange={updateAddressField}
                        placeholder="Street or road name"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Area / Locality</label>
                      <input
                        name="area"
                        value={newAddress.area}
                        onChange={updateAddressField}
                        placeholder="Area or locality"
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>City</label>
                        <input
                          name="city"
                          value={newAddress.city}
                          onChange={updateAddressField}
                          placeholder="City"
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelClass}>State</label>
                        <input
                          name="state"
                          value={newAddress.state}
                          onChange={updateAddressField}
                          placeholder="State"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Pincode</label>
                        <input
                          name="pincode"
                          value={newAddress.pincode}
                          onChange={updateAddressField}
                          placeholder="Postal code"
                          className={inputClass}
                          maxLength={10}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Landmark</label>
                        <input
                          name="landmark"
                          value={newAddress.landmark}
                          onChange={updateAddressField}
                          placeholder="Nearby landmark"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={addressLoading}
                      className="w-full rounded-full bg-[#C56E4E] py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition hover:bg-[#A35539] disabled:opacity-50"
                    >
                      {addressLoading ? "Saving Address..." : "Save Address"}
                    </button>
                  </form>
                </div>
              )}

              {/* PAYMENTS */}
              {activeModal === "payments" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#FCF9F6] p-1">
                    <button
                      onClick={() => { setPaymentType("upi"); setCardFlipped(false); }}
                      className={`rounded-xl py-3 text-xs font-bold transition ${
                        paymentType === "upi" ? "bg-white text-[#C56E4E] shadow" : "text-[#8C7A70]"
                      }`}
                    >
                      UPI
                    </button>
                    <button
                      onClick={() => setPaymentType("card")}
                      className={`rounded-xl py-3 text-xs font-bold transition ${
                        paymentType === "card" ? "bg-white text-[#C56E4E] shadow" : "text-[#8C7A70]"
                      }`}
                    >
                      Card
                    </button>
                  </div>

                  {paymentType === "card" && (
                    <AnimatedPaymentCard card={cardInput} flipped={cardFlipped} />
                  )}

                  <form onSubmit={handleAddPayment} className="space-y-4">
                    {paymentType === "upi" ? (
                      <div>
                        <label className={labelClass}>UPI ID</label>
                        <div className="relative">
                          <Smartphone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A89489]" />
                          <input
                            value={upiIdInput}
                            onChange={(e) => setUpiIdInput(e.target.value)}
                            placeholder="yourname@upi"
                            className={`${inputClass} pl-11`}
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className={labelClass}>Card Number</label>
                          <input
                            name="number"
                            value={cardInput.number}
                            onChange={handleCardChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength={23}
                            className={inputClass}
                            required
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Cardholder Name</label>
                          <input
                            name="holder"
                            value={cardInput.holder}
                            onChange={handleCardChange}
                            placeholder="Name on card"
                            className={inputClass}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelClass}>Expiry Date</label>
                            <input
                              name="expiry"
                              value={cardInput.expiry}
                              onChange={handleCardChange}
                              placeholder="MM/YY"
                              maxLength={5}
                              className={inputClass}
                              required
                            />
                          </div>
                          <div>
                            <label className={labelClass}>CVV</label>
                            <input
                              name="cvv"
                              type="password"
                              value={cardInput.cvv}
                              onChange={handleCardChange}
                              onFocus={() => setCardFlipped(true)}
                              onBlur={() => setCardFlipped(false)}
                              placeholder="•••"
                              maxLength={4}
                              className={inputClass}
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={paymentLoading}
                      className="w-full rounded-full bg-[#C56E4E] py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition hover:bg-[#A35539] disabled:opacity-50"
                    >
                      {paymentLoading ? "Saving..." : "Save Payment Method"}
                    </button>
                  </form>

                  <div className="space-y-3 border-t border-[#EADBD2] pt-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#8C7A70]">
                      Saved Payment Methods
                    </h3>
                    {payments.length ? (
                      payments.map((payment) => {
                        const id = payment._id || payment.id;
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between rounded-2xl border border-[#EADBD2] bg-[#FCF9F6] p-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="rounded-xl bg-white p-2.5 text-[#C56E4E]">
                                {payment.type === "UPI" ? <Smartphone size={17} /> : <CreditCard size={17} />}
                              </div>
                              <div>
                                <p className="text-xs font-bold">{payment.type === "UPI" ? "UPI ID" : "Card"}</p>
                                <p className="mt-1 text-[10px] text-[#8C7A70]">
                                  {payment.identifier || payment.last4 || "Saved method"}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeletePayment(id)}
                              className="rounded-xl p-2 text-rose-500 transition hover:bg-rose-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="py-5 text-center text-xs text-[#8C7A70]">No saved payment methods.</p>
                    )}
                  </div>
                </div>
              )}

              {/* FAQ & TERMS */}
              {activeModal === "faq" && (
                <div className="space-y-5 text-xs leading-relaxed text-[#5C4841]">
                  <p className="font-bold">How does doorstep booking work?</p>
                  <p className="text-[#8C7A70]">Certified professionals arrive at your selected address during your chosen appointment time.</p>
                </div>
              )}
              {activeModal === "terms" && (
                <div className="space-y-5 text-xs leading-relaxed text-[#5C4841]">
                  <p><strong>1. Service Compliance:</strong> BeautyVibe services are subject to availability and hygiene standards.</p>
                </div>
              )}
              {activeModal === "qa" && (
                <div className="py-12 text-center">
                  <MessageSquare size={30} className="mx-auto mb-3 text-[#C56E4E]" />
                  <p className="text-xs font-bold">No questions yet</p>
                </div>
              )}

              <button
                onClick={() => setActiveModal(null)}
                className="mt-8 w-full rounded-full border border-[#EADBD2] bg-[#FCF9F6] py-3.5 text-xs font-bold uppercase tracking-widest text-[#5C4841] transition hover:bg-[#FFF6F0]"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* LOGOUT CONFIRMATION */}
      <AnimatePresence>
        {logoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogoutConfirm(false)}
              className="fixed inset-0 z-[70] bg-[#2D2623]/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-[71] m-auto h-fit w-[90%] max-w-sm rounded-[2rem] border border-[#EADBD2] bg-white p-7 text-center shadow-2xl"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF6F0] text-[#C56E4E]">
                <LogOut size={23} />
              </div>
              <h3 className="font-serif text-xl font-bold">Confirm Logout</h3>
              <p className="mt-2 text-xs text-[#8C7A70]">Are you sure you want to log out?</p>
              <div className="mt-7 flex gap-3">
                <button
                  onClick={() => setLogoutConfirm(false)}
                  className="flex-1 rounded-full border border-[#EADBD2] bg-[#FCF9F6] py-3 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-full bg-[#C56E4E] py-3 text-xs font-bold text-white transition hover:bg-[#A35539]"
                >
                  Yes, Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATIONS */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-6 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              key="toast-notification"
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl ${
                toast.type === "error"
                  ? "border-red-200 bg-white/95 text-red-700"
                  : "border-emerald-200 bg-white/95 text-[#2D2623]"
              }`}
            >
              {toast.type === "error" ? (
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
              ) : (
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider">
                  {toast.type === "error" ? "Action Failed" : "Success"}
                </p>
                <p className="mt-0.5 break-words text-xs leading-relaxed text-[#8C7A70]">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setToast(null)}
                className="rounded-lg p-1 text-[#8C7A70] hover:bg-[#FCF9F6]"
              >
                <X size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
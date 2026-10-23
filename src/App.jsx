import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Offers from "./pages/Offers";
import HomeService from "./pages/HomeService";

import BookAppointment from "./pages/BookAppointment";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import BookingDetails from "./pages/BookingDetails";
import Checkout from "./pages/Checkout";
import MyAccount from "./pages/MyAccount";
import Favourites from "./pages/Favourites";
import Packages from "./pages/Packages";
import Help from "./pages/Help";
import Settings from "./pages/Settings";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import NotFound from "./pages/NotFound";

import { SidebarProvider } from "./context/SidebarContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Public marketing layout: Navbar + Footer.
function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#2d2623]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Dashboard layout: Sidebar + Navbar, without Footer.
function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen bg-[#FCF9F6] text-[#2d2623] lg:flex">
        <Sidebar />
        <div className="relative flex w-full min-w-0 flex-1 flex-col">
          <Navbar />
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// Prevent authenticated users from returning to Login/Register.
function GuestRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (currentUser) {
    return <Navigate to="/main" replace />;
  }

  return children;
}

// Loading screen displayed while backend verifies the SQL JWT token.
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FCF9F6]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#EADBD2] border-t-[#C56E4E]" />
        <p className="mt-4 text-sm text-[#8C7A70]">
          Verifying your session...
        </p>
      </div>
    </div>
  );
}

// Application routes.
function AppRoutes() {
  return (
    <Routes>
      {/* Public marketing pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/home-service" element={<HomeService />} />
      </Route>

      {/* Authentication pages */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      {/* Dashboard and service pages with Sidebar & Navbar Layout */}
      <Route element={<DashboardLayout />}>
        {/* Protected customer pages (requires login + role authorization) */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
          <Route path="/main" element={<Main />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/booking-details/:id" element={<BookingDetails />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/help" element={<Help />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
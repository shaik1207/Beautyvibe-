
import { useState } from "react";
import { Link } from "react-router-dom";
import { House, ShieldCheck, Clock, MapPin } from "lucide-react";

export default function HomeService() {
  const [form, setForm] = useState({ service: "Hair Cut & Styling", date: "", time: "", address: "", phone: "" });
  const [message, setMessage] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setMessage("Your demo request is ready. Sign in and connect the booking API to submit it to SalonPro.");
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <span className="text-sm font-semibold text-purple-600">Salon care at your doorstep</span>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-6xl">Your favourite salon. Your own space.</h1>
          <p className="mt-5 leading-7 text-gray-600">Request an eligible beauty or grooming service at home. Choose your preferred time and provide your address so the team can check availability.</p>
          <div className="mt-7 space-y-3 text-gray-700"><p><ShieldCheck className="mr-2 inline text-purple-600" />Professional service experience</p><p><Clock className="mr-2 inline text-purple-600" />Preferred appointment time</p><p><MapPin className="mr-2 inline text-purple-600" />Service-area availability check</p></div>
        </div>
        <img src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1100&q=85" alt="Relaxing spa service" className="h-80 w-full rounded-3xl object-cover md:h-[450px]" />
      </section>

      <form onSubmit={submit} className="mx-auto mt-12 max-w-3xl rounded-3xl border p-6 shadow-sm md:p-9">
        <h2 className="text-2xl font-bold"><House className="mr-2 inline text-purple-600" />Request Home Service</h2>
        <p className="mt-2 text-sm text-gray-500">Submit your preferences for an availability check.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium">Service<select required value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="mt-2 w-full rounded-xl border p-3"><option>Hair Cut & Styling</option><option>Hair Spa</option><option>Facial</option><option>Manicure & Pedicure</option><option>Beard Grooming</option></select></label>
          <label className="text-sm font-medium">Preferred date<input required min={new Date().toISOString().slice(0, 10)} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-2 w-full rounded-xl border p-3" /></label>
          <label className="text-sm font-medium">Preferred time<select required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="mt-2 w-full rounded-xl border p-3"><option value="">Choose time</option><option>09:00 AM</option><option>11:00 AM</option><option>01:00 PM</option><option>03:00 PM</option><option>05:00 PM</option></select></label>
          <label className="text-sm font-medium">Phone number<input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Your contact number" className="mt-2 w-full rounded-xl border p-3" /></label>
          <label className="text-sm font-medium sm:col-span-2">Full address<textarea required rows="3" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House, street, area, city, PIN code" className="mt-2 w-full rounded-xl border p-3" /></label>
        </div>
        <button className="mt-6 w-full rounded-xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700">Request Availability</button>
        {message && <p role="status" className="mt-4 rounded-xl bg-purple-50 p-4 text-sm text-purple-800">{message}</p>}
        <p className="mt-4 text-sm text-gray-500">Already have an account? <Link to="/login" className="font-semibold text-purple-700">Sign in</Link></p>
      </form>
    </div>
  );
}

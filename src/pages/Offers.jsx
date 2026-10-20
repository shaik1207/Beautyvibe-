
import { Link } from "react-router-dom";
import { Gift, Tag, ArrowRight } from "lucide-react";

const offers = [
  { title: "Beauty Special", discount: "20% OFF", description: "On selected salon services", code: "BEAUTY20", note: "Terms apply" },
  { title: "First Booking", discount: "15% OFF", description: "For new customers", code: "WELCOME15", note: "First eligible booking" },
  { title: "Weekend Treat", discount: "10% OFF", description: "Selected weekend appointments", code: "WEEKEND10", note: "Selected services only" },
];

export default function Offers() {
  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      alert(`Coupon ${code} copied`);
    } catch {
      alert(`Use coupon code: ${code}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <section className="rounded-3xl bg-gradient-to-r from-purple-900 to-fuchsia-600 p-9 text-white md:p-14">
        <Gift size={36} />
        <h1 className="mt-5 text-4xl font-bold md:text-5xl">Offers made for you</h1>
        <p className="mt-3 max-w-xl text-purple-100">Discover promotions on eligible services and make your next salon visit extra special.</p>
        <Link to="/services" className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-purple-800">Explore Services <ArrowRight className="ml-2 inline" size={17} /></Link>
      </section>

      <div className="mt-9 grid gap-6 md:grid-cols-3">
        {offers.map((offer) => (
          <article key={offer.code} className="rounded-2xl border border-purple-100 p-7 shadow-sm">
            <div className="flex items-center justify-between"><Tag className="text-purple-600" size={28} /><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Sample offer</span></div>
            <p className="mt-5 text-3xl font-bold text-purple-700">{offer.discount}</p>
            <h2 className="mt-2 text-xl font-bold">{offer.title}</h2>
            <p className="mt-2 text-gray-600">{offer.description}</p>
            <p className="mt-4 text-xs text-gray-500">{offer.note}</p>
            <button onClick={() => copyCode(offer.code)} className="mt-5 w-full rounded-xl border border-dashed border-purple-400 bg-purple-50 p-3 font-bold tracking-widest text-purple-800">{offer.code} · Copy</button>
          </article>
        ))}
      </div>
      <p className="mt-6 text-sm text-gray-500">These are demonstration offers. Connect them to your backend before accepting coupon codes for real bookings.</p>
    </div>
  );
}

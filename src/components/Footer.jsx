import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Mail,
  MapPin,
  Phone,
  Scissors,
  Sparkles,
} from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

const quickLinks = [
  ["Home", "/"],
  ["About Us", "/about"],
  ["Our Services", "/services"],
  ["Special Offers", "/offers"],
  ["Home Service", "/home-service"],
];

const services = [
  "Hair Cut & Styling",
  "Hair Spa & Treatment",
  "Facial & Skin Care",
  "Manicure & Pedicure",
  "Bridal Makeup",
];

const footerColumns = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const footerItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="group inline-flex items-center gap-2 text-sm text-[#81746d] transition-colors duration-300 hover:text-[#c76f4f]"
      >
        <span className="h-px w-0 bg-[#c76f4f] transition-all duration-300 group-hover:w-4" />
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          {children}
        </span>
      </Link>
    </li>
  );
}

function ContactRow({ href, icon: Icon, children }) {
  const content = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fff5ef] text-[#c76f4f] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#c76f4f] group-hover:text-white">
        <Icon size={15} strokeWidth={2} />
      </span>
      <span className="leading-relaxed">{children}</span>
    </>
  );

  if (!href) {
    return <div className="flex items-start gap-3">{content}</div>;
  }

  return (
    <a
      href={href}
      className="group flex items-center gap-3 transition-colors duration-300 hover:text-[#c76f4f]"
    >
      {content}
    </a>
  );
}

export default function Footer() {
  const prefersReducedMotion = useReducedMotion();

  const floatingTransition = prefersReducedMotion
    ? {}
    : {
        y: [0, -14, 0],
        opacity: [0.25, 0.6, 0.25],
        transition: {
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };

  return (
    <footer className="relative overflow-hidden border-t border-[#eadbd2] bg-[#fffdfa] font-sans text-[#2d2623]">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#ffd9c6]/40 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#f5b28d]/20 blur-3xl" />

        <motion.div
          animate={floatingTransition}
          className="absolute left-[8%] top-20 h-3 w-3 rounded-full bg-[#d57b5a]/50"
        />
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [0, 18, 0],
                  rotate: [0, 90, 180],
                  transition: {
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
          }
          className="absolute right-[15%] top-16 h-5 w-5 rounded-full border border-[#d57b5a]/30"
        />
        <motion.div
          animate={floatingTransition}
          transition={{ delay: 1.5 }}
          className="absolute bottom-24 right-[42%] h-2.5 w-2.5 rounded-full bg-[#d57b5a]/40"
        />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 py-16 sm:py-20 lg:px-12 lg:py-24">
        <motion.div
          variants={footerColumns}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_.8fr_.95fr_1.15fr] lg:gap-10"
        >
          {/* Brand */}
          <motion.div variants={footerItem}>
            <Link to="/" className="group inline-flex items-center gap-3">
              <motion.span
                whileHover={prefersReducedMotion ? {} : { rotate: 8, scale: 1.06 }}
                transition={{ type: "spring", stiffness: 360, damping: 16 }}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2d2623] text-[#ffd5be] shadow-lg shadow-[#513d32]/15"
              >
                <Scissors size={22} />
              </motion.span>

              <span className="font-serif text-3xl tracking-tight text-[#2d2623]">
                BEAUTY<span className="font-sans text-sm font-semibold tracking-[0.22em] text-[#d57b5a]">VIBE</span>
              </span>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-[#81746d]">
              A considered salon and wellness experience, designed around your
              personal style, calm, and confidence.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <motion.a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Visit our Instagram"
                whileHover={prefersReducedMotion ? {} : { y: -4, scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                className="grid h-11 w-11 place-items-center rounded-full border border-[#eadbd2] bg-white text-[#81746d] shadow-sm transition-colors duration-300 hover:border-[#d57b5a] hover:bg-[#d57b5a] hover:text-white"
              >
                <FaInstagram size={17} />
              </motion.a>

              <motion.a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Visit our Facebook"
                whileHover={prefersReducedMotion ? {} : { y: -4, scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                className="grid h-11 w-11 place-items-center rounded-full border border-[#eadbd2] bg-white text-[#81746d] shadow-sm transition-colors duration-300 hover:border-[#d57b5a] hover:bg-[#d57b5a] hover:text-white"
              >
                <FaFacebookF size={15} />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div variants={footerItem}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2d2623]">
              Explore
            </p>

            <ul className="mt-6 space-y-4">
              {quickLinks.map(([label, path]) => (
                <FooterLink key={path} to={path}>
                  {label}
                </FooterLink>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={footerItem}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2d2623]">
              Signature Care
            </p>

            <ul className="mt-6 space-y-4">
              {services.map((service) => (
                <FooterLink key={service} to="/services">
                  {service}
                </FooterLink>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={footerItem}>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#d57b5a]" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2d2623]">
                Let&apos;s Connect
              </p>
            </div>

            <p className="mt-5 max-w-xs text-sm leading-6 text-[#81746d]">
              Reserve a moment made exclusively for you. We are here to help.
            </p>

            <div className="mt-6 space-y-4 text-sm font-medium text-[#625852]">
              <ContactRow href="tel:+1234567890" icon={Phone}>
                +1 234 567 890
              </ContactRow>

              <ContactRow href="mailto:hello@lumirae.com" icon={Mail}>
                beautyvibe@lumirae.com
              </ContactRow>

              <ContactRow icon={MapPin}>
                123 Beauty Avenue,
                <br />
                Style District, NY 10001
              </ContactRow>
            </div>

            <motion.div
              whileHover={prefersReducedMotion ? {} : { y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="mt-7 inline-flex"
            >
              <Link
                to="/book-appointment"
                className="group inline-flex items-center gap-2 rounded-full bg-[#2d2623] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-[#513d32]/15 transition-colors duration-300 hover:bg-[#d57b5a]"
              >
                Book an Appointment
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-14 flex flex-col gap-5 border-t border-[#eadbd2] pt-7 text-xs font-medium text-[#978983] sm:mt-16 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>© {new Date().getFullYear()} BeautyVibe Salon & Spa. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="inline-flex items-center gap-1.5 text-[#81746d]">
              <Check size={13} className="text-[#d57b5a]" />
              Premium care, thoughtfully delivered
            </span>

            <Link
              to="/privacy-policy"
              className="transition-colors duration-300 hover:text-[#c76f4f]"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="transition-colors duration-300 hover:text-[#c76f4f]"
            >
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
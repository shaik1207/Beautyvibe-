import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Heart,
  Minus,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";

const HeroThreeBackdrop = lazy(() =>
  import("../components/HeroThreeBackdrop")
);

const photos = {
  hero: "/heroimage.png",

  editorial:
    "/editorial.png",
  science:
    "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1100&q=85",
  treatment:
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1100&q=85",
  ritual:
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1100&q=85",

  product1:
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=85",
  product2:
    "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=85",
  product3:
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85",
  product4:
    "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=900&q=85",

  insta1:
    "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=900&q=85",
  insta2:
    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=85",
  insta3:
    "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=85",

  avatar1:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=72",
  avatar2:
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=72",
  avatar3:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=72",
};

const beautyRituals = [
  {
    id: "signature-facial",
    title: "Signature Glow Facial",
    category: "Skin Renewal",
    description: "Deep hydration and visible radiance tailored to your skin.",
    duration: "60 min",
    price: "$75",
    image: photos.product1,
  },
  {
    id: "hair-spa",
    title: "Restorative Hair Spa",
    category: "Hair Ritual",
    description: "A nourishing reset for softer, healthier-looking hair.",
    duration: "75 min",
    price: "$85",
    image: photos.product2,
  },
  {
    id: "body-ritual",
    title: "Calm Body Ritual",
    category: "Wellness Care",
    description: "Slow, restorative care that leaves you balanced and renewed.",
    duration: "90 min",
    price: "$110",
    image: photos.product3,
  },
];

const pricingPlans = [
  {
    number: "01",
    name: "Signature Hair Ritual",
    description: "Cut, cleanse, treatment, styling, and a personalised finish.",
    price: "$65",
  },
  {
    number: "02",
    name: "Swedish Massage",
    description: "Soothes body and mind while restoring deep inner calm.",
    price: "$95",
  },
  {
    number: "03",
    name: "Skin Renewal Facial",
    description: "Targeted cleansing, hydration, and a lasting healthy glow.",
    price: "$75",
  },
  {
    number: "04",
    name: "Wellness Therapy",
    description: "A complete ritual designed to help you reset and recharge.",
    price: "$120",
  },
];

const testimonials = [
  {
    text: "BeautyVibe feels thoughtful from beginning to end. Every treatment feels personal, calm, and beautifully considered.",
    name: "Sarah Jenkins",
    role: "Verified Client",
    image: photos.avatar1,
  },
  {
    text: "The care, the atmosphere, and the finishing details are all exceptional. It is my favourite self-care ritual.",
    name: "Michael Chen",
    role: "Premium Member",
    image: photos.avatar2,
  },
  {
    text: "I left feeling completely refreshed. The team understands how to create a truly luxurious experience.",
    name: "Nadia Williams",
    role: "Verified Client",
    image: photos.avatar3,
  },
];

const faqs = [
  {
    question: "What should I expect during my first appointment?",
    answer:
      "Your first appointment begins with a personalised consultation. Our specialists will understand your needs and recommend the ideal treatment for you.",
  },
  {
    question: "Are BeautyVibe professionals certified?",
    answer:
      "Yes. Every BeautyVibe specialist is experienced, certified, and trained to deliver treatments with care, safety, and attention to detail.",
  },
  {
    question: "Can I book a home service?",
    answer:
      "Yes. Choose Home Service while booking and select a date, time, and location that feels most convenient for you.",
  },
  {
    question: "What products do you use during treatments?",
    answer:
      "We use carefully selected premium beauty and wellness products designed to support visible results, comfort, and a beautiful salon experience.",
  },
];

const easeOut = [0.22, 1, 0.36, 1];

function ScrollReveal({
  children,
  className = "",
  delay = 0,
  rotate = 10,
  distance = 70,
}) {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "end 38%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.3,
  });

  const opacity = useTransform(smoothProgress, [0, 0.28, 1], [0, 1, 1]);
  const y = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [distance, 0, -18]
  );
  const rotateX = useTransform(
    smoothProgress,
    [0, 0.55, 1],
    [rotate, 0, 0]
  );
  const scale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [0.92, 1, 1]
  );

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: "1400px" }}
    >
      <motion.div
        style={
          prefersReducedMotion
            ? undefined
            : {
                opacity,
                y,
                rotateX,
                scale,
                transformStyle: "preserve-3d",
              }
        }
        transition={{ delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function ParallaxImage({
  src,
  alt,
  className = "",
  imageClassName = "",
  amount = 40,
}) {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    mass: 0.35,
  });

  const y = useTransform(smooth, [0, 1], [-amount, amount]);
  const scale = useTransform(smooth, [0, 0.5, 1], [1.14, 1.02, 1.14]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={prefersReducedMotion ? undefined : { y, scale }}
        className={`h-full w-full object-cover ${imageClassName}`}
      />
    </div>
  );
}

function TiltCard({ children, className = "" }) {
  const prefersReducedMotion = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateY = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-8, 8]),
    { stiffness: 180, damping: 18 }
  );

  const rotateX = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [8, -8]),
    { stiffness: 180, damping: 18 }
  );

  const scale = useSpring(1, {
    stiffness: 230,
    damping: 18,
  });

  const handlePointerMove = (event) => {
    if (prefersReducedMotion || event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();

    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const handlePointerEnter = (event) => {
    if (prefersReducedMotion || event.pointerType === "touch") return;
    scale.set(1.025);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
    scale.set(1);
  };

  return (
    <div style={{ perspective: "1200px" }}>
      <motion.div
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={
          prefersReducedMotion
            ? undefined
            : {
                rotateX,
                rotateY,
                scale,
                transformStyle: "preserve-3d",
              }
        }
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#ead8cf] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a56a58] shadow-sm">
      <Sparkles size={12} className="text-[#cb7152]" />
      {children}
    </span>
  );
}

function PrimaryLink({ to, children, className = "" }) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-3 rounded-full bg-[#c96e4e] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#b45e3e2e] transition-all duration-300 hover:-translate-y-1 hover:bg-[#ad563b] ${className}`}
    >
      {children}
      <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#c96e4e] transition-transform duration-300 group-hover:translate-x-1">
        <ArrowRight size={14} />
      </span>
    </Link>
  );
}

function AvatarStack() {
  return (
    <div className="flex -space-x-2">
      {[photos.avatar1, photos.avatar2, photos.avatar3].map((image) => (
        <img
          key={image}
          src={image}
          alt="BeautyVibe client"
          loading="lazy"
          className="h-8 w-8 rounded-full border-2 border-white object-cover"
        />
      ))}
    </div>
  );
}

function SectionHeading({ badge, title, italic, description, centered = false }) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : ""}>
      {badge && <Badge>{badge}</Badge>}

      <h2 className="mt-5 font-serif text-4xl leading-[1.03] tracking-tight text-[#35241e] sm:text-5xl lg:text-6xl">
        {title}
        {italic && (
          <>
            <br />
            <span className="italic text-[#aa8174]">{italic}</span>
          </>
        )}
      </h2>

      {description && (
        <p
          className={`mt-5 max-w-xl text-sm leading-7 text-[#85736b] sm:text-base ${
            centered ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(0);
  const [heroHovered, setHeroHovered] = useState(false);
  const [desktopEnhancement, setDesktopEnhancement] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  const heroRef = useRef(null);
  const ritualScrollRef = useRef(null);
  const cursorRef = useRef({ x: 0, y: 0 });

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const glowX = useMotionValue(-120);
  const glowY = useMotionValue(-120);

  const glowSpringX = useSpring(glowX, {
    stiffness: 220,
    damping: 28,
    mass: 0.3,
  });

  const glowSpringY = useSpring(glowY, {
    stiffness: 220,
    damping: 28,
    mass: 0.3,
  });

  const imageX = useSpring(
    useTransform(cursorX, [-1, 1], [-18, 18]),
    { stiffness: 120, damping: 20, mass: 0.45 }
  );

  const cursorImageY = useSpring(
    useTransform(cursorY, [-1, 1], [-14, 14]),
    { stiffness: 120, damping: 20, mass: 0.45 }
  );

  const imageRotateY = useSpring(
    useTransform(cursorX, [-1, 1], [-7, 7]),
    { stiffness: 120, damping: 20, mass: 0.4 }
  );

  const imageRotateX = useSpring(
    useTransform(cursorY, [-1, 1], [5, -5]),
    { stiffness: 120, damping: 20, mass: 0.4 }
  );

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const smoothHeroProgress = useSpring(heroProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.25,
  });

  const heroTextY = useTransform(smoothHeroProgress, [0, 1], [0, 70]);

  const heroScrollImageY = useTransform(
    smoothHeroProgress,
    [0, 1],
    [0, -25]
  );

  const heroImageY = useTransform(
    [heroScrollImageY, cursorImageY],
    ([scrollY, cursorMoveY]) => scrollY + cursorMoveY
  );

  const { scrollYProgress: ritualProgress } = useScroll({
    target: ritualScrollRef,
    offset: ["start start", "end end"],
  });

  const smoothRitualProgress = useSpring(ritualProgress, {
    stiffness: 75,
    damping: 24,
    mass: 0.25,
  });

  const ritualRailX = useTransform(
    smoothRitualProgress,
    [0, 1],
    ["0%", "-51%"]
  );

  const ritualTitleX = useTransform(
    smoothRitualProgress,
    [0, 1],
    ["0%", "-18%"]
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 768px) and (hover: hover) and (pointer: fine)"
    );

    const updateDesktopMode = () => {
      setDesktopEnhancement(mediaQuery.matches);
    };

    updateDesktopMode();
    mediaQuery.addEventListener?.("change", updateDesktopMode);

    return () => {
      mediaQuery.removeEventListener?.("change", updateDesktopMode);
    };
  }, []);

  const enhancedHero = desktopEnhancement && !prefersReducedMotion;

  const handleHeroMove = (event) => {
    if (!enhancedHero || event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();

    const normalizedX =
      ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;

    const normalizedY =
      ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    cursorX.set(normalizedX);
    cursorY.set(normalizedY);

    cursorRef.current = {
      x: normalizedX,
      y: normalizedY,
    };

    glowX.set(event.clientX - bounds.left - 90);
    glowY.set(event.clientY - bounds.top - 90);
  };

  const resetHeroCursor = () => {
    setHeroHovered(false);

    cursorX.set(0);
    cursorY.set(0);

    cursorRef.current = { x: 0, y: 0 };

    glowX.set(-120);
    glowY.set(-120);
  };

  return (
    <main className="overflow-x-clip bg-[#fffdfb] font-sans text-[#3c2c25] selection:bg-[#d77b59] selection:text-white">
      {/* Hero */}
      <section
        ref={heroRef}
        onPointerMove={handleHeroMove}
        onPointerEnter={() => enhancedHero && setHeroHovered(true)}
        onPointerLeave={resetHeroCursor}
        className="relative isolate flex min-h-[680px] items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF0E8] via-[#FFF7F2] to-[#FFFDFB] pt-16 sm:min-h-[720px] lg:min-h-[90svh]"
      >
        {enhancedHero && (
          <Suspense fallback={null}>
            <HeroThreeBackdrop cursorRef={cursorRef} />
          </Suspense>
        )}

        <motion.div
          style={enhancedHero ? { y: heroTextY } : undefined}
          className="pointer-events-none absolute left-1/2 top-[13%] z-[1] w-full -translate-x-1/2 text-center"
        >
          <p className="font-serif text-[16vw] leading-none tracking-tight text-[#E8A384]/45">
            BEAUTYVIBE
          </p>
        </motion.div>

        {enhancedHero && (
          <motion.div
            style={{ x: glowSpringX, y: glowSpringY }}
            animate={{
              opacity: heroHovered ? 1 : 0,
              scale: heroHovered ? 1 : 0.6,
            }}
            className="pointer-events-none absolute left-0 top-0 z-[2] h-[180px] w-[180px] rounded-full bg-[#F6A784]/25 blur-3xl"
          />
        )}

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.975 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: easeOut }}
          style={
            enhancedHero
              ? {
                  x: imageX,
                  y: heroImageY,
                  rotateX: imageRotateX,
                  rotateY: imageRotateY,
                  transformPerspective: 1000,
                }
              : undefined
          }
          className="relative z-10 flex w-full justify-center self-end"
        >
          <img
            src={photos.hero}
            alt="Man with styled hair and a groomed beard"
            fetchPriority="high"
            decoding="async"
            draggable="false"
            className="h-auto max-h-[630px] w-[88%] max-w-[560px] select-none object-contain object-bottom drop-shadow-2xl sm:w-[72%] lg:max-h-[690px] lg:max-w-[630px]"
          />

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            className="absolute left-5 top-[43%] hidden max-w-[210px] rounded-[1.75rem] border border-white/70 bg-white/45 p-5 shadow-xl backdrop-blur-xl md:block lg:-left-8"
          >
            <div className="mb-2 flex items-start justify-between">
              <h2 className="font-serif text-3xl text-[#D57B5A]">1500+</h2>
              <span className="rounded-full bg-white/70 p-1.5 text-[#D57B5A]">
                <ArrowUpRight size={14} />
              </span>
            </div>

            <p className="mb-4 text-xs leading-snug text-slate-600">
              Helping clients feel relaxed, refreshed, and renewed.
            </p>

            <AvatarStack />
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="absolute bottom-[12%] right-5 hidden max-w-[210px] rounded-[1.75rem] border border-white/70 bg-white/45 p-5 shadow-xl backdrop-blur-xl md:block lg:-right-8"
          >
            <div className="mb-2 flex items-start justify-between">
              <h2 className="font-serif text-3xl text-[#D57B5A]">200+</h2>
              <span className="rounded-full bg-[#D57B5A] p-1.5 text-white">
                <ArrowUpRight size={14} />
              </span>
            </div>

            <p className="mb-4 text-xs leading-snug text-slate-600">
              Expertly completed beauty treatments.
            </p>

            <AvatarStack />
          </motion.div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.45 }}
          className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 sm:bottom-auto sm:left-auto sm:right-6 sm:top-1/2 sm:translate-x-0 lg:right-14"
        >
          <PrimaryLink
            to="/book-appointment"
            className="whitespace-nowrap px-5 py-3 text-xs lg:text-sm"
          >
            Get Started
          </PrimaryLink>
        </motion.div>
      </section>

      {/* Scroll 3D editorial section */}
      <section className="relative overflow-hidden bg-white px-5 py-24 sm:py-32 lg:px-10 lg:py-40">
        <div className="pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 select-none font-serif text-[20vw] leading-none text-[#f8efea]">
          BEAUTY
        </div>

        <ScrollReveal className="relative z-10 mx-auto max-w-6xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#bc7b68]">
            Elevate your everyday glow
          </p>

          <h2 className="mx-auto mt-5 max-w-5xl text-3xl font-semibold leading-[1.15] tracking-tight text-[#43261d] sm:text-4xl lg:text-5xl">
            Premium beauty care designed for healthy, radiant confidence that
            lasts beyond the moment.
          </h2>

          <p className="mt-4 font-serif text-3xl italic text-[#aa8174] sm:text-4xl">
            Glow and redefine modern beauty.
          </p>

          <div
            className="relative mx-auto mt-14 h-[340px] w-[270px] overflow-hidden shadow-2xl shadow-[#b4715940] sm:h-[740px] sm:w-[650px]"
            style={{
              clipPath: "polygon(28% 0%, 100% 16%, 84% 100%, 0% 84%)",
            }}
          >
            <ParallaxImage
              src={photos.editorial}
              alt="BeautyVibe beauty ritual"
              amount={45}
              className="h-full w-full"
            />
          </div>
        </ScrollReveal>
      </section>

      {/* Science and nature */}
      <section className="border-y border-[#f2e4dc] bg-[#fffdfb] px-5 py-24 sm:py-32 lg:px-10 lg:py-40">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_.9fr] lg:gap-20">
          <ScrollReveal rotate={12}>
            <Badge>BeautyVibe Standard</Badge>

            <h2 className="mt-5 font-serif text-4xl leading-[1.02] text-[#35241e] sm:text-5xl">
              Where science
              <br />
              <span className="italic text-[#aa8174]">meets nature.</span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#806e66] sm:text-base">
              Every BeautyVibe ritual blends expert techniques, carefully
              selected products, and personalised care to help you feel your
              most confident.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  title: "Expertly Curated",
                  detail:
                    "Premium treatments shaped around your beauty goals and lifestyle.",
                  stat: "95% Client Love",
                  icon: Sparkles,
                },
                {
                  title: "Thoughtful Ingredients",
                  detail:
                    "Skin-loving formulas and high-quality salon products chosen with care.",
                  stat: "100% Care",
                  icon: Heart,
                },
                {
                  title: "Results That Feel Beautiful",
                  detail:
                    "Confidence-building care from every experience.",
                  stat: "1500+ Visits",
                  icon: Star,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <TiltCard key={item.title}>
                    <article className="flex gap-4 rounded-2xl border border-dashed border-[#e7cfc4] bg-white p-4 shadow-sm transition-colors hover:border-[#d07b5d] sm:p-5">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff0e8] text-[#bd6346]">
                        <Icon size={19} />
                      </span>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[#422d25]">
                            {item.title}
                          </h3>

                          <span className="rounded-full border border-[#e8c8bb] px-2 py-0.5 text-[10px] font-bold text-[#b2674d]">
                            {item.stat}
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-[#89766d] sm:text-sm">
                          {item.detail}
                        </p>
                      </div>
                    </article>
                  </TiltCard>
                );
              })}
            </div>
          </ScrollReveal>

          <ScrollReveal rotate={-11}>
            <TiltCard className="relative mx-auto w-full max-w-md">
              <div className="overflow-hidden rounded-[2rem] bg-[#f9e7dd] p-4 shadow-2xl shadow-[#ae765a20] sm:rounded-[2.5rem] sm:p-6">
                <ParallaxImage
                  src={photos.science}
                  alt="BeautyVibe premium products"
                  amount={55}
                  className="h-[420px] rounded-[1.5rem] sm:h-[560px] sm:rounded-[2rem]"
                />

                <div className="absolute inset-x-8 bottom-8 rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur-xl">
                  <p className="font-serif text-xl text-[#3f2a21]">
                    Beauty that feels intentional.
                  </p>
                  <p className="mt-1 text-xs text-[#806d64]">
                    Rituals made for your visible glow and inner calm.
                  </p>
                </div>
              </div>
            </TiltCard>
          </ScrollReveal>
        </div>
      </section>

      {/* Sticky horizontal scrolling desktop treatment section */}
      <section
        ref={ritualScrollRef}
        className="relative hidden h-[245vh] bg-white lg:block"
      >
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <motion.div
            style={prefersReducedMotion ? undefined : { x: ritualTitleX }}
            className="mb-10 px-10"
          >
            <Badge>Beauty Rituals</Badge>

            <h2 className="mt-5 font-serif text-6xl leading-[0.98] text-[#35241e]">
              Find care for
              <br />
              <span className="italic text-[#aa8174]">your glow.</span>
            </h2>
          </motion.div>

          <motion.div
            style={prefersReducedMotion ? undefined : { x: ritualRailX }}
            className="flex w-max gap-8 px-10"
          >
            {beautyRituals.map((ritual, index) => (
              <TiltCard key={ritual.id}>
                <article className="w-[420px] overflow-hidden rounded-[2.2rem] border border-[#f0e0d7] bg-[#fffdfb] shadow-[0_24px_55px_rgba(91,52,34,0.10)]">
                  <div className="relative h-[420px] overflow-hidden">
                    <ParallaxImage
                      src={ritual.image}
                      alt={ritual.title}
                      amount={35}
                      className="h-full"
                    />

                    <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#a05c46] backdrop-blur">
                      {ritual.category}
                    </span>

                    <button
                      type="button"
                      aria-label={`Save ${ritual.title}`}
                      className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#6a4a3e] backdrop-blur transition-colors hover:bg-[#c96e4e] hover:text-white"
                    >
                      <Heart size={18} />
                    </button>

                    <span className="absolute bottom-5 left-5 font-serif text-5xl text-white/90">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-3xl text-[#3a2821]">
                          {ritual.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[#806e66]">
                          {ritual.description}
                        </p>
                      </div>

                      <span className="font-serif text-xl text-[#b75f42]">
                        {ritual.price}
                      </span>
                    </div>

                    <div className="mt-7 flex items-center justify-between border-t border-[#f0e1d8] pt-5">
                      <span className="text-sm font-semibold text-[#91786d]">
                        {ritual.duration}
                      </span>

                      <Link
                        to={`/services/${ritual.id}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#ad563b]"
                      >
                        Book now <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              </TiltCard>
            ))}

            <div className="flex w-[340px] flex-col justify-center px-7">
              <p className="font-serif text-4xl leading-tight text-[#402b22]">
                Your next ritual is waiting.
              </p>

              <p className="mt-5 text-sm leading-6 text-[#806d64]">
                Continue scrolling to discover treatments created around you.
              </p>

              <Link
                to="/services"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#ad563b]"
              >
                Explore all services <ArrowRight size={17} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile treatment cards */}
      <section className="bg-white px-5 py-20 lg:hidden">
        <ScrollReveal>
          <SectionHeading
            badge="Beauty Rituals"
            title="Find care for"
            italic="your glow."
            description="Treatments tailored for your skin, hair, body, and the way you want to feel."
          />

          <div className="mt-10 grid gap-5">
            {beautyRituals.map((ritual) => (
              <TiltCard key={ritual.id}>
                <article className="overflow-hidden rounded-[1.8rem] border border-[#f0e0d7] bg-[#fffdfb] shadow-lg">
                  <div className="relative h-64">
                    <ParallaxImage
                      src={ritual.image}
                      alt={ritual.title}
                      amount={25}
                      className="h-full"
                    />

                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-[#a05c46]">
                      {ritual.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-2xl text-[#3a2821]">
                          {ritual.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[#806e66]">
                          {ritual.description}
                        </p>
                      </div>

                      <span className="font-serif text-lg text-[#b75f42]">
                        {ritual.price}
                      </span>
                    </div>

                    <Link
                      to={`/services/${ritual.id}`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#ad563b]"
                    >
                      Book now <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              </TiltCard>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Signature visual section */}
      <section className="overflow-hidden bg-[#f9ebe4] px-5 py-24 sm:py-32 lg:px-10 lg:py-40">
        <div className="mx-auto grid max-w-[1320px] items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <ScrollReveal rotate={11}>
            <Badge>Signature Experience</Badge>

            <h2 className="mt-5 font-serif text-4xl leading-[1.04] text-[#36241d] sm:text-5xl lg:text-6xl">
              More than a treatment.
              <br />
              <span className="italic text-[#ad7d70]">A complete reset.</span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#806c63] sm:text-base">
              From the first consultation to the finishing touch, every
              BeautyVibe session is designed to slow life down and help you
              leave feeling renewed.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Personalised consultation",
                "Premium beauty products",
                "Skilled expert techniques",
                "Calm restorative atmosphere",
              ].map((feature) => (
                <span
                  key={feature}
                  className="flex items-center gap-3 rounded-xl bg-white/70 p-3 text-sm font-semibold text-[#5f453a]"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#f7d5c6] text-[#a85236]">
                    <Check size={14} />
                  </span>
                  {feature}
                </span>
              ))}
            </div>

            <div className="mt-9">
              <PrimaryLink to="/book-appointment">
                Reserve your ritual
              </PrimaryLink>
            </div>
          </ScrollReveal>

          <ScrollReveal rotate={-12}>
            <TiltCard className="relative">
              <ParallaxImage
                src={photos.treatment}
                alt="BeautyVibe wellness treatment"
                amount={60}
                className="h-[420px] rounded-[2.5rem] shadow-2xl shadow-[#a8644930] sm:h-[570px]"
              />

              <motion.div
                animate={
                  prefersReducedMotion
                    ? {}
                    : { y: [0, -11, 0], rotate: [0, 3, 0] }
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-7 -left-2 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-xl backdrop-blur-xl sm:left-8"
              >
                <p className="font-serif text-3xl text-[#b85f42]">4.9/5</p>
                <div className="mt-1 flex gap-1 text-[#d77b59]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={13} className="fill-current" />
                  ))}
                </div>
                <p className="mt-2 text-xs text-[#79675f]">
                  Loved by BeautyVibe clients
                </p>
              </motion.div>
            </TiltCard>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white px-5 py-24 sm:py-32 lg:px-10 lg:py-40">
        <div className="mx-auto max-w-[1220px]">
          <ScrollReveal>
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
              <SectionHeading
                badge="Service Pricing"
                title="Your beauty,"
                italic="your ritual."
                description="Choose a signature treatment and make time for the care you deserve."
              />

              <TiltCard>
                <div className="overflow-hidden rounded-[2rem] bg-[#f7d3c1] p-5 sm:p-7">
                  <div className="grid items-center gap-5 sm:grid-cols-[1fr_150px]">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a95339]">
                        New Client Ritual
                      </p>
                      <h3 className="mt-3 font-serif text-3xl text-[#47291e]">
                        Enjoy 15% off your first experience.
                      </h3>
                      <Link
                        to="/offers"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#99442e]"
                      >
                        Discover offer <ArrowRight size={16} />
                      </Link>
                    </div>

                    <img
                      src={photos.product4}
                      alt="Beauty product"
                      loading="lazy"
                      className="h-36 w-full rounded-2xl object-cover sm:h-40"
                    />
                  </div>
                </div>
              </TiltCard>
            </div>
          </ScrollReveal>

          <div className="mt-14 divide-y divide-[#ecddd5] border-y border-[#ecddd5]">
            {pricingPlans.map((plan, index) => (
              <ScrollReveal
                key={plan.number}
                rotate={index % 2 === 0 ? 7 : -7}
                distance={42}
              >
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { x: 10 }}
                  className="group grid gap-4 py-6 sm:grid-cols-[65px_1fr_auto] sm:items-center sm:py-8"
                >
                  <span className="font-serif text-2xl text-[#d6b7a9]">
                    ({plan.number})
                  </span>

                  <div>
                    <h3 className="font-serif text-2xl text-[#3d2921] transition-colors group-hover:text-[#bb6245] sm:text-3xl">
                      {plan.name}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#88766d]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <span className="font-serif text-2xl text-[#4c3025]">
                      {plan.price}
                    </span>

                    <Link
                      to="/book-appointment"
                      aria-label={`Book ${plan.name}`}
                      className="grid h-10 w-10 place-items-center rounded-full border border-[#e7cec2] text-[#b75f42] transition-all hover:bg-[#c96e4e] hover:text-white"
                    >
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="relative overflow-hidden bg-[#fffaf7] px-5 py-24 sm:py-32 lg:px-10 lg:py-40">
        <div className="pointer-events-none absolute left-1/2 top-[52%] h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#eeded6]" />
        <div className="pointer-events-none absolute left-1/2 top-[52%] h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f2e5df]" />

        <ScrollReveal className="relative z-10 mx-auto max-w-6xl">
          <SectionHeading
            centered
            badge="BeautyVibe Community"
            title="Join our community"
            italic="on Instagram."
            description="Beauty tips, glow inspiration, new rituals, and a little everyday self-care — delivered straight to your feed."
          />

          <div className="mt-14 grid items-center gap-6 md:grid-cols-[.7fr_1.5fr_.7fr]">
            <motion.div
              animate={
                prefersReducedMotion ? {} : { y: [0, -8, 0] }
              }
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="space-y-6"
            >
              <img
                src={photos.insta1}
                alt="BeautyVibe post"
                loading="lazy"
                className="ml-auto h-36 w-36 rounded-2xl object-cover shadow-lg sm:h-44 sm:w-44"
              />

              <p className="max-w-[220px] text-sm leading-6 text-[#88766d]">
                Follow for expert beauty tips, seasonal rituals, and offers made
                for your glow.
              </p>
            </motion.div>

            <TiltCard>
              <ParallaxImage
                src={photos.insta2}
                alt="BeautyVibe skincare moment"
                amount={45}
                className="h-[300px] rounded-[2rem] shadow-2xl shadow-[#9d5e4622] sm:h-[420px]"
              />
            </TiltCard>

            <motion.div
              animate={
                prefersReducedMotion ? {} : { y: [0, 10, 0] }
              }
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="space-y-6"
            >
              <img
                src={photos.insta3}
                alt="BeautyVibe treatment post"
                loading="lazy"
                className="h-36 w-36 rounded-2xl object-cover shadow-lg sm:h-44 sm:w-44"
              />

              <div className="rounded-2xl border border-[#ecd8ce] bg-white/80 p-4 text-sm text-[#806c63] shadow-sm">
                <p className="font-serif text-xl text-[#4b3026]">@beautyvibe</p>
                <p className="mt-1 text-xs leading-5">
                  Your daily reminder to make time for yourself.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="mt-10 text-center">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-[#42271e] px-6 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-1"
            >
              <FaInstagram size={18} />
              Follow BeautyVibe
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* Testimonials */}
      <section className="bg-[#3a251d] px-5 py-24 sm:py-32 lg:px-10">
        <ScrollReveal className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#efb79f]">
              Client Stories
            </p>
            <h2 className="mt-4 font-serif text-4xl text-white sm:text-5xl">
              Loved in every detail.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal
                key={testimonial.name}
                rotate={index === 1 ? 0 : index === 0 ? 7 : -7}
                distance={40}
              >
                <TiltCard>
                  <article className="flex min-h-[280px] flex-col justify-between rounded-[1.8rem] border border-white/10 bg-white/[0.07] p-7 backdrop-blur-sm">
                    <div>
                      <div className="flex gap-1 text-[#f1b394]">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            size={14}
                            className="fill-current"
                          />
                        ))}
                      </div>

                      <p className="mt-6 text-sm leading-7 text-white/80">
                        “{testimonial.text}”
                      </p>
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        loading="lazy"
                        className="h-11 w-11 rounded-full border border-white/20 object-cover"
                      />

                      <div>
                        <p className="text-sm font-bold text-white">
                          {testimonial.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#eab59e]">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </article>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ */}
      <section className="bg-white px-5 py-24 sm:py-32 lg:px-10 lg:py-40">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <ScrollReveal rotate={10}>
            <SectionHeading
              badge="BeautyVibe Care"
              title="Questions,"
              italic="beautifully answered."
              description="Everything you need to know before you reserve your next ritual."
            />

            <ParallaxImage
              src={photos.ritual}
              alt="BeautyVibe peaceful ritual"
              amount={35}
              className="mt-8 h-64 rounded-[2rem]"
            />

            <div className="mt-7">
              <PrimaryLink to="/contact">Talk to our team</PrimaryLink>
            </div>
          </ScrollReveal>

          <ScrollReveal rotate={-8}>
            <div className="divide-y divide-[#eadbd2] border-y border-[#eadbd2]">
              {faqs.map((faq, index) => {
                const isOpen = index === activeFaq;

                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                    >
                      <span
                        className={`font-serif text-xl transition-colors sm:text-2xl ${
                          isOpen
                            ? "text-[#bd6245]"
                            : "text-[#3b2922] group-hover:text-[#bd6245]"
                        }`}
                      >
                        {faq.question}
                      </span>

                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors ${
                          isOpen
                            ? "bg-[#c96e4e] text-white"
                            : "bg-[#fff0e8] text-[#b45a3d]"
                        }`}
                      >
                        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-2xl pb-7 pr-10 text-sm leading-7 text-[#85736b]">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#fff3ed] px-5 py-24 sm:py-28 lg:px-10">
        <ScrollReveal className="mx-auto max-w-4xl text-center" rotate={8}>
          <Badge>Your BeautyVibe Moment</Badge>

          <h2 className="mt-5 font-serif text-4xl leading-[1.05] text-[#38251d] sm:text-5xl lg:text-6xl">
            Make time for a little
            <br />
            <span className="italic text-[#ab7a6c]">beautiful care.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#806e66] sm:text-base">
            Reserve a personalised treatment and let our experts create a
            BeautyVibe experience made for you.
          </p>

          <div className="mt-8">
            <PrimaryLink to="/book-appointment">
              Book your appointment
            </PrimaryLink>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <AvatarStack />
            <p className="text-xs text-[#8a746a]">
              Trusted by 1,500+ beauty lovers
            </p>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
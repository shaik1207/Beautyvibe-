import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  Heart,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const aboutImages = {
  hero: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1300&q=85",
  story: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1100&q=85",
  products: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1100&q=85",
  team: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1100&q=85",
};

// Added missing photos object for the team avatars
const photos = {
  avatar1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  avatar2: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
};

const values = [
  {
    icon: Heart,
    title: "Personalised Care",
    desc: "Every service is carefully tailored to your style, comfort, goals, and individual beauty needs.",
  },
  {
    icon: ShieldCheck,
    title: "Hygiene First",
    desc: "A calm, spotless professional environment where your health, comfort, and safety come first.",
  },
  {
    icon: Sparkles,
    title: "Premium Rituals",
    desc: "Thoughtful treatments and high-quality products chosen for beautiful, confidence-building results.",
  },
  {
    icon: Users,
    title: "Master Professionals",
    desc: "Experienced specialists who bring care, expertise, and attention to every single detail.",
  },
];

const promises = [
  "A personal consultation before every experience",
  "Premium products selected for visible results",
  "Skilled techniques with thoughtful finishing details",
  "A calm space created for you to fully reset",
];

function ScrollReveal({
  children,
  className = "",
  rotate = 9,
  distance = 55,
}) {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "end 35%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.3,
  });

  const opacity = useTransform(smoothProgress, [0, 0.3, 1], [0, 1, 1]);
  const y = useTransform(smoothProgress, [0, 0.55, 1], [distance, 0, -10]);
  const rotateX = useTransform(
    smoothProgress,
    [0, 0.55, 1],
    [rotate, 0, 0]
  );
  const scale = useTransform(smoothProgress, [0, 0.55, 1], [0.94, 1, 1]);

  return (
    <div ref={ref} className={className} style={{ perspective: "1400px" }}>
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
  amount = 45,
}) {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    mass: 0.35,
  });

  const y = useTransform(smoothProgress, [0, 1], [-amount, amount]);
  const scale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [1.14, 1.03, 1.14]
  );

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

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#ead8cf] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a56a58] shadow-sm">
      <Sparkles size={12} className="text-[#cb7152]" />
      {children}
    </span>
  );
}

function PrimaryLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-3 rounded-full bg-[#c96e4e] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#b45e3e2e] transition-all duration-300 hover:-translate-y-1 hover:bg-[#ad563b]"
    >
      {children}
      <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#c96e4e] transition-transform duration-300 group-hover:translate-x-1">
        <ArrowRight size={14} />
      </span>
    </Link>
  );
}

export default function About() {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const smoothHeroProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.3,
  });

  const heroImageY = useTransform(smoothHeroProgress, [0, 1], [0, -75]);
  const heroImageScale = useTransform(
    smoothHeroProgress,
    [0, 1],
    [1.04, 1.16]
  );
  const heroTextY = useTransform(smoothHeroProgress, [0, 1], [0, 55]);
  const heroWordScale = useTransform(smoothHeroProgress, [0, 1], [1, 1.1]);

  return (
    <main className="overflow-x-clip bg-[#fffdfb] font-sans text-[#3c2c25]">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative isolate min-h-[760px] overflow-hidden bg-[#fff5ef] px-5 pb-20 pt-28 sm:min-h-[800px] lg:px-10 lg:pb-28 lg:pt-36"
      >
        <div className="pointer-events-none absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-[#f7cbb8]/45 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-[450px] w-[450px] rounded-full bg-[#f7d7c7]/55 blur-[120px]" />

        <motion.p
          style={prefersReducedMotion ? undefined : { scale: heroWordScale }}
          className="pointer-events-none absolute left-1/2 top-[14%] z-0 w-full -translate-x-1/2 text-center font-serif text-[18vw] leading-none tracking-tight text-[#efd9ce]/75"
        >
          BEAUTYVIBE
        </motion.p>

        <div className="relative z-10 mx-auto grid max-w-[1320px] items-center gap-14 lg:grid-cols-[.95fr_1.05fr] lg:gap-20">
          <motion.div
            initial={
              prefersReducedMotion ? false : { opacity: 0, y: 30 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            style={prefersReducedMotion ? undefined : { y: heroTextY }}
          >
            <Badge>Our Story</Badge>

            <h1 className="mt-6 font-serif text-5xl leading-[0.96] tracking-tight text-[#39251d] sm:text-6xl lg:text-7xl">
              Beauty is a feeling
              <br />
              <span className="italic text-[#af7d70]">you carry with you.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-[#806d64] sm:text-lg">
              BeautyVibe brings beauty, grooming, and wellness rituals together
              in one considered experience — created to help you feel confident,
              cared for, and completely yourself.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <PrimaryLink to="/services">Explore services</PrimaryLink>

              <Link
                to="/book-appointment"
                className="group inline-flex items-center gap-2 text-sm font-bold text-[#a85339]"
              >
                Book an appointment
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-9 gap-y-5 border-t border-[#ead9d0] pt-7">
              <div>
                <p className="font-serif text-3xl text-[#b85f42]">1500+</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#91796f]">
                  Happy clients
                </p>
              </div>

              <div>
                <p className="font-serif text-3xl text-[#b85f42]">10+</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#91796f]">
                  Beauty experts
                </p>
              </div>

              <div>
                <p className="font-serif text-3xl text-[#b85f42]">4.9/5</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#91796f]">
                  Client rating
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, scale: 0.94, rotate: -3 }
            }
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-xl"
            style={{ perspective: "1300px" }}
          >
            <motion.div
              style={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: heroImageY,
                      scale: heroImageScale,
                      transformStyle: "preserve-3d",
                    }
              }
              className="relative h-[430px] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-[#a35d3d35] sm:h-[590px]"
            >
              <img
                src={aboutImages.hero}
                alt="BeautyVibe salon experience"
                className="h-full w-full object-cover object-center"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#4f2a1d]/35 via-transparent to-transparent" />
            </motion.div>

            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : { y: [0, -10, 0], rotate: [0, 2, 0] }
              }
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-8 -left-2 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-xl backdrop-blur-xl sm:left-8"
            >
              <div className="flex gap-1 text-[#d77b59]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={14} className="fill-current" />
                ))}
              </div>

              <p className="mt-3 font-serif text-2xl text-[#3f2920]">
                Care in every detail.
              </p>

              <p className="mt-1 text-xs text-[#7f6b62]">
                A ritual made just for you.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white px-5 py-24 sm:py-32 lg:px-10 lg:py-40">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
          <ScrollReveal rotate={10}>
            <div className="relative">
              <ParallaxImage
                src={aboutImages.story}
                alt="Relaxing BeautyVibe treatment"
                amount={55}
                className="h-[400px] rounded-[2.5rem] shadow-2xl shadow-[#a5654722] sm:h-[540px]"
              />

              <motion.div
                animate={
                  prefersReducedMotion
                    ? {}
                    : { y: [0, -12, 0], rotate: [0, -2, 0] }
                }
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-6 -right-2 max-w-[230px] rounded-2xl border border-[#f0d8cb] bg-[#fff5ef] p-5 shadow-lg sm:right-7"
              >
                <p className="font-serif text-3xl text-[#b75e42]">Since 2024</p>
                <p className="mt-2 text-xs leading-5 text-[#7f6c63]">
                  Helping clients create a little more time for themselves.
                </p>
              </motion.div>
            </div>
          </ScrollReveal>

          <ScrollReveal rotate={-10}>
            <Badge>Our Philosophy</Badge>

            <h2 className="mt-5 font-serif text-4xl leading-[1.04] text-[#35241e] sm:text-5xl lg:text-6xl">
              The best version
              <br />
              <span className="italic text-[#aa8174]">of you is already here.</span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#806d64] sm:text-base">
              BeautyVibe was created for people who value the quiet power of
              self-care. We combine beauty expertise with a calm, thoughtful
              experience that helps every client feel seen and restored.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Personal beauty consultations",
                "Thoughtful treatment rituals",
                "Comfort-first experience",
                "Visible, confidence-building results",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-[#f0dfd6] bg-[#fffdfb] p-4 text-sm font-semibold text-[#60463b]"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f8d8ca] text-[#aa563a]">
                    <Check size={14} />
                  </span>
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-9">
              <PrimaryLink to="/book-appointment">
                Begin your BeautyVibe ritual
              </PrimaryLink>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-[#f0e0d8] bg-[#fffaf7] px-5 py-24 sm:py-32 lg:px-10 lg:py-40">
        <ScrollReveal className="mx-auto max-w-6xl text-center">
          <Badge>What We Believe</Badge>

          <h2 className="mt-5 font-serif text-4xl text-[#35241e] sm:text-5xl">
            A standard of care
            <br />
            <span className="italic text-[#aa8174]">you can feel.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#806d64] sm:text-base">
            These values guide every BeautyVibe appointment, every product we
            choose, and every detail we create for you.
          </p>
        </ScrollReveal>

        <div className="mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => {
            const Icon = value.icon;

            return (
              <ScrollReveal
                key={value.title}
                rotate={index % 2 === 0 ? 9 : -9}
                distance={45}
              >
                <motion.article
                  whileHover={prefersReducedMotion ? {} : { y: -9 }}
                  className="group min-h-[270px] rounded-[1.8rem] border border-[#f0dfd6] bg-white p-6 shadow-[0_15px_35px_rgba(91,52,34,0.05)] transition-shadow hover:shadow-[0_24px_45px_rgba(180,93,63,0.13)]"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#fff0e8] text-[#bd6346] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                    <Icon size={27} />
                  </div>

                  <h3 className="mt-7 font-serif text-2xl text-[#3b2922]">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#856f66]">
                    {value.desc}
                  </p>
                </motion.article>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Products and people */}
      <section className="bg-white px-5 py-24 sm:py-32 lg:px-10 lg:py-40">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:gap-20">
          <ScrollReveal rotate={10}>
            <Badge>Thoughtfully Chosen</Badge>

            <h2 className="mt-5 font-serif text-4xl leading-[1.04] text-[#35241e] sm:text-5xl">
              Premium products.
              <br />
              <span className="italic text-[#aa8174]">Beautiful results.</span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#806d64] sm:text-base">
              We use premium products chosen for their quality, comfort, and
              ability to support healthy, visible results with every treatment.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "High-quality beauty and wellness formulas",
                "Products selected for every skin and hair type",
                "Professional application from trained specialists",
              ].map((item) => (
                <p
                  key={item}
                  className="flex items-center gap-3 text-sm font-semibold text-[#60463b]"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f8d8ca] text-[#a85236]">
                    <Check size={14} />
                  </span>
                  {item}
                </p>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal rotate={-10}>
            <ParallaxImage
              src={aboutImages.products}
              alt="BeautyVibe premium products"
              amount={60}
              className="h-[420px] rounded-[2.5rem] shadow-2xl shadow-[#a8644930] sm:h-[560px]"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Team */}
      <section className="overflow-hidden bg-[#f7e7de] px-5 py-24 sm:py-32 lg:px-10 lg:py-40">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
          <ScrollReveal rotate={-10}>
            <ParallaxImage
              src={aboutImages.team}
              alt="BeautyVibe salon professionals"
              amount={50}
              className="h-[400px] rounded-[2.5rem] shadow-2xl shadow-[#a8644930] sm:h-[530px]"
            />
          </ScrollReveal>

          <ScrollReveal rotate={10}>
            <Badge>The BeautyVibe Team</Badge>

            <h2 className="mt-5 font-serif text-4xl leading-[1.04] text-[#35241e] sm:text-5xl">
              Skilled hands.
              <br />
              <span className="italic text-[#aa8174]">Warm hearts.</span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#806d64] sm:text-base">
              Our specialists bring together technique, creativity, and genuine
              care. We listen closely, guide thoughtfully, and make every visit
              feel personal.
            </p>

            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/70 bg-white/75 p-5 backdrop-blur">
              <div className="flex -space-x-3">
                {[aboutImages.team, photos.avatar1, photos.avatar2].map(
                  (image) => (
                    <img
                      key={image}
                      src={image}
                      alt="BeautyVibe professional"
                      className="h-11 w-11 rounded-full border-2 border-white object-cover"
                    />
                  )
                )}
              </div>

              <div>
                <p className="font-serif text-xl text-[#3c2a22]">
                  10+ Beauty Experts
                </p>
                <p className="mt-1 text-xs text-[#806c63]">
                  Ready to make your appointment feel exceptional.
                </p>
              </div>
            </div>

            <div className="mt-9">
              <PrimaryLink to="/services">Meet our services</PrimaryLink>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#3a251d] px-5 py-24 sm:py-28 lg:px-10">
        <ScrollReveal className="mx-auto max-w-4xl text-center" rotate={7}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#efb79f]">
            Your BeautyVibe Moment
          </p>

          <h2 className="mt-5 font-serif text-4xl leading-[1.04] text-white sm:text-5xl lg:text-6xl">
            You deserve a little
            <br />
            <span className="italic text-[#eab19a]">beautiful care.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
            Reserve a beauty or wellness ritual and let our team create an
            experience designed around you.
          </p>

          <div className="mt-9">
            <Link
              to="/book-appointment"
              className="group inline-flex items-center gap-3 rounded-full bg-[#f3b99f] px-6 py-3.5 text-sm font-bold text-[#3c241c] transition-transform hover:-translate-y-1"
            >
              Book an appointment
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#3c241c] text-white transition-transform group-hover:translate-x-1">
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
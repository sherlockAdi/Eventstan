"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { SERVICES, REVIEWS } from "@/lib/data";
import ServiceCard from "@/components/ui/ServiceCard";
import PreviousWorks from "@/components/PreviousWorks";
import PartnerMarquee from "@/components/PartnerMarquee";
import { Search, ClipboardList, PartyPopper } from "lucide-react";

const CATEGORY_DATA = [
  {
    name: "Venue",
    desc: "Halls, gardens, resorts & unique spaces",
    icon: "🏛️",
    img: "/images/categories/venue.jpg",
  },
  {
    name: "Decor",
    desc: "Themes, florals, lighting & staging",
    icon: "🌸",
    img: "/images/categories/decor.jpg",
  },
  {
    name: "Catering",
    desc: "Cuisines, buffets, desserts & bars",
    icon: "🍽️",
    img: "/images/categories/catering.jpg",
  },
  {
    name: "Entertainment",
    desc: "DJs, bands, performers & MCs",
    icon: "🎵",
    img: "/images/categories/entertainment.jpg",
  },
  {
    name: "Rentals",
    desc: "Furniture, tents, sound systems & event essentials",
    icon: "🪑",
    img: "/images/categories/rentals.jpg",
  },
];

// ─── Avatar Colors ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "#fff4e6", tc: "#9a3412" },
  { bg: "#e0f2fe", tc: "#0369a1" },
  { bg: "#f0fdf4", tc: "#15803d" },
  { bg: "#fdf4ff", tc: "#7e22ce" },
  { bg: "#fff1f2", tc: "#be123c" },
  { bg: "#fefce8", tc: "#a16207" },
  { bg: "#f0fdfa", tc: "#0f766e" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating, active }: { rating: number; active: boolean }) {
  return (
    <div className="flex justify-center gap-0.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="w-3.5 h-3.5"
          fill={i < rating ? "#f97316" : "#e5e7eb"}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({
  review,
  index,
  isActive,
  isNear,
  onClick,
}: {
  review: (typeof REVIEWS)[0];
  index: number;
  isActive: boolean;
  isNear: boolean;
  onClick: () => void;
}) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = getInitials(review.reviewer_name);

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-[260px] mx-4 rounded-2xl border text-center cursor-pointer select-none bg-white"
      style={{
        padding: "1.75rem 1.5rem 1.5rem",
        transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
        opacity: isActive ? 1 : isNear ? 0.6 : 0.3,
        transform: isActive
          ? "scale(1.07)"
          : isNear
            ? "scale(0.93)"
            : "scale(0.85)",
        borderColor: isActive ? "#fdba74" : "#f3f4f6",
        borderWidth: isActive ? "1.5px" : "1px",
        boxShadow: isActive ? "0 8px 32px rgba(249,115,22,0.12)" : "none",
        position: "relative",
        zIndex: isActive ? 2 : 1,
      }}
    >
      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-base font-medium"
        style={{
          background: color.bg,
          color: color.tc,
          outline: isActive ? "2.5px solid #f97316" : "2px solid #e5e7eb",
          outlineOffset: "2px",
        }}
      >
        {initials}
      </div>

      {/* Event tag */}
      <span className="inline-block text-[10px] font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-100 mb-3">
        {review.event_type}
      </span>

      {/* Stars */}
      <StarRating rating={review.rating} active={isActive} />

      {/* Review text */}
      <p
        className="text-[13px] leading-relaxed mb-4 line-clamp-3 transition-colors duration-500"
        style={{ color: isActive ? "#374151" : "#9ca3af" }}
      >
        {review.comment}
      </p>

      {/* Name button */}
      <div
        className="inline-block px-6 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-500"
        style={{
          background: isActive ? "#f97316" : "#f3f4f6",
          color: isActive ? "#fff" : "#9ca3af",
        }}
      >
        {review.reviewer_name}
      </div>
    </div>
  );
}

// ─── Reviews Slider ───────────────────────────────────────────────────────────
function ReviewsSlider() {
  const [current, setCurrent] = useState(2);
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const CARD_W = 292;
  const CLONES = 2; // clones on each side

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % REVIEWS.length) + REVIEWS.length) % REVIEWS.length);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % REVIEWS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isHovered]);

  useEffect(() => {
    if (!trackRef.current || !viewportRef.current) return;
    const vw = viewportRef.current.offsetWidth;
    const offset = vw / 2 - CARD_W / 2 - (current + CLONES) * CARD_W;
    trackRef.current.style.transform = `translateX(${offset}px)`;
  }, [current]);

  // Build extended array: [last CLONES items] + REVIEWS + [first CLONES items]
  const extended = [
    ...REVIEWS.slice(-CLONES),
    ...REVIEWS,
    ...REVIEWS.slice(0, CLONES),
  ];

  return (
    <div
      ref={viewportRef}
      className="relative w-full overflow-hidden"
      style={{ padding: "40px 0 50px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="pointer-events-none absolute left-0 top-0 h-full w-28 z-10 bg-gradient-to-r from-gray-50 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-28 z-10 bg-gradient-to-l from-gray-50 to-transparent" />

      <div
        ref={trackRef}
        className="flex items-center"
        style={{ transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)" }}
      >
        {extended.map((review, i) => {
          const actualIndex = (i - CLONES + REVIEWS.length) % REVIEWS.length;
          return (
            <ReviewCard
              key={`${review.id}-${i}`}
              review={review}
              index={actualIndex}
              isActive={actualIndex === current}
              isNear={
                Math.abs(actualIndex - current) === 1 ||
                Math.abs(actualIndex - current) === REVIEWS.length - 1
              }
              onClick={() => goTo(actualIndex)}
            />
          );
        })}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {REVIEWS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Review ${i + 1}`}
            className="h-[7px] rounded-full transition-all duration-300"
            style={{
              width: i === current ? "22px" : "7px",
              background: i === current ? "#f97316" : "#e5e7eb",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>

      <div className="flex justify-center gap-3 mt-4">
        <button
          onClick={() => goTo(current - 1)}
          aria-label="Previous review"
          className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          ←
        </button>
        <button
          onClick={() => goTo(current + 1)}
          aria-label="Next review"
          className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim())
      router.push(`/services?search=${encodeURIComponent(search)}`);
    else router.push("/services");
  };

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-x-hidden"
        style={{ background: "#fff5eb" }}
      >
        <div className="absolute top-20 left-20 w-64 h-64 bg-orange-300/30 rounded-full blur-3xl opacity-50 max-sm:w-48 max-sm:h-48 max-sm:left-10 max-sm:top-10" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-300/25 rounded-full blur-3xl opacity-50 max-sm:w-56 max-sm:h-56 max-sm:right-10 max-sm:bottom-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-40 left-1/3 w-48 h-48 bg-amber-300/25 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-40 left-10 w-56 h-56 bg-orange-200/20 rounded-full blur-3xl opacity-30" />

        <div className="relative z-10 text-center max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-orange-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-orange-600 font-medium mb-4 sm:mb-6 shadow-sm">
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Your event, perfectly planned
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-bold text-gray-900 leading-tight mb-6 px-2">
            Find the Perfect{" "}
            <span className="text-orange-500 relative inline-block">
              Vendors
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 6 Q100 0 200 6"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            for Your Event
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-6 sm:mb-8 max-w-xl mx-auto px-2">
            Discover and book top-rated venues, decorators, caterers, and
            entertainers — all in one place.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6 sm:mb-8 px-4 sm:px-0">
            <Link
              href="/services"
              className="bg-orange-500 text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg"
            >
              Explore Services
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <Link
              href="/vendor-dashboard"
              className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-gray-900 hover:border-gray-900 hover:text-white transition-colors text-sm sm:text-base text-center bg-white/50"
            >
              List Your Service
            </Link>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto w-full px-4 sm:px-0">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 w-full"
            >
              <div className="flex-1 relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g., Wedding, Birthday, Corporate Event"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white shadow-sm"
                  aria-label="Search event type"
                />
              </div>
              <button
                type="submit"
                className="bg-orange-500 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors sm:w-auto w-full shadow-md hover:shadow-lg"
              >
                Search
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 mt-6 sm:mt-8 px-2">
            {[
              ["500+", "Vendors"],
              ["1,200+", "Events"],
              ["4.9★", "Rating"],
            ].map(([num, label]) => (
              <div
                key={label}
                className="bg-white rounded-full px-4 sm:px-5 py-1.5 sm:py-2 shadow-sm border border-gray-100 text-xs sm:text-sm whitespace-nowrap"
              >
                <span className="text-orange-500 font-bold">{num}</span>
                <span className="text-gray-500 ml-1">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {CATEGORY_DATA.map((cat) => (
            <Link key={cat.name} href={`/services?category=${cat.name}`}>
              <div className="relative rounded-2xl overflow-hidden h-44 group cursor-pointer">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-lg font-bold">{cat.name}</div>
                  <div className="text-xs text-white/80">{cat.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Services
            </h2>
            <p className="text-gray-500 mt-1">
              Hand-picked vendors for your next event
            </p>
          </div>
          <Link
            href="/services"
            className="text-orange-500 font-medium hover:text-orange-600 flex items-center gap-1"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            How It Works
          </h2>
          <p className="text-gray-500 mb-10">
            Three simple steps to your dream event
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                icon: Search,
                title: "Browse Services",
                desc: "Explore our curated collection of premium event vendors across four categories.",
              },
              {
                icon: ClipboardList,
                title: "Request Booking",
                desc: "Send your event details to the vendor and get a personalized quote instantly.",
              },
              {
                icon: PartyPopper,
                title: "Confirm & Celebrate",
                desc: "Lock in your vendor, plan your event, and create unforgettable memories.",
              },
            ].map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-500">
                  <step.icon size={32} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Previous Works */}
      <PreviousWorks />

      {/* Reviews — centered focus slider */}
      <section className="py-12 bg-gray-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-2 text-center">
          <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-800 border border-orange-100 rounded-full px-3 py-1 text-[11px] font-medium tracking-widest uppercase mb-4">
            <svg
              className="w-2.5 h-2.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Client reviews
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            What Our Clients Say
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Real stories from real celebrations
          </p>
        </div>
        <ReviewsSlider />
      </section>

      {/* Partners */}
      <PartnerMarquee />

      {/* CTA */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <div className="bg-orange-500 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to Make Your Event Unforgettable?
          </h2>
          <p className="text-orange-100 mb-6">
            Join hundreds of happy clients who found their perfect event vendors
            through EventStan.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-gray-800 transition-colors"
          >
            Get Started Now →
          </Link>
        </div>
      </section>
    </div>
  );
}

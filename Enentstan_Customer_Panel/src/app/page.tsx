"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ServiceCard from "@/components/ui/ServiceCard";
import PreviousWorks from "@/components/PreviousWorks";
import PartnerMarquee from "@/components/PartnerMarquee";
import { Review } from "@/types";
import { useMarketplaceData } from "@/lib/useMarketplaceData";

const CATEGORY_DATA = [
  { 
    name: "Venue", 
    desc: "Halls, gardens, resorts & unique spaces", 
    icon: "🏛️", 
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80" 
  },
  { 
    name: "Decor", 
    desc: "Themes, florals, lighting & staging", 
    icon: "🌸", 
    img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80" 
  },
  { 
    name: "Catering", 
    desc: "Cuisines, buffets, desserts & bars", 
    icon: "🍽️", 
    img: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80" 
  },
  { 
    name: "Entertainment", 
    desc: "DJs, bands, performers & MCs", 
    icon: "🎵", 
    img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80" 
  },
  { 
    name: "Rentals", 
    desc: "Furniture, tents, sound systems & event essentials", 
    icon: "🪑", 
    img: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&q=80" 
  }
];

// ─── Review Card ────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="w-[300px] shrink-0 bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow mx-3">
      <div className="text-orange-400 text-3xl leading-none mb-3 font-serif">&ldquo;</div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-4">{review.comment}</p>
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className={`w-4 h-4 ${i < review.rating ? "text-orange-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <img src={review.reviewer_avatar} alt={review.reviewer_name} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <div className="font-semibold text-sm text-gray-900">{review.reviewer_name}</div>
          <div className="text-xs text-gray-400">{review.event_type} — {review.location}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Reviews Slider ──────────────────────────────────────────────────────────
function ReviewsSlider({ reviews }: { reviews: Review[] }) {
  const [paused, setPaused] = useState(false);
  const doubled = [...reviews, ...reviews];

  if (reviews.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10 bg-gradient-to-r from-gray-50 to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10 bg-gradient-to-l from-gray-50 to-transparent" />

      <div
        className="flex"
        style={{
          animation: "reviewsScrollLeft 30s linear infinite",
          animationPlayState: paused ? "paused" : "running",
          width: "max-content",
        }}
      >
        {doubled.map((review, i) => (
          <ReviewCard key={`${review.id}-${i}`} review={review} />
        ))}
      </div>

      <style jsx>{`
        @keyframes reviewsScrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ─── Landing Page ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { services, reviews, loading, error } = useMarketplaceData();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/services?search=${encodeURIComponent(search)}`);
    else router.push("/services");
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-x-hidden">

        {/* Custom gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,165,0,0.25),transparent_40%),radial-gradient(circle_at_20%_80%,rgba(255,200,150,0.2),transparent_40%),linear-gradient(135deg,#f8f5f2,#f3e9dc)]" />

        {/* Existing blobs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl opacity-30 max-sm:w-48 max-sm:h-48 max-sm:left-10 max-sm:top-10" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl opacity-30 max-sm:w-56 max-sm:h-56 max-sm:right-10 max-sm:bottom-10" />
        <div className="absolute top-40 right-40 w-40 h-40 bg-orange-100 rounded-full blur-2xl opacity-50 max-sm:w-32 max-sm:h-32 max-sm:right-5 max-sm:top-20" />

        <div className="relative z-10 text-center max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="inline-flex items-center gap-2 bg-white border border-orange-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-orange-600 font-medium mb-4 sm:mb-6 shadow-sm">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Your event, perfectly planned
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6 px-2">
            Find the Perfect{" "}
            <span className="text-orange-500 relative inline-block">
              Vendors
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
                <path d="M0 6 Q100 0 200 6" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </span>{" "}
            for Your Event
          </h1>



          <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-6 sm:mb-8 max-w-xl mx-auto px-2">
            Discover and book top-rated venues, decorators, caterers, and entertainers — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6 sm:mb-8 px-4 sm:px-0">
            <Link
              href="/services"
              className="bg-orange-500 text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Explore Services
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <Link
              href="/vendor-dashboard"
              className="border-2 border-gray-900 text-gray-900 px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-gray-900 hover:text-white transition-colors text-sm sm:text-base text-center"
            >
              List Your Service
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row max-w-md mx-auto gap-3 w-full px-4 sm:px-0">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendors..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-orange-400 bg-white"
                aria-label="Search vendors"
              />
            </div>

            <button
              type="submit"
              className="bg-orange-500 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors sm:w-auto w-full"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 mt-6 sm:mt-8 px-2">
            {[["500+", "Vendors"], ["1,200+", "Events"], ["4.9★", "Rating"]].map(([num, label]) => (
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

      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        </div>
      )}

      {/* Categories */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {CATEGORY_DATA.map((cat) => (
            <Link key={cat.name} href={`/services?category=${cat.name}`}>
              <div className="relative rounded-2xl overflow-hidden h-44 group cursor-pointer">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
            <h2 className="text-3xl font-bold text-gray-900">Featured Services</h2>
            <p className="text-gray-500 mt-1">Hand-picked vendors for your next event</p>
          </div>
          <Link href="/services" className="text-orange-500 font-medium hover:text-orange-600 flex items-center gap-1">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-gray-400 text-sm">Loading services...</p>
          ) : services.length === 0 ? (
            <p className="text-gray-400 text-sm">No services available right now.</p>
          ) : services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">How It Works</h2>
          <p className="text-gray-500 mb-10">Three simple steps to your dream event</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-orange-100" />
            {[
              { icon: "🔍", title: "Browse Services", desc: "Explore our curated collection of premium event vendors across four categories." },
              { icon: "📋", title: "Request Booking", desc: "Send your event details to the vendor and get a personalized quote instantly." },
              { icon: "🎉", title: "Confirm & Celebrate", desc: "Lock in your vendor, plan your event, and create unforgettable memories." },
            ].map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  {step.icon}
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

      {/* Reviews — infinite auto-scroll slider */}
      <section className="py-12 bg-gray-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">What Our Clients Say</h2>
            <p className="text-gray-500 mt-1">Real stories from real celebrations</p>
          </div>
        </div>
        <ReviewsSlider reviews={reviews} />
      </section>

      {/* Partners */}
      <PartnerMarquee />

    {/* CTA */ }
    <section className = "py-12 px-4 max-w-5xl mx-auto" >
      <div className="bg-orange-500 rounded-3xl p-10 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Ready to Make Your Event Unforgettable?</h2>
        <p className="text-orange-100 mb-6">Join hundreds of happy clients who found their perfect event vendors through EventStan.</p>
        <Link href="/services" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-gray-800 transition-colors">
          Get Started Now →
        </Link>
      </div>
      </section>
    </div >
  );
}

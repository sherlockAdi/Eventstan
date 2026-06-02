

"use client";
import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookingModal from "@/components/ui/BookingModal";
import PackageCard from "@/components/ui/PackageCard";
import { Package } from "@/types";
import { useCart } from "@/lib/CartContext";
import { useMarketplaceData } from "@/lib/useMarketplaceData";

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { services, packages: allPackages, loading, error } = useMarketplaceData();
  const service = services.find((s) => s.id === id);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<Package | undefined>();
  const { addService, items } = useCart();

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-gray-400">Loading service...</div>;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!service) return notFound();

  const packages = allPackages.filter((p) => p.service_id === service.id);
  const inCart = items.some((i) => i.id === `svc-${service.id}`);

  const handleBookPkg = (pkg: Package) => {
    setSelectedPkg(pkg);
    setShowBooking(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href="/services" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Services
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main Content (left 2/3) ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Hero Image — lives inside the main column, matching the screenshot */}
          <div className="rounded-2xl overflow-hidden aspect-[16/9] relative shadow-sm">
            <img
              src={service.image_url}
              alt={service.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {service.category}
            </span>
          </div>

          {/* Title & Meta */}
          <div>
            
            <span>
               {service.rating > 0 && (
                <span className="flex items-center gap-1 bg-orange-50 px-3 w-28 py-1.5 rounded-full">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-bold text-gray-900 text-sm">{service.rating}</span>
                  <span className="text-gray-400 text-xs">({service.review_count})</span>
                </span>
              )}
            </span>
            <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{service.title}</h1>
                <p className="text-gray-500 flex items-center gap-1 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {service.location}
                </p>
              </div>
             
            </div>
            <p className="text-gray-600 leading-relaxed">{service.description}</p>
          </div>

 {/* Available Packages */}
          {packages.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Available Packages</h2>
              <p className="text-gray-500 text-sm mb-5">
                Book a ready-made package from this vendor — fixed price, no surprises
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {packages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} service={service} onBook={handleBookPkg} />
                ))}
              </div>
            </div>
          )}


         
          {/* Event Types / Tags */}
          {/* {service.tags?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Event Types</h2>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag: string) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )} */}

          {/* Gallery */}
          {/* {service.gallery?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Gallery</h2>
              <div className="grid grid-cols-3 gap-3">
                {service.gallery.map((img: string, i: number) => (
                  <div key={i} className="rounded-xl overflow-hidden aspect-video">
                    <img
                      src={img}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )} */}

         
        </div>

        {/* ── Sidebar (right 1/3) ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">

            {/* Pricing */}
            <div className="mb-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Starting from</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  ${service.price_min?.toLocaleString()}
                </span>
                {service.price_max && (
                  <span className="text-gray-400 text-base"> – ${service.price_max?.toLocaleString()}</span>
                )}
              </div>
              {service.price_unit && (
                <span className="text-sm text-gray-400">{service.price_unit}</span>
              )}
            </div>

            {/* Add to Cart */}
            {/* <button
              onClick={() => addService(service)}
              disabled={inCart}
              className={`w-full py-3 rounded-xl font-semibold text-sm mb-2 flex items-center justify-center gap-2 transition-all ${
                inCart
                  ? "bg-green-50 text-green-600 border border-green-200 cursor-default"
                  : "bg-gray-900 text-white hover:bg-orange-500"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {inCart ? "Added to Cart ✓" : "Add to Cart"}
            </button> */}

            {/* Request Booking */}
            <button
              onClick={() => { setSelectedPkg(undefined); setShowBooking(true); }}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors mb-5"
            >
              Request Booking
            </button>

            {/* Vendor Info */}
            <div className="border-t border-gray-100 pt-5 space-y-3 text-sm">
              <h4 className="font-semibold text-gray-900 text-sm">Vendor Info</h4>

              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{service.vendor_name}</span>
              </div>

              {service.vendor_phone && (
                <a
                  href={`tel:${service.vendor_phone}`}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {service.vendor_phone}
                </a>
              )}

              {service.vendor_email && (
                <a
                  href={`mailto:${service.vendor_email}`}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {service.vendor_email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal
          pkg={selectedPkg}
          service={selectedPkg ? undefined : service}
          onClose={() => setShowBooking(false)}
        />
      )}
      

      <br />
      <br />
{/* What's Included */}
          {service.features?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">What&apos;s Included</h2>
              <div className="grid grid-cols-2 gap-2">
                {service.features.map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}


       

    </div>
    
    
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { getPackages, getServices } from "@/api/customerApi";
import BookingModal from "@/components/ui/BookingModal";
import PackageCard from "@/components/ui/PackageCard";
import { Package, Service } from "@/types";

export default function PromotionsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<Package | undefined>();
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [serviceRows, packageRows] = await Promise.all([getServices(), getPackages()]);
        setServices(serviceRows);
        setPackages(
          packageRows.filter((pkg) => Boolean(pkg.isPromotional || pkg.is_promotional)),
        );
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Failed to load promotions");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const serviceMap = useMemo(
    () => new Map(services.map((service) => [service.id, service])),
    [services],
  );

  const filteredPackages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return packages;
    return packages.filter((pkg) => {
      const service = serviceMap.get(pkg.service_id);
      return (
        pkg.title.toLowerCase().includes(q) ||
        pkg.description.toLowerCase().includes(q) ||
        (service?.title || "").toLowerCase().includes(q) ||
        (service?.category || "").toLowerCase().includes(q) ||
        (service?.location || "").toLowerCase().includes(q)
      );
    });
  }, [packages, search, serviceMap]);

  const handleBook = (pkg: Package) => {
    const service = serviceMap.get(pkg.service_id);
    if (!service) return;
    setSelectedPkg(pkg);
    setSelectedService(service);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 rounded-[32px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,115,0,0.18),_transparent_38%),linear-gradient(135deg,#fff7ed_0%,#ffffff_58%,#fff1e6_100%)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-orange-500">Promotional Packages</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Special package offers ready to book</h1>
            <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
              These are real vendor packages with promotional pricing. Exact discounts show inside each card and stay bookable like any other package.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search promotional packages..."
                className="w-full rounded-2xl border border-white/70 bg-white/90 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-gray-100 bg-white py-20 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-orange-500" />
          <p className="mt-4 text-gray-500">Loading promotional packages...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-700">No promotional packages available right now.</p>
          <p className="mt-2 text-sm text-gray-500">As vendors enable promotions, they will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredPackages.map((pkg) => {
            const service = serviceMap.get(pkg.service_id);
            if (!service) return null;
            return (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                service={service}
                onBook={handleBook}
              />
            );
          })}
        </div>
      )}

      {selectedPkg && selectedService && (
        <BookingModal
          pkg={selectedPkg}
          service={selectedService}
          onClose={() => {
            setSelectedPkg(undefined);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { getServices, getPackages } from "@/api/customerApi";
import { Service, Package } from "@/types";

/**
 * Fetches live services + packages from the eventstan API
 * (https://api.eventstan.com/api/v1/services and /api/v1/packages, proxied
 * through /api/proxy on the client — see next.config.ts rewrites).
 */
export function useMarketplace() {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([getServices(), getPackages()])
      .then(([s, p]) => {
        if (!active) return;
        setServices(s);
        setPackages(p);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load data");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { services, packages, loading, error };
}

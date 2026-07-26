import { Package, Promotion } from "@/types";

// The /packages API returns extra raw fields beyond the typed Package
// interface (isPromotional, promotional_price, items[0].service, etc).
// This type captures the bits we need for the promotions page.
export interface RawApiPackage {
  id: string;
  service_id?: string;
  title?: string;
  description: string;
  price: number;
  name?: string;
  isPromotional?: boolean;
  is_promotional?: boolean;
  promotional_price?: number;
  promotionalPrice?: number;
  original_price?: number;
  exact_price?: number;
  price_unit?: string;
  max_guests?: number;
  duration_hours?: number;
  is_popular?: boolean;
  isPopular?: boolean;
  inclusions?: string[];
  features?: string[];
  items?: Array<{
    service?: {
      id?: string;
      title?: string;
      category?: string | { name?: string; slug?: string };
      city?: string;
      imageUrl?: string;
      vendor_name?: string;
      vendor_email?: string;
      vendor_phone?: string;
    };
  }>;
}

export function isPromotionalPackage(pkg: RawApiPackage): boolean {
  return Boolean(pkg.isPromotional ?? pkg.is_promotional);
}

export function packageToPromotion(pkg: RawApiPackage): Promotion {
  const svc = pkg.items?.[0]?.service;
  const rawCategory =
    typeof svc?.category === "string" ? svc.category : svc?.category?.name;
  const category = (rawCategory as Promotion["category"]) || "Venue";
  const price = pkg.promotional_price ?? pkg.promotionalPrice ?? pkg.price;
  const originalPrice = pkg.original_price ?? pkg.exact_price;

  return {
    id: pkg.id,
    title: pkg.title || pkg.name || "Untitled Package",
    vendor_name: svc?.vendor_name || "",
    vendor_handle: svc?.title || "",
    category,
    image_url: svc?.imageUrl || "",
    description: pkg.description,
    short_desc: pkg.description,
    price,
    price_unit: pkg.price_unit || "package",
    max_guests: pkg.max_guests || 0,
    duration_hours: pkg.duration_hours || 0,
    inclusions: pkg.inclusions || pkg.features || [],
    vendor_email: svc?.vendor_email,
    vendor_phone: svc?.vendor_phone,
    badge: pkg.is_popular || pkg.isPopular ? "Popular" : undefined,
    is_featured: pkg.is_popular || pkg.isPopular || false,
    original_price: originalPrice && originalPrice !== price ? originalPrice : undefined,
    service_id: pkg.service_id || svc?.id || "",
  };
}

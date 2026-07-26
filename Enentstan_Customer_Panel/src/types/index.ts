export interface Service {
  id: string;
  slug?: string;
  title: string;
  category: "Venue" | "Decor" | "Catering" | "Entertainment";
  description: string;
  location: string;
  price_min: number;
  price_max: number;
  price_unit: string;
  rating: number;
  review_count: number;
  image_url: string;
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  tags: string[];
  gallery: string[];
  features: string[];
  created_at: string;
}

export interface Package {
  id: string;
  service_id: string;
  title: string;
  description: string;
  price: number;
  inclusions: string[];
  max_guests: number;
  duration_hours: number;
  is_popular?: boolean;
}

export interface Booking {
  id: string;
  service_id?: string;
  package_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: string;
  event_type: string;
  guest_count: number;
  message: string;
  status: "pending" | "confirmed" | "cancelled";
  total_price: number;
  created_at: string;
}

export interface Review {
  id: string;
  service_id: string;
  reviewer_name: string;
  reviewer_avatar: string;
  rating: number;
  comment: string;
  event_type: string;
  location: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  type: "package" | "service";
  title: string;
  subtitle: string;
  price: number;
  image_url: string;
  pkg?: Package;
  service?: Service;
}



export interface Promotion {
  id: string;
  title: string;
  vendor_name: string;
  vendor_handle: string;
  category: "Venue" | "Decor" | "Catering" | "Entertainment" | "Rentals";
  image_url: string;
  description: string;
  short_desc: string;
  price: number;
  price_unit: string;
  max_guests: number;
  duration_hours: number;
  inclusions: string[];
  vendor_email?: string;
  vendor_phone?: string;
  min_days?: number;
  max_days?: number;
  badge?: string;
  is_featured?: boolean;
  expires_at?: string;
  original_price?: number;
  service_id: string;
}
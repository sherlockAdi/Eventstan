import { Package, Review, Service } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://api.eventstan.com/api/v1";

export { API_BASE_URL };

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function uploadImage(file: File, folder = "customers") {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch(`${API_BASE_URL}/uploads/images?folder=${encodeURIComponent(folder)}`, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    throw new Error(`Image upload failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<{ bucket: string; key: string; url: string; contentType: string; size: number }>;
}

export async function getServices() {
  return apiGet<Service[]>("/services");
}

export async function getService(id: string) {
  return apiGet<Service>(`/services/${encodeURIComponent(id)}`);
}

export async function getPackages() {
  return apiGet<Package[]>("/packages");
}

export async function getReviews() {
  return apiGet<Review[]>("/reviews");
}

export async function getMarketplaceData() {
  const [services, packages, reviews] = await Promise.all([
    getServices(),
    getPackages(),
    getReviews(),
  ]);

  return { services, packages, reviews };
}

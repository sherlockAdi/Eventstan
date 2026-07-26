"use client";
import { useState } from "react";
import Link from "next/link";
import { Service } from "@/types";
import { useCart } from "@/lib/CartContext";

interface Props {
  service: Service;
}

export default function ServiceCard({ service }: Props) {
  const { addService, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = items.some((i) => i.id === `svc-${service.id}`);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addService(service);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <Link href={`/services/${service.slug || service.id}`}>
        <div className="relative h-52 overflow-hidden cursor-pointer">
          <img
            src={service.image_url}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {service.category}
          </span>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/services/${service.slug || service.id}`}>
          <h3 className="font-semibold text-gray-900 text-base mb-1 hover:text-orange-500 transition-colors cursor-pointer">
            {service.title}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm flex items-center gap-1 mb-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {service.location}
        </p>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{service.description}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-900 font-semibold text-sm">
            <span className="text-orange-500">${service.price_min.toLocaleString()}</span>
            {" "}- ${service.price_max.toLocaleString()}
            <span className="text-gray-400 font-normal"> / {service.price_unit}</span>
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-700">
            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {service.rating}
          </span>
        </div>

        {/* Add to Cart button */}
        {/* <button
          onClick={handleAddToCart}
          disabled={inCart}
          className={`w-full py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            inCart
              ? "bg-green-50 text-green-600 border border-green-200 cursor-default"
              : "bg-gray-900 text-white hover:bg-orange-500 active:scale-95"
          }`}
        >
          {inCart ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              In Cart
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {justAdded ? "Added!" : "Add to Cart"}
            </>
          )}
        </button> */}
      </div>
    </div>
  );
}

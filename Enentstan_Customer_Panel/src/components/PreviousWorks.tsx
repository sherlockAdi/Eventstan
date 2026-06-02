'use client';

import { useState } from "react";

const WORKS = [
  {
    category: "Weddings",
    cover: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=900&q=80",
    ],
  },
  {
    category: "Birthdays",
    cover: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&q=80",
      "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=900&q=80",
      "https://images.unsplash.com/photo-1561638763-7c9eee01d0d5?w=900&q=80",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&q=80",
    ],
  },
  {
    category: "Corporate",
    cover: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=900&q=80",
    images: [
      "https://plus.unsplash.com/premium_photo-1723867267…xMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=900&q=80",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&q=80",
    ],
  },
  {
    category: "Proposals",
    cover: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80",
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=900&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=900&q=80",
    ],
  },
  {
    category: "Baby Showers",
    cover: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=900&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=900&q=80",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&q=80",
    ],
  },
  {
    category: "Graduations",
    cover: "https://images.unsplash.com/photo-1555244162-803834f70033?w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1561638763-7c9eee01d0d5?w=900&q=80",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&q=80",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=900&q=80",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=80",
    ],
  },
  {
    category: "Galas",
    cover: "https://images.unsplash.com/photo-1555244162-803834f70033?w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=900&q=80",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80",
      "https://images.unsplash.com/photo-1551038247-3d935814c9aa?w=900&q=80",
    ],
  },
  {
    category: "Concerts",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&q=80",
      "https://images.unsplash.com/photo-1561638763-7c9eee01d0d5?w=900&q=80",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&q=80",
      "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=900&q=80",
    ],
  },
];

export default function PreviousWorks() {
  const [selected, setSelected] = useState<null | typeof WORKS[0]>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  const openModal = (work: typeof WORKS[0]) => {
    setSelected(work);
    setCurrentIdx(0);
  };

  const closeModal = () => setSelected(null);

  const prev = () => setCurrentIdx((i) => (i - 1 + selected!.images.length) % selected!.images.length);
  const next = () => setCurrentIdx((i) => (i + 1) % selected!.images.length);

  return (
    <>
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Our Previous Works</h2>
          <p className="text-gray-500 mt-1">A glimpse into the magical events we&apos;ve helped create</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {WORKS.map((work, i) => (
            <div
              key={i}
              onClick={() => openModal(work)}
              className="relative overflow-hidden rounded-2xl aspect-square group cursor-pointer"
            >
              <img
                src={work.cover}
                alt={work.category}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-semibold bg-black/40 px-3 py-1 rounded-full">
                  {work.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-black/60 absolute top-0 left-0 right-0 z-10">
              <span className="text-white font-semibold text-sm">{selected.category}</span>
              <button onClick={closeModal} className="text-white hover:text-orange-400 transition-colors text-xl leading-none">✕</button>
            </div>

            {/* Image */}
            <div className="relative aspect-video w-full">
              <img
                src={selected.images[currentIdx]}
                alt={`${selected.category} ${currentIdx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Prev / Next */}
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-orange-500 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              >
                ‹
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-orange-500 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              >
                ›
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 p-3 bg-black overflow-x-auto">
              {selected.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === currentIdx ? "border-orange-500" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Counter */}
            <div className="text-center text-xs text-gray-400 pb-3">
              {currentIdx + 1} / {selected.images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
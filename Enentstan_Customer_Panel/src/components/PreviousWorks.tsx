'use client';

import { useState } from "react";

const WORKS = [
  {
    category: "Weddings",
    cover: "/images/previous-works/previous-work-1.jpg",
    images: [
      "/images/previous-works/gallery/previous-work-gallery1.jpg",
      "/images/previous-works/gallery/previous-work-gallery2.jpg",
      "/images/previous-works/gallery/previous-work-gallery3.jpg",
      "/images/previous-works/gallery/previous-work-gallery4.jpg",
    ],
  },
  {
    category: "Birthdays",
    cover: "/images/previous-works/previous-work-2.jpg",
    images: [
      "/images/previous-works/previous-work-2.jpg",
      "/images/previous-works/gallery/previous-work-gallery5.jpg",
      "/images/previous-works/gallery/previous-work-gallery1.jpg",
      "/images/previous-works/previous-work-7.jpg",
    ],
  },
  {
    category: "Corporate",
    cover: "/images/previous-works/previous-work-3.jpg",
    images: [
      "/images/previous-works/previous-work-3.jpg",
      "/images/previous-works/previous-work-1.jpg",
      "/images/previous-works/previous-work-6.jpg",
      "/images/previous-works/previous-work-7.jpg",
    ],
  },
  {
    category: "Proposals",
    cover: "/images/previous-works/previous-work-4.jpg",
    images: [
      "/images/previous-works/previous-work-4.jpg",
      "/images/previous-works/gallery/previous-work-gallery6.jpg",
      "/images/previous-works/gallery/previous-work-gallery7.jpg",
      "/images/previous-works/gallery/previous-work-gallery8.jpg",
    ],
  },
  {
    category: "Baby Showers",
    cover: "/images/previous-works/previous-work-5.jpg",
    images: [
      "/images/previous-works/previous-work-3.jpg",
      "/images/previous-works/previous-work-4.jpg",
      "/images/previous-works/previous-work-4.jpg",
      "/images/previous-works/previous-work-2.jpg",
    ],
  },
  {
    category: "Graduations",
    cover: "/images/previous-works/previous-work-6.jpg",
    images: [
      "/images/previous-works/gallery/previous-work-gallery6.jpg",
      "/images/previous-works/previous-work-7.jpg",
      "/images/previous-works/previous-work-6.jpg",
      "/images/previous-works/previous-work-1.jpg",
    ],
  },
  {
    category: "Galas",
    cover: "/images/previous-works/previous-work-6.jpg",
    images: [
      "/images/previous-works/previous-work-6.jpg",
      "/images/previous-works/previous-work-1.jpg",
      "/images/previous-works/previous-work-4.jpg",
      "/images/previous-works/previous-work-7.jpg",
    ],
  },
  {
    category: "Concerts",
    cover: "/images/previous-works/previous-work-7.jpg",
    images: [
      "/images/previous-works/previous-work-7.jpg",
      "/images/previous-works/gallery/previous-work-gallery6.jpg",
      "/images/previous-works/previous-work-2.jpg",
      "/images/previous-works/previous-work-3.jpg",
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
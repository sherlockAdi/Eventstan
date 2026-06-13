"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle, Clock, Star, Mail, Phone, Calendar, Users } from "lucide-react";

const budgetOptions = [
  "Under $1,000",
  "$1,000 – $5,000",
  "$5,000 – $15,000",
  "$15,000 – $30,000",
  "$30,000+",
];

const serviceOptions = ["Venue", "Decor", "Catering", "Entertainment", "Rentals"];

export default function ContactPage() {
  const [budget, setBudget] = useState<string | null>(null);
  const [services, setServices] = useState<string[]>([]);

  const toggleService = (s: string) => {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-semibold tracking-widest text-orange-500">
            GET IN TOUCH
          </p>
          <h1
            className="mt-3 text-4xl font-bold text-neutral-900 sm:text-5xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Tell Us About Your Event
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-500">
            Fill in your event details and our team will call you back within 24 hours
            with personalised vendor recommendations and a free consultation.
          </p>
        </div>

        {/* Content */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left column */}
          <div className="flex flex-col gap-8">
            <div className="space-y-6">
              <Feature
                icon={<CheckCircle className="h-5 w-5 text-orange-500" />}
                title="Free Consultation"
                desc="No cost, no commitment — just expert advice tailored to your event."
              />
              <Feature
                icon={<Clock className="h-5 w-5 text-orange-500" />}
                title="24-Hour Callback"
                desc="Our team reaches out within one business day to discuss your vision."
              />
              <Feature
                icon={<Star className="h-5 w-5 text-orange-500" />}
                title="Curated Vendors"
                desc="We handpick the best vendors for your budget and style."
              />
            </div>

            <div className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-80 lg:h-full">
              <Image
                src="/images/contact-us/contact-us.jpg"
                alt="Beautifully set event table with floral centerpiece"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Right column - Form */}
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full Name" required>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    className="input"
                  />
                </Field>
                <Field label="Email Address" required>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      className="input pl-9"
                    />
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Phone Number" required>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="input pl-9"
                    />
                  </div>
                </Field>
                <Field label="Event Type" required>
                  <select className="input appearance-none">
                    <option value="">Select event type...</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate</option>
                    <option value="birthday">Birthday</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Preferred Event Date">
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input type="date" className="input pl-9 text-neutral-400" />
                  </div>
                </Field>
                <Field label="Expected Guest Count">
                  <div className="relative">
                    <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="e.g. 50-100"
                      className="input pl-9"
                    />
                  </div>
                </Field>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-neutral-800">Budget Range</p>
                <div className="flex flex-wrap gap-2">
                  {budgetOptions.map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setBudget(b)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        budget === b
                          ? "border-orange-500 bg-orange-50 text-orange-600"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-neutral-800">Services Needed</p>
                <div className="flex flex-wrap gap-2">
                  {serviceOptions.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleService(s)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        services.includes(s)
                          ? "border-orange-500 bg-orange-50 text-orange-600"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Additional Details">
                <textarea
                  rows={4}
                  placeholder="Tell us more about your event vision, special requirements, or any questions..."
                  className="input resize-none"
                />
              </Field>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-600"
              >
                Request a Callback
                <Phone className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-neutral-900">{title}</h3>
        <p className="mt-1 text-sm text-neutral-500">{desc}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-800">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      {children}
    </div>
  );
}

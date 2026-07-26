"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle, Clock, Star, Mail, Phone, Calendar, Users, Loader2 } from "lucide-react";
import { customerApi } from "@/api/customerApi";
import type { Country } from "@/api/customerApi";
import { categoryService, type Category } from "@/services/api/category.service";

const budgetOptions = [
  { label: "Under $1,000", min: 0, max: 1000 },
  { label: "$1,000 – $5,000", min: 1000, max: 5000 },
  { label: "$5,000 – $15,000", min: 5000, max: 15000 },
  { label: "$15,000 – $30,000", min: 15000, max: 30000 },
  { label: "$30,000+", min: 30000, max: 1000000 },
];

const serviceOptions = ["Venue", "Decor", "Catering", "Entertainment", "Rentals"];

// Strips numbers only (keeps everything else the user types)
const stripDigits = (value: string) => value.replace(/[0-9]/g, "");
// Digits only
const sanitizeDigits = (value: string) => value.replace(/\D/g, "");
// Today's date in YYYY-MM-DD, used as the min for the event date picker
// so past dates can't be selected.
const todayStr = new Date().toISOString().split("T")[0];

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryCode, setCountryCode] = useState("+971");
  const [eventType, setEventType] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [preferredEventDate, setPreferredEventDate] = useState("");
  const [expectedGuestCount, setExpectedGuestCount] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [budgetLabel, setBudgetLabel] = useState<string | null>(null);
  const [services, setServices] = useState<string[]>([]);
  const [currency, setCurrency] = useState("AED");

  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    customerApi.masterData.getCountries().then((list) => {
      if (!cancelled && list.length > 0) {
        setCountries(list);
        setCountryCode(list[0].phoneCode);
      }
    });
    categoryService.fetchCategories().then((cats) => {
      if (!cancelled) {
        setCategories(cats.filter((c) => c.isActive));
        setCategoriesLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleService = (s: string) => {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic client-side validation for required fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !eventType ||
      !budgetLabel ||
      services.length === 0
    ) {
      setStatus("error");
      setErrorMsg(
        "Please fill in all required fields (Name, Email, Phone, Event Type, Budget Range, Services Needed)."
      );
      return;
    }

    const selectedBudget = budgetOptions.find((b) => b.label === budgetLabel);

    const payload = {
      fullName,
      email,
      phone: phone ? `${countryCode}${phone}` : phone,
      eventType,
      preferredEventDate: preferredEventDate || undefined,
      expectedGuestCount: expectedGuestCount ? Number(expectedGuestCount) : undefined,
      budgetRange: selectedBudget
        ? {
            min: selectedBudget.min,
            max: selectedBudget.max,
            currency,
          }
        : undefined,
      servicesNeeded: services,
      additionalDetails: additionalDetails || undefined,
    };

    try {
      setStatus("loading");

      await customerApi.leads.submitUserLead(payload);

      setStatus("success");
      // reset form
      setFullName("");
      setEmail("");
      setPhone("");
      setEventType("");
      setPreferredEventDate("");
      setExpectedGuestCount("");
      setAdditionalDetails("");
      setBudgetLabel(null);
      setServices([]);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
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
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <h3 className="text-xl font-semibold text-neutral-900">
                  Thank you!
                </h3>
                <p className="max-w-sm text-sm text-neutral-500">
                  Your request has been submitted. Our team will call you back
                  within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-4 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-300"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Full Name" required>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      className="input"
                      value={fullName}
                      onChange={(e) => setFullName(stripDigits(e.target.value))}
                    />
                  </Field>
                  <Field label="Email Address" required>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="email"
                        placeholder="jane@example.com"
                        className="input pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Phone Number" required>
                    <div className="flex items-stretch overflow-hidden rounded-lg border border-neutral-200 bg-white transition focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="flex-shrink-0 border-r border-neutral-200 bg-transparent py-2.5 pl-3 pr-2 text-sm text-neutral-700 outline-none"
                      >
                        {countries.map((c) => (
                          <option key={c.id} value={c.phoneCode}>
                            {c.flag} {c.phoneCode}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="50 000 0000"
                        className="w-full min-w-0 bg-transparent px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none"
                        value={phone}
                        onChange={(e) => setPhone(sanitizeDigits(e.target.value))}
                      />
                    </div>
                  </Field>
                  <Field label="Event Type" required>
  <select
    className="input"
    value={eventType}
    onChange={(e) => setEventType(e.target.value)}
  >
    <option value="">Select event type...</option>
    <option value="Wedding">Wedding</option>
    <option value="Corporate">Corporate</option>
    <option value="Birthday">Birthday</option>
    <option value="Other">Other</option>
  </select>
</Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Preferred Event Date">
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="date"
                        min={todayStr}
                        className="input pl-9 text-neutral-400"
                        value={preferredEventDate}
                        onChange={(e) => setPreferredEventDate(e.target.value)}
                      />
                    </div>
                  </Field>
                  <Field label="Expected Guest Count">
                    <div className="relative">
                      <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="number"
                        min={1}
                        step={1}
                        placeholder="e.g. 100"
                        className="input pl-9"
                        value={expectedGuestCount}
                        onChange={(e) => {
                          const digits = sanitizeDigits(e.target.value);
                          // Don't allow 0 or a leading-zero count
                          setExpectedGuestCount(
                            digits && Number(digits) > 0 ? String(Number(digits)) : ""
                          );
                        }}
                      />
                    </div>
                  </Field>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-neutral-800">
                      Budget Range <span className="text-orange-500">*</span>
                    </p>
                    
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {budgetOptions.map((b) => (
                      <button
                        type="button"
                        key={b.label}
                        onClick={() => setBudgetLabel(b.label)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          budgetLabel === b.label
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-neutral-800">
                    Services Needed <span className="text-orange-500">*</span>
                  </p>
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
                    value={additionalDetails}
                    onChange={(e) =>
                      setAdditionalDetails(e.target.value.slice(0, 500))
                    }
                    maxLength={500}
                  />
                  <p className="mt-1 text-right text-xs text-neutral-400">
                    {additionalDetails.length}/500 characters
                  </p>
                </Field>

                {status === "error" && errorMsg && (
                  <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "loading" ? (
                    <>
                      Submitting...
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      Request a Callback
                      <Phone className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
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
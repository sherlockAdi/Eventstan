"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  MapPin,
  Phone,
  Mail,
  Shield,
  Loader2,
  Building2,
  User,
  CreditCard,
  CalendarClock,
  Landmark as LandmarkIcon,
  BadgeCheck,
  Globe,
  FileText,
  Percent,
  Lock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Upload,
  ExternalLink,
  X,
  Eye,
  RefreshCw,
  Trash2,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { vendorApi } from "@/api/vendorApi";
import { updateSessionUser } from "@/lib/auth";

interface CountryOption {
  id: number | string;
  code: string;
  country: string;
  flag: string;
}

const DEFAULT_COUNTRY_CODES: CountryOption[] = [
  {
    id: "default-ae",
    code: "+971",
    country: "United Arab Emirates (UAE)",
    flag: "🇦🇪",
  },
];

interface CityOption {
  id: number | string;
  name: string;
  countryId: number;
  countryName?: string;
  status: string;
}

interface CityWithCountry extends CityOption {
  countryName: string;
  stateId?: string | null;
}

interface VendorProfile {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  phoneCountryCode?: string | null;
  vendorProfileImage?: string | null;
  about?: string | null;
  businessLocation?: string | null;
  address?: string | null;
  specialization?: string | null;
  primaryMobile?: string | null;
  cities: string[];
  capacityPerDay: number;
  status: string;
  vendorType?: string | null;
  contractType?: string | null;
  hourlyRate?: number | null;
  availableHoursPerWeek?: number | null;
  projectRate?: number | null;
  salaryType?: string | null;
  basicSalary?: number | null;
  housingAllowance?: number | null;
  transportationAllowance?: number | null;
  otherAllowances?: number | null;
  annualLeaves?: number | null;
  workingHours?: number | null;
  joiningDate?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userName?: string | null;
  primaryEmail?: string | null;
  telephone?: string | null;
  telephoneCountryCode?: string | null;
  primaryMobileCountryCode?: string | null;
  tradeLicenseNumber?: string | null;
  tradeLicenseExpiry?: string | null;
  tradeLicenseFileUrl?: string | null;
  tradeLicenseFileKey?: string | null;
  passportExpiry?: string | null;
  passportFileUrl?: string | null;
  passportFileKey?: string | null;
  emiratesIdExpiry?: string | null;
  vatNumber?: string | null;
  visaType?: string | null;
  planDetails?: string | null;
  planExpiry?: string | null;
  commissionPercent?: string | null;
  agreementFileUrl?: string | null;
  agreementFileKey?: string | null;
  bankName?: string | null;
  accountFullName?: string | null;
  ibanNo?: string | null;
  accountNumber?: string | null;
  swift?: string | null;
  branchAddress?: string | null;
  // Dubai address fields
  addressLine1?: string | null;
  addressLine2?: string | null;
  landmark?: string | null;
  city?: string | null;
  poBox?: string | null;
}

interface CountryMasterRow {
  id: number;
  code: string;
  name: string;
  defaultCurrency: string;
  flag: string;
  currencySymbol: string;
  phoneCode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface VisaTypeMasterRow {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CityMasterRow {
  id: number | string;
  name: string;
  countryId: number;
  stateId?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StateMasterRow {
  id: number | string;
  name: string;
  countryId: number;
  status?: string;
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isPlanExpired(iso?: string | null) {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

function slugifyUsername(first?: string | null, last?: string | null) {
  return [first, last]
    .filter(Boolean)
    .join(" ")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hasValue(value: string | number | string[] | null | undefined) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return value > 0;
  return Boolean(value && String(value).trim());
}

function sanitizeNameInput(value: string) {
  return value.replace(/[^A-Za-z\s'-]/g, "");
}

function sanitizeDigitsInput(value: string) {
  return value.replace(/\D/g, "");
}

function stripCountryCode(value: string | null | undefined, code: string) {
  if (!value) return "";
  if (code && value.startsWith(code)) return value.slice(code.length);
  return value;
}

function sanitizePositiveNumber(value: string) {
  // Strip everything except digits and a single decimal point; no minus sign allowed
  let cleaned = value.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) {
    cleaned =
      cleaned.slice(0, firstDot + 1) +
      cleaned.slice(firstDot + 1).replace(/\./g, "");
  }
  return cleaned;
}

const NAME_MAX_LENGTH = 40;
const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;

// UAE Cities list
const UAE_CITIES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

function SectionCard({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-6 py-4 rounded-2xl hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
            <Icon size={14} className="text-orange-500" />
          </div>
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        </div>
        <ChevronDown
          size={16}
          className={
            "text-gray-400 transition-transform duration-200 " +
            (open ? "rotate-180" : "")
          }
        />
      </button>
      {open ? <div className="px-6 pb-6 pt-1">{children}</div> : null}
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  readOnly = false,
  placeholder = "",
  min,
  max,
  maxLength,
  required = false,
  error,
}: {
  label: string;
  icon?: React.ElementType;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  readOnly?: boolean;
  placeholder?: string;
  min?: string;
  max?: string;
  maxLength?: number;
  required?: boolean;
  error?: string;
}) {
  const showError = (required && !value) || !!error;
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : null}
      </label>
      <div className="relative">
        {Icon ? (
          <Icon
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        ) : null}
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          min={min}
          max={max}
          maxLength={maxLength}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className={
            "w-full py-2.5 text-sm border rounded-xl focus:outline-none transition " +
            (Icon ? "pl-9 pr-4 " : "px-4 ") +
            (readOnly
              ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
              : "border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white text-gray-800") +
            (showError ? " border-red-300" : "")
          }
        />
        {readOnly ? (
          <Lock
            size={11}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
          />
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-500 mt-1">{error}</p> : null}
    </div>
  );
}

function NameField({
  label,
  value,
  onChange,
  icon: Icon = User,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ElementType;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : null}
      </label>
      <div className="relative">
        <Icon
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={value}
          maxLength={NAME_MAX_LENGTH}
          onChange={(e) =>
            onChange(
              sanitizeNameInput(e.target.value).slice(0, NAME_MAX_LENGTH),
            )
          }
          className={
            "w-full py-2.5 pl-9 pr-4 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white text-gray-800 " +
            (required && !value ? "border-red-300" : "border-gray-200")
          }
        />
      </div>
    </div>
  );
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function DateField({
  label,
  value,
  onChange,
  icon: Icon = CalendarClock,
  allowPast = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ElementType;
  allowPast?: boolean;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parsed = value ? new Date(value + "T00:00:00") : null;
  const [viewYear, setViewYear] = useState(
    parsed ? parsed.getFullYear() : today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    parsed ? parsed.getMonth() : today.getMonth(),
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; date: Date; inMonth: boolean }[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth - i,
      date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i),
      inMonth: false,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      date: new Date(viewYear, viewMonth, d),
      inMonth: true,
    });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    cells.push({ day: next.getDate(), date: next, inMonth: false });
  }

  const isCurrentViewMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const prevMonthDisabled = !allowPast && isCurrentViewMonth;

  const goPrevMonth = () => {
    if (prevMonthDisabled) return;
    const m = viewMonth - 1;
    if (m < 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth(m);
    }
  };
  const goNextMonth = () => {
    const m = viewMonth + 1;
    if (m > 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth(m);
    }
  };

  const selectDate = (d: Date) => {
    if (!allowPast && d < today) return;
    onChange(toIsoDate(d));
    setOpen(false);
  };

  const displayLabel = parsed
    ? parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Select date";

  return (
    <div className="relative" ref={ref}>
      <label className="text-xs font-medium text-gray-500 mb-1 block">
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : null}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          "relative w-full flex items-center py-2.5 pl-9 pr-4 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white text-left " +
          (required && !value ? "border-red-300" : "border-gray-200")
        }
      >
        <Icon
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <span className={parsed ? "text-gray-800" : "text-gray-400"}>
          {displayLabel}
        </span>
      </button>

      {open ? (
        <div className="absolute z-30 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-sm font-semibold text-gray-800">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goPrevMonth}
                disabled={prevMonthDisabled}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed text-gray-500"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={goNextMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_LABELS.map((w) => (
              <div
                key={w}
                className="text-center text-[11px] font-medium text-gray-400 py-1"
              >
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              const isPast = !allowPast && cell.date < today;
              const isToday = cell.date.getTime() === today.getTime();
              const isSelected =
                parsed && cell.date.getTime() === parsed.getTime();
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isPast}
                  onClick={() => selectDate(cell.date)}
                  className={
                    "text-xs h-8 w-8 rounded-lg flex items-center justify-center transition-colors " +
                    (isPast
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-700 hover:bg-orange-50 cursor-pointer") +
                    (!cell.inMonth && !isPast ? " text-gray-400" : "") +
                    (isSelected
                      ? " bg-orange-500 text-white hover:bg-orange-500"
                      : "") +
                    (isToday && !isSelected ? " border border-orange-400" : "")
                  }
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 px-1">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-xs font-medium text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth());
                selectDate(today);
              }}
              className="text-xs font-medium text-orange-500 hover:text-orange-600"
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SelectField({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  required = false,
}: {
  label: string;
  icon?: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : null}
      </label>
      <div className="relative">
        {Icon ? (
          <Icon
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        ) : null}
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={
            "w-full py-2.5 pr-9 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white text-gray-800 appearance-none " +
            (disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed " : "") +
            (Icon ? "pl-9 " : "px-4 ") +
            (required && !value ? "border-red-300" : "border-gray-200")
          }
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

function SearchableSelectField({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  required = false,
}: {
  label: string;
  icon?: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div className="relative" ref={ref}>
      <label className="text-xs font-medium text-gray-500 mb-1 block">
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : null}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={
          "relative w-full flex items-center gap-2 py-2.5 pl-9 pr-9 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white text-left transition-colors " +
          (disabled
            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
            : "hover:border-orange-300") +
          " " +
          (required && !value ? "border-red-300" : "border-gray-200")
        }
      >
        {Icon ? (
          <Icon
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        ) : null}
        <span
          className={
            "truncate " + (selected ? "text-gray-800" : "text-gray-400")
          }
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={13}
          className={
            "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      {open && !disabled ? (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-400">
                No matches found
              </p>
            ) : null}
            {filtered.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={
                    "w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-orange-50 transition-colors " +
                    (isSelected
                      ? "text-orange-600 font-medium bg-orange-50/60"
                      : "text-gray-700")
                  }
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected ? (
                    <CheckCircle2
                      size={14}
                      className="text-orange-500 shrink-0"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PhoneField({
  label,
  countryCode,
  number,
  onCountryCodeChange,
  onNumberChange,
  options,
  placeholder = "Number only",
  required = false,
  error,
}: {
  label: string;
  countryCode: string;
  number: string;
  onCountryCodeChange: (v: string) => void;
  onNumberChange: (v: string) => void;
  options: CountryOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((c) => c.code === countryCode) ?? options[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showError = (required && !number) || !!error;

  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : null}
      </label>
      <div
        className={
          "flex items-stretch border rounded-xl overflow-visible focus-within:ring-2 focus-within:ring-orange-200 focus-within:border-orange-400 bg-white relative " +
          (showError ? "border-red-300" : "border-gray-200")
        }
      >
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 h-full pl-3 pr-2.5 py-2.5 text-sm border-r border-gray-200 rounded-l-xl hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg leading-none">{selected?.flag}</span>
            <span className="text-gray-700 font-medium">{selected?.code}</span>
            <ChevronDown size={12} className="text-gray-400" />
          </button>
          {open ? (
            <div className="absolute z-30 top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto py-1">
              {options.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onCountryCodeChange(c.code);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-gray-50"
                >
                  <span className="text-lg leading-none">{c.flag}</span>
                  <span className="flex-1 text-gray-700">{c.country}</span>
                  <span className="text-gray-400">{c.code}</span>
                  {c.code === countryCode ? (
                    <CheckCircle2 size={14} className="text-orange-500" />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <input
          type="tel"
          inputMode="numeric"
          value={number}
          placeholder={placeholder}
          onChange={(e) =>
            onNumberChange(
              sanitizeDigitsInput(e.target.value).slice(0, PHONE_MAX_DIGITS),
            )
          }
          className="flex-1 min-w-0 py-2.5 px-3 text-sm rounded-r-xl focus:outline-none bg-white text-gray-800"
        />
      </div>
      {error ? <p className="text-xs text-red-500 mt-1">{error}</p> : null}
    </div>
  );
}

function FileUploadField({
  label,
  fileUrl,
  onUploaded,
  folder,
  maxSizeMb = 3,
  readOnly = false,
}: {
  label: string;
  fileUrl?: string | null;
  onUploaded: (result: { url: string; key: string }) => void;
  folder: string;
  maxSizeMb?: number;
  readOnly?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [sizeError, setSizeError] = useState("");

  const inputId =
    "upload-" + folder + "-" + label.replace(/\s+/g, "-").toLowerCase();

  const handleFile = async (file: File) => {
    setSizeError("");

    const maxBytes = maxSizeMb * 1024 * 1024;

    if (file.size > maxBytes) {
      setSizeError("File must be " + maxSizeMb + "MB or smaller.");
      return;
    }

    try {
      setUploading(true);

      const result = await vendorApi.uploads.image(file, folder);

      onUploaded({
        url: result.url,
        key: result.key,
      });
    } catch (error) {
      console.error("File upload failed:", error);
      setSizeError("File upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (readOnly) {
    return (
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-100 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed">
            <Lock size={13} className="text-gray-300 shrink-0" />
            <span className="truncate">
              {fileUrl ? "File uploaded by admin" : "No file uploaded"}
            </span>
          </div>
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-orange-500 hover:border-orange-300 transition shrink-0"
              title="View uploaded file"
            >
              <ExternalLink size={14} />
            </a>
          ) : null}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          This document is managed by the admin team. You can only view it here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <label
          htmlFor={inputId}
          className="flex-1 flex items-center gap-2 px-4 py-2.5 text-sm border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/40 transition text-gray-500"
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin text-orange-500" />
          ) : (
            <Upload size={14} className="text-gray-400" />
          )}

          <span className="truncate">
            {uploading
              ? "Uploading..."
              : fileUrl
                ? "Replace file"
                : "Upload file (PDF, JPG, PNG, max " + maxSizeMb + "MB)"}
          </span>
        </label>

        <input
          id={inputId}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              void handleFile(file);
            }

            e.target.value = "";
          }}
        />

        {fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-orange-500 hover:border-orange-300 transition shrink-0"
            title="View uploaded file"
          >
            <ExternalLink size={14} />
          </a>
        ) : null}
      </div>

      {sizeError ? (
        <p className="text-xs text-red-500 mt-1">{sizeError}</p>
      ) : null}

      <p className="text-xs text-gray-400 mt-1">
        {fileUrl
          ? "File uploaded. The link updates once you replace it."
          : "No file uploaded yet."}{" "}
        Max file size:{" "}
        <span className="font-medium text-gray-500">{maxSizeMb}MB</span>.
      </p>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">
        {label}
      </label>
      <div className="relative">
        <Lock
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          className="w-full py-2.5 pl-9 pr-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white text-gray-800"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          {visible ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setSaving(true);
    try {
      await vendorApi.auth.changePassword({ currentPassword, newPassword });
      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to change password",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Change Password" icon={Lock}>
      <div className="space-y-4">
        {success ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            <CheckCircle2 size={15} /> {success}
          </div>
        ) : null}
        {error ? (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <AlertTriangle size={15} /> {error}
          </div>
        ) : null}
        <div className="grid sm:grid-cols-2 gap-4">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <div />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
        </div>
        <p className="text-xs text-gray-400">
          Use at least 8 characters. You'll stay signed in on this device.
        </p>
        <button
          type="button"
          onClick={handleChangePassword}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Lock size={15} />
          )}
          {saving ? "Changing..." : "Change Password"}
        </button>
      </div>
    </SectionCard>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [countryCodes, setCountryCodes] = useState<CountryOption[]>(
    DEFAULT_COUNTRY_CODES,
  );
  const [visaTypes, setVisaTypes] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [allCities, setAllCities] = useState<CityWithCountry[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [citiesMenuOpen, setCitiesMenuOpen] = useState(false);
  const [visibleCityCount, setVisibleCityCount] = useState(10);
  const citiesListRef = useRef<HTMLDivElement | null>(null);
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const citiesMenuRef = useRef<HTMLDivElement | null>(null);

  const [serviceCountryId, setServiceCountryId] = useState<string>("");
  const [serviceStateId, setServiceStateId] = useState<string>("");
  const [serviceCityFilter, setServiceCityFilter] = useState<string>("");
  const [serviceStates, setServiceStates] = useState<StateMasterRow[]>([]);
  const [serviceStatesLoading, setServiceStatesLoading] = useState(false);

  const [locationCountries, setLocationCountries] = useState<
    { id: number; name: string }[]
  >([]);
  const [locationStates, setLocationStates] = useState<StateMasterRow[]>([]);
  const [locationCities, setLocationCities] = useState<CityMasterRow[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const [selectedCityName, setSelectedCityName] = useState<string>("");
  const [statesLoading, setStatesLoading] = useState(false);
  const [statesUnavailable, setStatesUnavailable] = useState(false);
  const [locCitiesLoading, setLocCitiesLoading] = useState(false);
  const [locationPrefilled, setLocationPrefilled] = useState(false);

  const [addressStates, setAddressStates] = useState<StateMasterRow[]>([]);
  const [addressCities, setAddressCities] = useState<CityMasterRow[]>([]);
  const [addressCountryId, setAddressCountryId] = useState<string>("");
  const [addressStateId, setAddressStateId] = useState<string>("");
  const [addressCityName, setAddressCityName] = useState<string>("");
  const [addressStatesLoading, setAddressStatesLoading] = useState(false);
  const [addressStatesUnavailable, setAddressStatesUnavailable] =
    useState(false);
  const [addressCitiesLoading, setAddressCitiesLoading] = useState(false);
  const [addressPrefilled, setAddressPrefilled] = useState(false);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    setVisibleCityCount(10);
  }, [citySearchQuery, citiesMenuOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(e.target as Node)
      ) {
        setAvatarMenuOpen(false);
      }
      if (
        citiesMenuRef.current &&
        !citiesMenuRef.current.contains(e.target as Node)
      ) {
        setCitiesMenuOpen(false);
        setCitySearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    vendorApi.profile
      .get<VendorProfile>()
      .then((data) => {
        const code =
          data.phoneCountryCode ||
          data.telephoneCountryCode ||
          data.primaryMobileCountryCode ||
          "+971";

        if (data.primaryEmail) {
          data.email = data.primaryEmail;
        }

        setProfile({
          ...data,
          phoneCountryCode: code,
          telephoneCountryCode: code,
          primaryMobileCountryCode: code,
          telephone: stripCountryCode(data.telephone, code),
          primaryMobile: stripCountryCode(data.primaryMobile, code),
        });
      })
      .catch((cause: unknown) =>
        setError(
          cause instanceof Error ? cause.message : "Unable to load profile",
        ),
      )
      .finally(() => setLoading(false));

    vendorApi.masterData
      .categories<Array<{ id: string; name: string }>>()
      .then(setCategories)
      .catch((cause: unknown) =>
        console.error("Unable to load categories:", cause),
      );
    vendorApi.masterData
      .countries<CountryMasterRow[]>()
      .then((data) => {
        const active = data.filter((c) => c.status === "Active");
        const mapped = active
          .filter((c) => c.phoneCode)
          .map((c) => ({
            id: c.id,
            code: c.phoneCode,
            country: c.name,
            flag: c.flag,
          }));
        if (mapped.length) setCountryCodes(mapped);
        setLocationCountries(active.map((c) => ({ id: c.id, name: c.name })));
      })
      .catch((cause: unknown) =>
        console.error("Unable to load countries:", cause),
      );
    vendorApi.masterData
      .visaTypes<VisaTypeMasterRow[]>()
      .then((data) => {
        const mapped = data
          .filter((v) => v.status === "Active")
          .map((v) => ({ value: v.name, label: v.name }));
        setVisaTypes(mapped);
      })
      .catch((cause: unknown) =>
        console.error("Unable to load visa types:", cause),
      );

    (async () => {
      setCitiesLoading(true);
      try {
        const countries =
          await vendorApi.masterData.countries<CountryMasterRow[]>();
        const activeCountries = countries.filter((c) => c.status === "Active");
        const countryMap = new Map(activeCountries.map((c) => [c.id, c.name]));

        let cities = await vendorApi.masterData
          .cities<CityMasterRow[]>()
          .catch(() => [] as CityMasterRow[]);

        if (!cities || cities.length === 0) {
          const perCountry = await Promise.allSettled(
            activeCountries.map((country) =>
              vendorApi.masterData.cities<CityMasterRow[]>(country.id),
            ),
          );
          cities = perCountry
            .filter(
              (r): r is PromiseFulfilledResult<CityMasterRow[]> =>
                r.status === "fulfilled",
            )
            .flatMap((r) => r.value ?? []);
        }

        const mapped: CityWithCountry[] = cities
          .filter((city) => city.status === "Active")
          .map((city) => ({
            id: city.id,
            name: city.name,
            countryId: city.countryId,
            countryName: countryMap.get(city.countryId) ?? "",
            status: city.status,
            stateId: city.stateId ?? null,
          }));

        setAllCities(mapped);
      } catch (cause) {
        console.error("Unable to load cities:", cause);
      } finally {
        setCitiesLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!profile) return;
    const generated = slugifyUsername(profile.firstName, profile.lastName);
    if (generated && generated !== profile.userName) {
      setProfile((cur) => (cur ? { ...cur, userName: generated } : cur));
    }
  }, [profile?.firstName, profile?.lastName]);

  useEffect(() => {
    if (!selectedCountryId) {
      setLocationStates([]);
      setStatesUnavailable(false);
      return;
    }
    setStatesLoading(true);
    setStatesUnavailable(false);
    vendorApi.masterData
      .states<StateMasterRow[]>(Number(selectedCountryId))
      .then((data) =>
        setLocationStates(
          data.filter((s) => !s.status || s.status === "Active"),
        ),
      )
      .catch(() => {
        setLocationStates([]);
        setStatesUnavailable(true);
      })
      .finally(() => setStatesLoading(false));
  }, [selectedCountryId]);

  useEffect(() => {
    if (!selectedCountryId) {
      setLocationCities([]);
      return;
    }
    setLocCitiesLoading(true);
    vendorApi.masterData
      .cities<CityMasterRow[]>(
        Number(selectedCountryId),
        selectedStateId || undefined,
      )
      .then((data) =>
        setLocationCities(data.filter((c) => c.status === "Active")),
      )
      .catch(() => setLocationCities([]))
      .finally(() => setLocCitiesLoading(false));
  }, [selectedCountryId, selectedStateId]);

  useEffect(() => {
    if (locationPrefilled) return;
    if (!profile?.businessLocation || locationCountries.length === 0) return;
    setLocationPrefilled(true);

    const parts = profile.businessLocation.split(",").map((p) => p.trim());
    const cityGuess = parts[parts.length - 1];
    const countryGuess = parts.length >= 3 ? parts[0] : null;

    (async () => {
      const candidateCountries = countryGuess
        ? locationCountries.filter(
            (c) => c.name.toLowerCase() === countryGuess.toLowerCase(),
          )
        : locationCountries;
      const searchList = candidateCountries.length
        ? candidateCountries
        : locationCountries;

      for (const country of searchList) {
        try {
          const cities = await vendorApi.masterData.cities<CityMasterRow[]>(
            country.id,
          );
          const match = cities.find(
            (c) => c.name.toLowerCase() === cityGuess.toLowerCase(),
          );
          if (match) {
            setSelectedCountryId(String(country.id));
            setSelectedStateId(match.stateId ? String(match.stateId) : "");
            setSelectedCityName(match.name);
            update("city", match.name);
            return;
          }
        } catch {}
      }
    })();
  }, [profile?.businessLocation, locationCountries, locationPrefilled]);

  useEffect(() => {
    if (!addressCountryId) {
      setAddressStates([]);
      setAddressStatesUnavailable(false);
      return;
    }
    setAddressStatesLoading(true);
    setAddressStatesUnavailable(false);
    vendorApi.masterData
      .states<StateMasterRow[]>(Number(addressCountryId))
      .then((data) =>
        setAddressStates(
          data.filter((s) => !s.status || s.status === "Active"),
        ),
      )
      .catch(() => {
        setAddressStates([]);
        setAddressStatesUnavailable(true);
      })
      .finally(() => setAddressStatesLoading(false));
  }, [addressCountryId]);

  useEffect(() => {
    if (!addressCountryId) {
      setAddressCities([]);
      return;
    }
    setAddressCitiesLoading(true);
    vendorApi.masterData
      .cities<CityMasterRow[]>(
        Number(addressCountryId),
        addressStateId || undefined,
      )
      .then((data) =>
        setAddressCities(data.filter((c) => c.status === "Active")),
      )
      .catch(() => setAddressCities([]))
      .finally(() => setAddressCitiesLoading(false));
  }, [addressCountryId, addressStateId]);

  useEffect(() => {
    if (addressPrefilled) return;
    if (!profile?.address || locationCountries.length === 0) return;
    setAddressPrefilled(true);

    const parts = profile.address.split(",").map((p) => p.trim());
    const cityGuess = parts[parts.length - 1];
    const countryGuess = parts.length >= 3 ? parts[0] : null;

    (async () => {
      const candidateCountries = countryGuess
        ? locationCountries.filter(
            (c) => c.name.toLowerCase() === countryGuess.toLowerCase(),
          )
        : locationCountries;
      const searchList = candidateCountries.length
        ? candidateCountries
        : locationCountries;

      for (const country of searchList) {
        try {
          const cities = await vendorApi.masterData.cities<CityMasterRow[]>(
            country.id,
          );
          const match = cities.find(
            (c) => c.name.toLowerCase() === cityGuess.toLowerCase(),
          );
          if (match) {
            setAddressCountryId(String(country.id));
            setAddressStateId(match.stateId ? String(match.stateId) : "");
            setAddressCityName(match.name);
            return;
          }
        } catch {}
      }
    })();
  }, [profile?.address, locationCountries, addressPrefilled]);

  useEffect(() => {
    if (!serviceCountryId) {
      setServiceStates([]);
      setServiceStateId("");
      setServiceCityFilter("");
      return;
    }
    setServiceStatesLoading(true);
    setServiceStateId("");
    setServiceCityFilter("");
    vendorApi.masterData
      .states<StateMasterRow[]>(Number(serviceCountryId))
      .then((data) =>
        setServiceStates(
          data.filter((s) => !s.status || s.status === "Active"),
        ),
      )
      .catch(() => setServiceStates([]))
      .finally(() => setServiceStatesLoading(false));
  }, [serviceCountryId]);

  useEffect(() => {
    setServiceCityFilter("");
  }, [serviceStateId]);

  const update = <K extends keyof VendorProfile>(
    key: K,
    value: VendorProfile[K],
  ) => setProfile((cur) => (cur ? { ...cur, [key]: value } : cur));

  const setSharedCountryCode = (code: string) => {
    setProfile((cur) =>
      cur
        ? {
            ...cur,
            phoneCountryCode: code,
            telephoneCountryCode: code,
            primaryMobileCountryCode: code,
          }
        : cur,
    );
  };

  const setPersonalContactNumber = (value: string) => {
    setProfile((cur) =>
      cur
        ? {
            ...cur,
            telephone: value,
            primaryMobile: value,
          }
        : cur,
    );
  };

  const toggleCity = (cityName: string) => {
    if (!profile) return;
    const currentCities = profile.cities || [];
    const updated = currentCities.includes(cityName)
      ? currentCities.filter((c) => c !== cityName)
      : [...currentCities, cityName];
    update("cities", updated);
  };

  const filteredCities = allCities.filter((city) => {
    if (serviceCountryId && String(city.countryId) !== serviceCountryId)
      return false;
    if (serviceStateId && String(city.stateId ?? "") !== serviceStateId)
      return false;
    if (serviceCityFilter && city.name !== serviceCityFilter) return false;
    if (
      citySearchQuery &&
      !city.name.toLowerCase().includes(citySearchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const serviceCityOptions = allCities.filter((city) => {
    if (serviceCountryId && String(city.countryId) !== serviceCountryId)
      return false;
    if (serviceStateId && String(city.stateId ?? "") !== serviceStateId)
      return false;
    return true;
  });

  const validateRequiredFields = () => {
    const errors: Record<string, string> = {};
    const isFreelancerCheck = profile?.vendorType === "FREELANCER";

    if (!profile?.companyName?.trim()) {
      errors.companyName = "Business Name is required";
    }
    if (!profile?.contactPerson?.trim()) {
      errors.contactPerson = "Contact Person is required";
    }
    if (!profile?.primaryEmail?.trim()) {
      errors.primaryEmail = "Email Address is required";
    }
    if (!profile?.phone?.trim()) {
      errors.phone = "Phone Number is required";
    } else if (
      profile.phone.length < PHONE_MIN_DIGITS ||
      profile.phone.length > PHONE_MAX_DIGITS
    ) {
      errors.phone =
        "Phone Number must be " +
        PHONE_MIN_DIGITS +
        "-" +
        PHONE_MAX_DIGITS +
        " digits";
    }
    if (
      profile?.telephone &&
      (profile.telephone.length < PHONE_MIN_DIGITS ||
        profile.telephone.length > PHONE_MAX_DIGITS)
    ) {
      errors.telephone =
        "Number must be " +
        PHONE_MIN_DIGITS +
        "-" +
        PHONE_MAX_DIGITS +
        " digits";
    }
    if (!profile?.cities || profile.cities.length === 0) {
      errors.cities = "At least one Service City is required";
    }
    if (!profile?.capacityPerDay || profile.capacityPerDay < 1) {
      errors.capacityPerDay = "Daily Booking Capacity is required";
    }

    const positiveNumericFields: Array<{
      key: keyof VendorProfile;
      label: string;
    }> = isFreelancerCheck
      ? [
          { key: "hourlyRate", label: "Hourly / Monthly Rate" },
          { key: "availableHoursPerWeek", label: "Available Hours per Week" },
          { key: "projectRate", label: "Project Rate" },
        ]
      : [
          { key: "basicSalary", label: "Basic Salary" },
          { key: "housingAllowance", label: "Housing Allowance" },
          { key: "transportationAllowance", label: "Transportation Allowance" },
          { key: "otherAllowances", label: "Other Allowances" },
          { key: "annualLeaves", label: "Annual Leaves" },
          { key: "workingHours", label: "Working Hours per Week" },
        ];

    positiveNumericFields.forEach(({ key, label }) => {
      const value = profile?.[key] as number | null | undefined;
      if (value !== null && value !== undefined && value <= 0) {
        errors[key as string] = label + " must be greater than 0";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!profile) return;

    if (!validateRequiredFields()) {
      setError("Please fill in all required fields marked with *");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const validContractTypes = ["hourly", "monthly", "project"];
      let contractTypeValue = profile.contractType ?? "";
      if (
        !contractTypeValue ||
        !validContractTypes.includes(contractTypeValue)
      ) {
        contractTypeValue = "hourly";
      }

      const sharedCode = profile.phoneCountryCode ?? "+971";

      const updated = await vendorApi.profile.update<VendorProfile>({
        companyName: profile.companyName,
        contactPerson: profile.contactPerson,
        primaryEmail: profile.primaryEmail ?? "",
        email: profile.primaryEmail ?? "",
        phone: profile.phone,
        countryCode: sharedCode,
        vendorProfileImage: profile.vendorProfileImage ?? "",
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        userName: profile.userName ?? "",
        telephone: sharedCode + (profile.telephone ?? ""),
        primaryMobile: sharedCode + (profile.telephone ?? ""),
        about: profile.about ?? "",
        businessLocation: profile.businessLocation ?? "",
        address: profile.address ?? "",
        specialization: profile.specialization ?? "",
        cities: profile.cities,
        capacityPerDay: profile.capacityPerDay,
        tradeLicenseNumber: profile.tradeLicenseNumber ?? "",
        tradeLicenseExpiry: profile.tradeLicenseExpiry ?? "",
        tradeLicenseFileUrl: profile.tradeLicenseFileUrl ?? "",
        tradeLicenseFileKey: profile.tradeLicenseFileKey ?? "",
        tradeLicenseFile: {},
        passportExpiry: profile.passportExpiry ?? "",
        passportFileUrl: profile.passportFileUrl ?? "",
        passportFileKey: profile.passportFileKey ?? "",
        passportFile: {},
        emiratesIdExpiry: profile.emiratesIdExpiry ?? "",
        vatNumber: profile.vatNumber ?? "",
        visaType: profile.visaType ?? "",
        contractType: contractTypeValue,
        hourlyRate: profile.hourlyRate ?? undefined,
        availableHoursPerWeek: profile.availableHoursPerWeek ?? undefined,
        projectRate: profile.projectRate ?? undefined,
        salaryType: profile.salaryType ?? "",
        basicSalary: profile.basicSalary ?? undefined,
        housingAllowance: profile.housingAllowance ?? undefined,
        transportationAllowance: profile.transportationAllowance ?? undefined,
        otherAllowances: profile.otherAllowances ?? undefined,
        annualLeaves: profile.annualLeaves ?? undefined,
        workingHours: profile.workingHours ?? undefined,
        joiningDate: profile.joiningDate ?? "",
        planDetails: profile.planDetails ?? "",
        planExpiry: profile.planExpiry ?? "",
        commissionPercent: profile.commissionPercent
          ? Number(profile.commissionPercent)
          : 0,
        agreementFileUrl: profile.agreementFileUrl ?? "",
        agreementFileKey: profile.agreementFileKey ?? "",
        agreementFile: {},
        bankName: profile.bankName ?? "",
        accountFullName: profile.accountFullName ?? "",
        ibanNo: profile.ibanNo ?? "",
        accountNumber: profile.accountNumber ?? "",
        swift: profile.swift ?? "",
        branchAddress: profile.branchAddress ?? "",
        // Dubai address fields
        addressLine1: profile.addressLine1 ?? "",
        addressLine2: profile.addressLine2 ?? "",
        landmark: profile.landmark ?? "",
        poBox: profile.poBox ?? "",
      });

      const code = updated.phoneCountryCode || sharedCode;

      setProfile({
        ...updated,
        phoneCountryCode: code,
        telephoneCountryCode: code,
        primaryMobileCountryCode: code,
        telephone: stripCountryCode(updated.telephone, code),
        primaryMobile: stripCountryCode(updated.primaryMobile, code),
      });
      updateSessionUser({
        companyName: updated.companyName,
        email: updated.primaryEmail ?? "",
        phone: updated.phone,
        image: updated.vendorProfileImage,
        updatedProfile: true,
      });
      setMessage("Profile saved successfully.");
      router.replace("/vendor/dashboard");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save profile",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={28} />
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        {error || "Vendor profile not found."}
      </div>
    );
  }

  const expired = isPlanExpired(profile.planExpiry);
  const isFreelancer = profile.vendorType === "FREELANCER";
  const completionChecks = [
    { label: "Business name", done: hasValue(profile.companyName) },
    { label: "Contact person", done: hasValue(profile.contactPerson) },
    { label: "Email", done: hasValue(profile.primaryEmail) },
    { label: "Phone number", done: hasValue(profile.phone) },
    { label: "Description", done: hasValue(profile.about) },
    { label: "Business location", done: hasValue(profile.businessLocation) },
    { label: "Address", done: hasValue(profile.address) },
    { label: "Address Line 1", done: hasValue(profile.addressLine1) },
    { label: "Address Line 2", done: hasValue(profile.addressLine2) },
    { label: "Landmark", done: hasValue(profile.landmark) },
    { label: "City", done: hasValue(profile.city) },
    { label: "PO Box", done: hasValue(profile.poBox) },
    { label: "Specialization", done: hasValue(profile.specialization) },
    { label: "Service cities", done: hasValue(profile.cities) },
    ...(isFreelancer
      ? []
      : [
          {
            label: "Trade license",
            done: hasValue(profile.tradeLicenseNumber),
          },
          {
            label: "Trade license expiry",
            done: hasValue(profile.tradeLicenseExpiry),
          },
        ]),
    { label: "VAT number", done: hasValue(profile.vatNumber) },
    { label: "Primary mobile", done: hasValue(profile.primaryMobile) },
    { label: "Passport expiry", done: hasValue(profile.passportExpiry) },
    { label: "Emirates ID expiry", done: hasValue(profile.emiratesIdExpiry) },
    { label: "Bank name", done: hasValue(profile.bankName) },
    { label: "Account name", done: hasValue(profile.accountFullName) },
    { label: "IBAN", done: hasValue(profile.ibanNo) },
  ];
  const completedFields = completionChecks.filter((item) => item.done).length;
  const totalFields = completionChecks.length;
  const completionPercent = Math.round((completedFields / totalFields) * 100);
  const missingFields = completionChecks
    .filter((item) => !item.done)
    .map((item) => item.label);

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage business information used by customers and EventStan.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Profile completion
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {completedFields} of {totalFields} key profile fields completed
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-500">
              {completionPercent}%
            </p>
            <p className="text-xs text-gray-400">
              {completionPercent === 100
                ? "Profile complete"
                : "Complete more fields to strengthen your profile"}
            </p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-300"
            style={{ width: completionPercent + "%" }}
          />
        </div>
        {missingFields.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">
              Still missing
            </p>
            <div className="flex flex-wrap gap-2">
              {missingFields.map((field) => (
                <span
                  key={field}
                  className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {completionPercent === 100 ? (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 size={16} />
            Your profile is fully completed.
          </div>
        ) : null}
      </div>

      {message ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm flex items-center gap-2">
          <Shield size={15} /> {message}
        </div>
      ) : null}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div className="relative shrink-0" ref={avatarMenuRef}>
          <button
            type="button"
            onClick={() => setAvatarMenuOpen((o) => !o)}
            className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden group focus:outline-none"
            title="Manage profile photo"
          >
            {profile.vendorProfileImage ? (
              <img
                src={profile.vendorProfileImage}
                alt={profile.companyName}
                className="w-full h-full object-cover"
              />
            ) : (
              profile.companyName
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingAvatar ? (
                <Loader2 size={16} className="animate-spin text-white" />
              ) : (
                <Upload size={16} className="text-white" />
              )}
            </div>
          </button>

          {avatarMenuOpen ? (
            <div className="absolute z-20 top-full left-0 mt-2 w-40 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 overflow-hidden">
              {profile.vendorProfileImage ? (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarMenuOpen(false);
                    setShowPhoto(true);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye size={14} className="text-gray-400" /> View
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setAvatarMenuOpen(false);
                  avatarInputRef.current?.click();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw size={14} className="text-gray-400" />
                {profile.vendorProfileImage ? "Replace" : "Upload"}
              </button>
              {profile.vendorProfileImage ? (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarMenuOpen(false);
                    update("vendorProfileImage", null);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Remove
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
              setUploadingAvatar(true);
              const result = await vendorApi.uploads.image(file, "vendors");
              update("vendorProfileImage", result.url);
            } catch {
            } finally {
              setUploadingAvatar(false);
            }
          }}
        />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {profile.companyName}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {[profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
              "—"}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {profile.primaryEmail}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={
                "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full " +
                (profile.status === "APPROVED"
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700")
              }
            >
              <BadgeCheck size={11} />
              {profile.status.replaceAll("_", " ")}
            </span>
           {profile.vendorType ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                <Building2 size={11} />
                {profile.vendorType === "FREELANCER" 
                  ? "Professional" 
                  : "Service Provider"}
              </span>
            ) : null}
          </div>
        </div>
        {profile.planDetails ? (
          <div className="ml-auto text-right shrink-0">
            <p className="text-xs font-semibold text-orange-600">
              {profile.planDetails}
            </p>
            <p
              className={
                "text-xs mt-0.5 " + (expired ? "text-red-500" : "text-gray-400")
              }
            >
              {expired ? "Expired" : "Valid until"}{" "}
              {formatDate(profile.planExpiry)}
            </p>
          </div>
        ) : null}
      </div>

      <SectionCard title="Personal Information" icon={User} defaultOpen>
        <div className="grid sm:grid-cols-2 gap-4">
          <NameField
            label="First Name"
            value={profile.firstName ?? ""}
            onChange={(v) => update("firstName", v)}
          />
          <NameField
            label="Last Name"
            value={profile.lastName ?? ""}
            onChange={(v) => update("lastName", v)}
          />
          <Field
            label="Email Address"
            value={profile.primaryEmail ?? ""}
            onChange={(v) => {
              update("primaryEmail", v);
              update("email", v);
            }}
            type="email"
            icon={Mail}
            readOnly
            required
            error={validationErrors.primaryEmail}
          />
          <PhoneField
            label="Contact Number"
            countryCode={profile.phoneCountryCode ?? "+971"}
            number={profile.telephone ?? ""}
            onCountryCodeChange={setSharedCountryCode}
            onNumberChange={setPersonalContactNumber}
            options={countryCodes}
            error={validationErrors.telephone}
          />
        </div>
      </SectionCard>

      <SectionCard title="Business Information" icon={Building2}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Business Name"
            value={profile.companyName}
            onChange={(v) => update("companyName", v)}
            icon={Building2}
            required
            error={validationErrors.companyName}
          />
          <Field
            label="Contact Person"
            value={profile.contactPerson}
            onChange={(v) => update("contactPerson", v)}
            required
            error={validationErrors.contactPerson}
          />
          <PhoneField
            label="Phone Number"
            countryCode={profile.phoneCountryCode ?? "+971"}
            number={profile.phone ?? ""}
            onCountryCodeChange={setSharedCountryCode}
            onNumberChange={(v) => update("phone", v)}
            options={countryCodes}
            placeholder="Phone number"
            required
            error={validationErrors.phone}
          />
          <SearchableSelectField
            label="Specialization"
            value={
              categories.find(
                (c) =>
                  c.name.trim().toLowerCase() ===
                  (profile.specialization ?? "").trim().toLowerCase(),
              )?.name ??
              profile.specialization ??
              ""
            }
            onChange={(v) => update("specialization", v)}
            options={categories.map((c) => ({ value: c.name, label: c.name }))}
            placeholder="Select category"
          />

          {/* Business Location (Country/State/City + UAE Address) — single combined card */}
          <div className="sm:col-span-2">
            <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <MapPin size={12} className="text-orange-600" />
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  Business Location
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <SearchableSelectField
                  label="Country"
                  icon={Globe}
                  value={selectedCountryId}
                  onChange={(v) => {
                    setSelectedCountryId(v);
                    setSelectedStateId("");
                    setSelectedCityName("");
                    update("businessLocation", "");
                  }}
                  options={locationCountries.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  }))}
                  placeholder="Search country..."
                />
                <SearchableSelectField
                  label="State"
                  icon={MapPin}
                  value={selectedStateId}
                  onChange={(v) => {
                    setSelectedStateId(v);
                    setSelectedCityName("");
                    update("businessLocation", "");
                  }}
                  options={locationStates.map((s) => ({
                    value: String(s.id),
                    label: s.name,
                  }))}
                  placeholder={
                    !selectedCountryId
                      ? "Select country first"
                      : statesLoading
                        ? "Loading..."
                        : statesUnavailable
                          ? "State list unavailable"
                          : locationStates.length === 0
                            ? "No states found"
                            : "Search state..."
                  }
                  disabled={
                    !selectedCountryId || statesLoading || statesUnavailable
                  }
                />
                <SearchableSelectField
                  label="City (Business Location)"
                  icon={MapPin}
                  value={selectedCityName}
                  onChange={(cityName) => {
                    setSelectedCityName(cityName);
                    const countryName =
                      locationCountries.find(
                        (c) => String(c.id) === selectedCountryId,
                      )?.name ?? "";
                    const stateName =
                      locationStates.find(
                        (s) => String(s.id) === selectedStateId,
                      )?.name ?? "";
                    update(
                      "businessLocation",
                      [countryName, stateName, cityName]
                        .filter(Boolean)
                        .join(", "),
                    );
                    update("city", cityName);
                  }}
                  options={locationCities.map((c) => ({
                    value: c.name,
                    label: c.name,
                  }))}
                  placeholder={
                    !selectedCountryId
                      ? "Select country first"
                      : locCitiesLoading
                        ? "Loading..."
                        : locationCities.length === 0
                          ? "No cities found"
                          : "Search city..."
                  }
                  disabled={!selectedCountryId || locCitiesLoading}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field
                  label="Address Line 1"
                  value={profile.addressLine1 ?? ""}
                  onChange={(v) => update("addressLine1", v)}
                  icon={MapPin}
                  placeholder="e.g. Building name, street number"
                />
                <Field
                  label="Address Line 2" // ✅ Changed from "Address Line 2" (already correct)
                  value={profile.addressLine2 ?? ""} // ✅ Changed from area
                  onChange={(v) => update("addressLine2", v)} // ✅ Changed from area
                  icon={MapPin}
                  placeholder="e.g. Business Bay, Al Barsha"
                />
                <Field
                  label="Landmark"
                  value={profile.landmark ?? ""}
                  onChange={(v) => update("landmark", v)}
                  icon={MapPin}
                  placeholder="e.g. Near Mall of the Emirates"
                />
                <Field
                  label="PO Box"
                  value={profile.poBox ?? ""}
                  onChange={(v) =>
                    update("poBox", sanitizeDigitsInput(v).slice(0, 10))
                  }
                  icon={Mail}
                  type="tel"
                  placeholder="e.g. 12345"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5">
            <label className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
              Service Cities <span className="text-red-500">*</span>
            </label>

            <div className="grid sm:grid-cols-3 gap-4">
              <SearchableSelectField
                label="Country"
                value={serviceCountryId}
                onChange={setServiceCountryId}
                options={locationCountries.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                }))}
                placeholder="Select country"
              />
              <SearchableSelectField
                label="State"
                value={serviceStateId}
                onChange={setServiceStateId}
                options={serviceStates.map((s) => ({
                  value: String(s.id),
                  label: s.name,
                }))}
                placeholder={
                  !serviceCountryId
                    ? "Select country first"
                    : serviceStatesLoading
                      ? "Loading..."
                      : serviceStates.length === 0
                        ? "No states found"
                        : "Select state"
                }
                disabled={!serviceCountryId || serviceStatesLoading}
              />
              <SearchableSelectField
                label="City"
                value=""
                onChange={(cityName) => {
                  toggleCity(cityName);
                }}
                options={serviceCityOptions
                  .filter((c) => !(profile.cities || []).includes(c.name))
                  .map((c) => ({ value: c.name, label: c.name }))}
                placeholder={
                  citiesLoading
                    ? "Loading..."
                    : !serviceCountryId
                      ? "Select country first"
                      : serviceCityOptions.length === 0
                        ? "No cities found"
                        : "Select city to add"
                }
                disabled={
                  citiesLoading ||
                  !serviceCountryId ||
                  serviceCityOptions.length === 0
                }
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 mb-3">
              Pick a country, state, then city to add it — repeat to add more
              cities (global coverage).
            </p>

            <div
              className={
                "flex flex-wrap items-center gap-2 w-full px-3 py-2.5 border rounded-xl bg-white min-h-[48px] " +
                (!profile.cities || profile.cities.length === 0
                  ? "border-red-300"
                  : "border-gray-200")
              }
            >
              <Globe size={13} className="text-gray-400 shrink-0" />
              {!profile.cities || profile.cities.length === 0 ? (
                <span className="text-sm text-red-400">
                  At least one service city is required
                </span>
              ) : null}
              {profile.cities
                ? profile.cities.map((cityName) => {
                    const cityData = allCities.find((c) => c.name === cityName);
                    return (
                      <span
                        key={cityName}
                        className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-medium"
                      >
                        {cityData?.countryName ? (
                          <span className="text-orange-400 text-[10px] font-semibold">
                            {cityData.countryName.substring(0, 3).toUpperCase()}
                          </span>
                        ) : null}
                        {cityName}
                        <button
                          type="button"
                          onClick={() => toggleCity(cityName)}
                          className="text-orange-400 hover:text-orange-600 hover:bg-orange-100 rounded-full p-0.5 transition-colors"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    );
                  })
                : null}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Daily Booking Capacity{" "}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={profile.capacityPerDay}
              onChange={(e) =>
                update("capacityPerDay", Math.max(1, Number(e.target.value)))
              }
              className={
                "w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 " +
                (!profile.capacityPerDay || profile.capacityPerDay < 1
                  ? "border-red-300"
                  : "border-gray-200")
              }
            />
            {!profile.capacityPerDay || profile.capacityPerDay < 1 ? (
              <p className="text-xs text-red-500 mt-1">
                Capacity must be at least 1
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Business Description
          </label>
          <textarea
            value={profile.about ?? ""}
            onChange={(e) => update("about", e.target.value.slice(0, 500))}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
          />
          <p
            className={
              "text-xs mt-1 text-right " +
              ((profile.about ?? "").length >= 500
                ? "text-red-500"
                : "text-gray-400")
            }
          >
            {(profile.about ?? "").length}/500 characters
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Work & Compensation" icon={BadgeCheck}>
        {profile.vendorType === "FREELANCER" ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <SearchableSelectField
              label="Contract Type"
              value={profile.contractType ?? ""}
              onChange={(v) => update("contractType", v)}
              options={[
                { value: "hourly", label: "Hourly" },
                { value: "monthly", label: "Monthly" },
                { value: "project", label: "Per Project" },
              ]}
              placeholder="Select contract type"
            />
            <Field
              label="Hourly / Monthly Rate (AED)"
              value={profile.hourlyRate?.toString() ?? ""}
              onChange={(v) => {
                const cleaned = sanitizePositiveNumber(v);
                update("hourlyRate", cleaned === "" ? null : Number(cleaned));
              }}
              type="text"
              icon={CreditCard}
              error={
                validationErrors.hourlyRate ||
                (profile.hourlyRate !== null &&
                profile.hourlyRate !== undefined &&
                profile.hourlyRate <= 0
                  ? "Rate must be greater than 0"
                  : undefined)
              }
            />
            <Field
              label="Available Hours per Week"
              value={profile.availableHoursPerWeek?.toString() ?? ""}
              onChange={(v) => {
                const cleaned = sanitizePositiveNumber(v);
                update(
                  "availableHoursPerWeek",
                  cleaned === "" ? null : Number(cleaned),
                );
              }}
              type="text"
              icon={CalendarClock}
              error={
                profile.availableHoursPerWeek !== null &&
                profile.availableHoursPerWeek !== undefined &&
                profile.availableHoursPerWeek <= 0
                  ? "Must be greater than 0"
                  : undefined
              }
            />
            <Field
              label="Project Rate (AED)"
              value={profile.projectRate?.toString() ?? ""}
              onChange={(v) => {
                const cleaned = sanitizePositiveNumber(v);
                update("projectRate", cleaned === "" ? null : Number(cleaned));
              }}
              type="text"
              icon={CreditCard}
              error={
                profile.projectRate !== null &&
                profile.projectRate !== undefined &&
                profile.projectRate <= 0
                  ? "Rate must be greater than 0"
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <SearchableSelectField
              label="Salary Type"
              value={profile.salaryType ?? ""}
              onChange={(v) => update("salaryType", v)}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
              ]}
              placeholder="Select salary type"
            />
            <Field
              label="Basic Salary (AED)"
              value={profile.basicSalary?.toString() ?? ""}
              onChange={(v) => {
                const cleaned = sanitizePositiveNumber(v);
                update("basicSalary", cleaned === "" ? null : Number(cleaned));
              }}
              type="text"
              icon={CreditCard}
              error={
                profile.basicSalary !== null &&
                profile.basicSalary !== undefined &&
                profile.basicSalary <= 0
                  ? "Salary must be greater than 0"
                  : undefined
              }
            />
            <Field
              label="Housing Allowance (AED)"
              value={profile.housingAllowance?.toString() ?? ""}
              onChange={(v) => {
                const cleaned = sanitizePositiveNumber(v);
                update(
                  "housingAllowance",
                  cleaned === "" ? null : Number(cleaned),
                );
              }}
              type="text"
              icon={LandmarkIcon}
              error={
                profile.housingAllowance !== null &&
                profile.housingAllowance !== undefined &&
                profile.housingAllowance <= 0
                  ? "Must be greater than 0"
                  : undefined
              }
            />
            <Field
              label="Transportation Allowance (AED)"
              value={profile.transportationAllowance?.toString() ?? ""}
              onChange={(v) => {
                const cleaned = sanitizePositiveNumber(v);
                update(
                  "transportationAllowance",
                  cleaned === "" ? null : Number(cleaned),
                );
              }}
              type="text"
              icon={MapPin}
              error={
                profile.transportationAllowance !== null &&
                profile.transportationAllowance !== undefined &&
                profile.transportationAllowance <= 0
                  ? "Must be greater than 0"
                  : undefined
              }
            />
            <Field
              label="Other Allowances (AED)"
              value={profile.otherAllowances?.toString() ?? ""}
              onChange={(v) => {
                const cleaned = sanitizePositiveNumber(v);
                update(
                  "otherAllowances",
                  cleaned === "" ? null : Number(cleaned),
                );
              }}
              type="text"
              icon={BadgeCheck}
              error={
                profile.otherAllowances !== null &&
                profile.otherAllowances !== undefined &&
                profile.otherAllowances <= 0
                  ? "Must be greater than 0"
                  : undefined
              }
            />
            <Field
              label="Annual Leaves (days)"
              value={profile.annualLeaves?.toString() ?? ""}
              onChange={(v) => {
                const cleaned = sanitizePositiveNumber(v);
                update("annualLeaves", cleaned === "" ? null : Number(cleaned));
              }}
              type="text"
              icon={CalendarClock}
              error={
                profile.annualLeaves !== null &&
                profile.annualLeaves !== undefined &&
                profile.annualLeaves <= 0
                  ? "Must be greater than 0"
                  : undefined
              }
            />
            <Field
              label="Working Hours per Week"
              value={profile.workingHours?.toString() ?? ""}
              onChange={(v) => {
                const cleaned = sanitizePositiveNumber(v);
                update("workingHours", cleaned === "" ? null : Number(cleaned));
              }}
              type="text"
              icon={CalendarClock}
              error={
                profile.workingHours !== null &&
                profile.workingHours !== undefined &&
                profile.workingHours <= 0
                  ? "Must be greater than 0"
                  : undefined
              }
            />
            <DateField
              label="Joining Date"
              value={profile.joiningDate?.slice(0, 10) ?? ""}
              onChange={(v) => update("joiningDate", v)}
              icon={CalendarClock}
              allowPast
            />
          </div>
        )}
      </SectionCard>

      <SectionCard title="Legal & Compliance" icon={FileText}>
        <div className="grid sm:grid-cols-2 gap-4">
          {profile.vendorType !== "FREELANCER" ? (
            <>
              <Field
                label="Trade License Number"
                value={profile.tradeLicenseNumber ?? ""}
                icon={FileText}
                readOnly
              />
              <DateField
                label="Trade License Expiry"
                value={profile.tradeLicenseExpiry?.slice(0, 10) ?? ""}
                onChange={(v) => update("tradeLicenseExpiry", v)}
                icon={FileText}
              />
              <FileUploadField
                label="Trade License File"
                fileUrl={profile.tradeLicenseFileUrl}
                folder="vendor-docs"
                maxSizeMb={3}
                readOnly
                onUploaded={({ url, key }) => {
                  update("tradeLicenseFileUrl", url);
                  update("tradeLicenseFileKey", key);
                }}
              />
            </>
          ) : null}
          <Field
            label="VAT Number"
            value={profile.vatNumber ?? ""}
            onChange={(v) => update("vatNumber", v)}
            icon={FileText}
          />
          <SearchableSelectField
            label="Visa Type"
            value={profile.visaType ?? ""}
            onChange={(v) => update("visaType", v)}
            icon={Shield}
            options={visaTypes}
            placeholder="Select visa type"
          />
          <DateField
            label="Passport Expiry"
            value={profile.passportExpiry?.slice(0, 10) ?? ""}
            onChange={(v) => update("passportExpiry", v)}
          />
          <FileUploadField
            label="Passport File"
            fileUrl={profile.passportFileUrl}
            folder="vendor-docs"
            maxSizeMb={3}
            onUploaded={({ url, key }) => {
              update("passportFileUrl", url);
              update("passportFileKey", key);
            }}
          />
          <DateField
            label="Emirates ID Expiry"
            value={profile.emiratesIdExpiry?.slice(0, 10) ?? ""}
            onChange={(v) => update("emiratesIdExpiry", v)}
            icon={BadgeCheck}
          />
        </div>
      </SectionCard>

      <SectionCard title="Plan & Commission" icon={CalendarClock}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Active Plan"
            value={profile.planDetails ?? ""}
            onChange={(v) => update("planDetails", v)}
            icon={BadgeCheck}
          />
          <Field
            label="Commission %"
            value={profile.commissionPercent ?? ""}
            onChange={(v) => {
              if (v === "") {
                update("commissionPercent", "");
                return;
              }
              const num = Math.min(100, Math.max(0, Number(v)));
              update("commissionPercent", String(Number.isNaN(num) ? 0 : num));
            }}
            type="number"
            min="0"
            max="100"
            icon={Percent}
          />
          <DateField
            label="Plan Expiry"
            value={profile.planExpiry?.slice(0, 10) ?? ""}
            onChange={(v) => update("planExpiry", v)}
          />
          <FileUploadField
            label="Agreement File"
            fileUrl={profile.agreementFileUrl}
            folder="agreements"
            maxSizeMb={5}
            onUploaded={({ url, key }) => {
              update("agreementFileUrl", url);
              update("agreementFileKey", key);
            }}
          />
        </div>
      </SectionCard>

      <SectionCard title="Bank Details" icon={LandmarkIcon}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Bank Name"
            value={profile.bankName ?? ""}
            onChange={(v) => update("bankName", v)}
            icon={LandmarkIcon}
          />
          <Field
            label="Account Name"
            value={profile.accountFullName ?? ""}
            onChange={(v) => update("accountFullName", v)}
            icon={User}
          />
          <Field
            label="Account Number"
            value={profile.accountNumber ?? ""}
            onChange={(v) =>
              update("accountNumber", sanitizeDigitsInput(v).slice(0, 20))
            }
            type="tel"
            icon={CreditCard}
          />
          <Field
            label="IBAN"
            value={profile.ibanNo ?? ""}
            onChange={(v) => update("ibanNo", v)}
            icon={CreditCard}
          />
          <Field
            label="SWIFT / BIC"
            value={profile.swift ?? ""}
            onChange={(v) => update("swift", v)}
            icon={Globe}
          />
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Branch Address
            </label>
            <div className="relative">
              <MapPin
                size={13}
                className="absolute left-3 top-3 text-gray-400"
              />
              <textarea
                value={profile.branchAddress ?? ""}
                onChange={(e) =>
                  update("branchAddress", e.target.value.slice(0, 500))
                }
                rows={3}
                maxLength={500}
                placeholder="Full branch address (street, area, city, PO box)"
                className="w-full py-2.5 pl-9 pr-4 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 resize-none leading-relaxed"
              />
            </div>
            <p
              className={
                "text-xs mt-1 text-right " +
                ((profile.branchAddress ?? "").length >= 500
                  ? "text-red-500"
                  : "text-gray-400")
              }
            >
              {(profile.branchAddress ?? "").length}/500 characters
            </p>
          </div>
        </div>
      </SectionCard>

      <ChangePasswordCard />

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-3.5 rounded-2xl font-semibold transition-colors"
      >
        {saving ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Save size={18} />
        )}
        {saving ? "Saving..." : "Save Changes"}
      </button>

      {showPhoto && profile.vendorProfileImage ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPhoto(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-3 max-w-sm w-full">
            <button
              onClick={() => setShowPhoto(false)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
            <img
              src={profile.vendorProfileImage}
              alt={profile.companyName}
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
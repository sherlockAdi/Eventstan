import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          <div className="col-span-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
              <Link href="/" className="flex items-center shrink-0">
                <Image
                  src="/eventstan-logo-white.png"
                  alt="EventStan Logo"
                  width={180}
                  height={48}
                  className="rounded-lg w-auto h-auto"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </Link>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mx-auto sm:mx-0">
              Your one-stop marketplace for premium event services. Find the
              perfect vendors for your special occasions.
            </p>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/services", label: "Browse Services" },
                { href: "/event-types", label: "Event Types" },
                { href: "/promotions", label: "Promotions" },
                { href: "/blog", label: "Blog" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-orange-400 transition-colors block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/contact", label: "Contact" },
                { href: "/bookings", label: "My Bookings" },
                { href: "/vendor-dashboard", label: "Vendor Portal" },
                { href: "/about", label: "About Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-orange-400 transition-colors block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="break-all">
                <a href="mailto:hello@eventstan.com" className="hover:text-orange-400 transition-colors">
                  hello@eventstan.com
                </a>
              </li>
              <li>
                <a href="tel:+15550000000" className="hover:text-orange-400 transition-colors">
                  +1 (555) 000-0000
                </a>
              </li>
              <li className="pt-2">
                <div className="flex justify-center sm:justify-start gap-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    aria-label="Facebook"
                  >
                    <FaFacebook className="w-4 h-4 text-white" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    aria-label="Twitter"
                  >
                    <FaTwitter className="w-4 h-4 text-white" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="w-4 h-4 text-white" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin className="w-4 h-4 text-white" />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-xs sm:text-sm text-center">
          © {new Date().getFullYear()} EventStan. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
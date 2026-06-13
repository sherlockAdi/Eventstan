// import Link from "next/link";

// export default function Footer() {
//   return (
//     <footer className="bg-gray-950 text-gray-400">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           <div className="col-span-1">
//             <div className="flex items-center gap-2 mb-4">
//               <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
//                 <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
//                 </svg>
//               </div>
//               <span className="text-xl font-bold text-white">EventStan</span>
//             </div>
//             <p className="text-sm leading-relaxed">
//               Your one-stop marketplace for premium event services. Find the perfect vendors for your special occasions.
//             </p>
//           </div>

//           <div>
//             <h4 className="text-white font-semibold mb-4">Categories</h4>
//             <ul className="space-y-2 text-sm">
//               {["Venues", "Decor", "Catering", "Entertainment"].map((cat) => (
//                 <li key={cat}>
//                   <Link href={`/services?category=${cat.replace("s","")}`} className="hover:text-orange-400 transition-colors">
//                     {cat}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div>
//             <h4 className="text-white font-semibold mb-4">Quick Links</h4>
//             <ul className="space-y-2 text-sm">
//               {[
//                 { href: "/services", label: "Browse Services" },
//                 { href: "/packages", label: "Packages" },
//                 { href: "/bookings", label: "My Bookings" },
//                 { href: "/vendor-dashboard", label: "Vendor Portal" },
//                 { href: "/about", label: "About Us" },
//               ].map((link) => (
//                 <li key={link.href}>
//                   <Link href={link.href} className="hover:text-orange-400 transition-colors">
//                     {link.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div>
//             <h4 className="text-white font-semibold mb-4">Contact</h4>
//             <ul className="space-y-2 text-sm">
//               <li>hello@eventstan.com</li>
//               <li>+1 (555) 000-0000</li>
//               <li className="pt-2">
//                 <div className="flex gap-3">
//                   {["twitter", "instagram", "linkedin"].map((s) => (
//                     <a key={s} href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
//                       <span className="sr-only">{s}</span>
//                       <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
//                       </svg>
//                     </a>
//                   ))}
//                 </div>
//               </li>
//             </ul>
//           </div>
//         </div>

//         <div className="border-t border-gray-800 mt-10 pt-6 text-sm text-center">
//           © {new Date().getFullYear()} EventStan. All rights reserved.
//         </div>
//       </div>
//     </footer>
//   );
// }

import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Grid: 1 column on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand Section */}
          <div className="col-span-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
              {/* <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">EventStan</span> */}
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

          {/* Categories Section */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">
              Categories
            </h4>
            <ul className="space-y-3 text-sm">
              {["Venues", "Decor", "Catering", "Entertainment"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/services?category=${cat.replace(/s$/, "")}`}
                    className="hover:text-orange-400 transition-colors block py-0.5"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links Section */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/services", label: "Browse Services" },
                { href: "/packages", label: "Packages" },
                { href: "/bookings", label: "My Bookings" },
                { href: "/vendor-dashboard", label: "Vendor Portal" },
                { href: "/about", label: "About Us" },
                // { href: "/contact", label: "Contact" },
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

          {/* Contact Section */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="break-all">hello@eventstan.com</li>
              <li>+1 (555) 000-0000</li>
              <li className="pt-2">
                <div className="flex justify-center sm:justify-start gap-4">
                  <a
                    href="#"
                    className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    aria-label="Facebook"
                  >
                    <FaFacebook className="w-4 h-4 text-white" />
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    aria-label="Twitter"
                  >
                    <FaTwitter className="w-4 h-4 text-white" />
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="w-4 h-4 text-white" />
                  </a>
                  <a
                    href="#"
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

        {/* Copyright Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-xs sm:text-sm text-center">
          © {new Date().getFullYear()} EventStan. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import CartDrawer from "@/components/ui/CartDrawer";
import { CartProvider } from "@/lib/CartContext";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata: Metadata = {
  title: "EventStan - Find Perfect Event Vendors",
  description: "Your one-stop marketplace for premium event services",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // #region agent log
  fetch('http://127.0.0.1:7390/ingest/a3e994ce-a9eb-43f3-b313-113a0ac6b299',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'55dc61'},body:JSON.stringify({sessionId:'55dc61',runId:'pre-fix',hypothesisId:'H-C',location:'src/app/layout.tsx:RootLayout',message:'RootLayout rendered (server)',data:{},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="bg-white font-sans antialiased" suppressHydrationWarning={true}>
        <AuthProvider>
          <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
        </AuthProvider>
        
      </body>
    </html>
  );
}

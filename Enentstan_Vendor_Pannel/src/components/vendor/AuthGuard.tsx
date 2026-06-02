'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Login page is always public
    if (pathname === '/vendor/login') {
      setChecking(false);
      return;
    }

    if (!isLoggedIn()) {
      router.replace('/vendor/login');
    } else {
      setChecking(false);
    }
  }, [pathname, router]);

  if (checking && pathname !== '/vendor/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={28} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return <>{children}</>;
}

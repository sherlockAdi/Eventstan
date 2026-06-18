"use client";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Tab = "personal" | "bookings";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("personal");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [gender,    setGender]    = useState("");
  const [dob,       setDob]       = useState("");
  const [saving,    setSaving]    = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const parts = user.name.trim().split(" ");
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" ") ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg className="w-8 h-8 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    );
  }

  const avatarColor = ["bg-orange-500","bg-blue-500","bg-green-500","bg-purple-500","bg-pink-500"][user.name.charCodeAt(0) % 5];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast.success("Profile updated successfully!", {
      style: { borderRadius: "12px", fontWeight: "600" },
    });
  };

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    toast.success("Logged out successfully!", {
      icon: "👋",
      style: { borderRadius: "12px", fontWeight: "600" },
    });
    router.push("/");
  };

  const navItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "personal",
      label: "Personal Info",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
    },
    {
      key: "bookings",
      label: "My Bookings",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
    },
  ];

  const SidebarContent = () => (
    <>
      <div className="flex flex-col items-center py-6 px-4 border-b border-gray-100">
        <div className={`w-16 h-16 ${avatarColor} rounded-full flex items-center justify-center text-white text-xl font-bold mb-3`}>
          {user.avatar}
        </div>
        <p className="font-bold text-gray-900 text-sm text-center truncate w-full">{user.name}</p>
        <p className="text-xs text-gray-400 truncate w-full text-center">{user.email}</p>
      </div>

      <nav className="py-2">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => { setTab(item.key); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all text-left
              ${tab === item.key
                ? "text-orange-500 bg-orange-50 border-r-2 border-orange-500"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <button
          onClick={() => { setSidebarOpen(false); setShowLogoutModal(true); }}
          className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-all text-left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Logout
        </button>
      </nav>
    </>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-5xl mx-auto">

          <div className="flex items-center gap-3 mb-4 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              Menu
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                {user.avatar}
              </div>
              <span className="font-semibold text-gray-900 text-sm">{user.name}</span>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <aside className="hidden md:block w-56 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
              <SidebarContent />
            </aside>

            <div className="flex-1 min-w-0">
              {tab === "personal" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="px-4 sm:px-8 py-5 border-b border-gray-100 flex items-center gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                      {user.avatar}
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs sm:text-sm">Hello, {firstName}</p>
                      <h1 className="text-lg sm:text-xl font-bold text-gray-900">Welcome to your Profile</h1>
                    </div>
                  </div>

                  <form onSubmit={handleSave} className="px-4 sm:px-8 py-6">
                    <div className="border-l-2 border-orange-400 pl-4 sm:pl-6 space-y-4 sm:space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
                        <label className="sm:w-28 flex-shrink-0 text-sm text-gray-600 font-medium">First Name</label>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
                        <label className="sm:w-28 flex-shrink-0 text-sm text-gray-600 font-medium">Last Name</label>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
                        <label className="sm:w-28 flex-shrink-0 text-sm text-gray-600 font-medium">Email</label>
                        <input type="email" value={email} readOnly
                          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 bg-gray-50 focus:outline-none"/>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
                        <label className="sm:w-28 flex-shrink-0 text-sm text-gray-600 font-medium">Mobile</label>
                        <div className="flex-1 flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                          <div className="flex items-center gap-1.5 px-3 border-r border-gray-200 bg-gray-50 py-2.5 flex-shrink-0">
                            <span className="text-base">🇦🇪</span>
                            <span className="text-xs text-gray-500">+971</span>
                          </div>
                          <input type="tel" value={phone} placeholder="500000000" onChange={e => setPhone(e.target.value)}
                            className="flex-1 px-3 py-2.5 text-sm text-gray-900 focus:outline-none bg-white min-w-0"/>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
                        <label className="sm:w-28 flex-shrink-0 text-sm text-gray-600 font-medium">Gender</label>
                        <select value={gender} onChange={e => setGender(e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white">
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not">Prefer not to say</option>
                        </select>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
                        <label className="sm:w-28 flex-shrink-0 text-sm text-gray-600 font-medium">Date of Birth</label>
                        <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button type="submit" disabled={saving}
                        className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 sm:px-8 py-2.5 rounded-lg text-sm transition-all disabled:opacity-60 flex items-center gap-2 w-full sm:w-auto justify-center">
                        {saving
                          ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</>
                          : "Update Profile"
                        }
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {tab === "bookings" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-8 py-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">My Bookings</h2>
                  <div className="text-center py-12 sm:py-16">
                    <svg className="w-14 h-14 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p className="font-medium text-gray-500">No bookings yet</p>
                    <p className="text-sm mt-1 text-gray-400">Your event bookings will appear here.</p>
                    <a href="/services" className="inline-block mt-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                      Browse Services
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-2xl md:hidden overflow-y-auto">
            <div className="flex justify-end p-4">
              <button onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <SidebarContent />
          </div>
        </>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-1">Logout?</h2>
            <p className="text-sm text-gray-500 text-center mb-6">Are you sure you want to logout from your account?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm font-bold transition-colors">
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
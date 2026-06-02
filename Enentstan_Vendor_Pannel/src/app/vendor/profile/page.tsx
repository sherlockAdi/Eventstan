'use client';

import { useState } from 'react';
import { Camera, Save, MapPin, Phone, Mail, Globe, Star, Shield, Bell } from 'lucide-react';

const categories = ['Venue', 'Catering', 'Decoration', 'Entertainment', 'Photography'];

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    businessName: 'Elite Spaces UAE',
    ownerName: 'Ahmed Al-Mansouri',
    email: 'hello@elitespacesuae.com',
    phone: '+971 50 123 4567',
    website: 'www.elitespacesuae.com',
    location: 'Dubai, UAE',
    description: 'Premium event venue and decoration specialists serving the UAE for over 10 years. We offer stunning ballrooms, garden settings, and world-class decoration services.',
    categories: ['Venue', 'Decoration'],
    cancellationPolicy: 'Refund available if cancelled 7+ days before event. 50% refund for 3-7 days. No refund within 3 days.',
    whatsapp: '+971 50 123 4567',
  });

  const [notifications, setNotifications] = useState({
    newBookings: true,
    bookingReminders: true,
    paymentAlerts: true,
    marketingEmails: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleCategory = (cat: string) => {
    setProfile(p => ({
      ...p,
      categories: p.categories.includes(cat) ? p.categories.filter(c => c !== cat) : [...p.categories, cat],
    }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your business profile and preferences</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-800 text-sm font-medium flex items-center gap-2">
          <Shield size={16} /> Profile saved successfully!
        </div>
      )}

      {/* Profile Photo */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"> Business Profile</h2>
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-2xl">
              ES
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors">
              <Camera size={12} />
            </button>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile.businessName}</p>
            <p className="text-sm text-gray-500">Verified Vendor</p>
            <div className="flex items-center gap-1 mt-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
              <span className="text-xs text-gray-500 ml-1">4.8 · 23 reviews</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Business Name', key: 'businessName', icon: null },
            { label: 'Owner Name', key: 'ownerName', icon: null },
            { label: 'Email Address', key: 'email', icon: Mail },
            { label: 'Phone Number', key: 'phone', icon: Phone },
            { label: 'Website', key: 'website', icon: Globe },
            { label: 'Location', key: 'location', icon: MapPin },
            { label: 'WhatsApp', key: 'whatsapp', icon: Phone },
          ].map(({ label, key, icon: Icon }) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
              <div className="relative">
                {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                <input
                  type="text"
                  value={profile[key as keyof typeof profile] as string}
                  onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                  className={`w-full py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 ${Icon ? 'pl-9 pr-4' : 'px-4'}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Business Description</label>
          <textarea
            value={profile.description}
            onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{profile.description.length}/500 characters</p>
        </div>
      </div>

      {/* Categories */}
      {/* <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Service Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                ${profile.categories.includes(cat) ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div> */}

      {/* Cancellation Policy */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2"><Shield size={16} className="text-orange-500" /> Cancellation Policy</h2>
        <p className="text-xs text-gray-500 mb-3">This will be shown to customers before booking. Platform governance applies.</p>
        <textarea
          value={profile.cancellationPolicy}
          onChange={e => setProfile(p => ({ ...p, cancellationPolicy: e.target.value }))}
          rows={3}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 resize-none"
        />
      </div>

      {/* Notifications */}
      {/* <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Bell size={16} className="text-orange-500" /> Notification Preferences</h2>
        <div className="space-y-4">
          {[
            { key: 'newBookings', label: 'New Booking Requests', desc: 'Get notified when a customer requests a booking' },
            { key: 'bookingReminders', label: 'Booking Reminders', desc: 'Reminders about upcoming events 48 hrs before' },
            { key: 'paymentAlerts', label: 'Payment Alerts', desc: 'Alerts for payments, refunds, and settlements' },
            { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Tips, platform updates, and promotional content' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, [key]: !n[key as keyof typeof notifications] }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </div> */}

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-2xl font-semibold transition-colors"
      >
        <Save size={18} /> Save All Changes
      </button>
    </div>
  );
}

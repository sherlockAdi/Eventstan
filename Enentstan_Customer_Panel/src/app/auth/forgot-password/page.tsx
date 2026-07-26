"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { customerApi } from "@/api/customerApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSent(false);
    try {
      await customerApi.auth.forgotPassword(email.trim());
      setSent(true);
      toast.success("Reset instructions sent if the account exists.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl border border-orange-100 p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-orange-500 uppercase tracking-[0.3em]">EventStan</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Forgot password</h1>
          <p className="mt-2 text-sm text-gray-500">Enter your email and we&apos;ll send a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              placeholder="you@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {sent && <p className="mt-4 text-sm text-green-600">If the account exists, the email has been sent.</p>}

        <div className="mt-6 text-center text-sm text-gray-500">
          <Link href="/auth/login" className="font-semibold text-orange-500 hover:text-orange-600">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
